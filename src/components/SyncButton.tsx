import React, { useState } from 'react';
import { IonButton, IonLoading, IonToast } from '@ionic/react';
import { DataStorage, BookStorage, db } from '../data/database';
import { addData } from '../data/file';


const base_url = import.meta.env.VITE_BASE_URL;
const api_url = `${base_url}/books`;

interface CreateBook {
  book_id: string;
  name: string;
  size: number;
  imported_at: number;
  updated_at?: number;
  progress_page?: number;
  total_page: number;
  book_data: string[];
}

interface UpdateBook {
  book_id: string;
  updated_at?: number;
  progress_page?: number;
}

interface ReceiveBook {
  id: number;
  belong_to: number;
  book_id: string;
  name: string;
  size: number;
  imported_at: number;
  updated_at: number;
  progress_page: number;
  total_page: number;
}

const SyncButton: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('同步成功');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');

  const handleSync = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setToastMessage("Token 不存在");
        setToastColor('danger');
        return;
      }

      // --- 获取远程数据 ---
      const remotePromise: Promise<ReceiveBook[]> = fetchBooks(token) || [];

      // --- 获取本地数据库数据 ---
      const localPromise = db.books.toArray().catch(err => {
        console.error('Error querying local db:', err);
        return []; // 查询出错返回空数组
      });

      // 并行执行两个异步任务
      const [remoteBooksRaw, localBooksRaw] = await Promise.all([
        remotePromise,
        localPromise,
      ]);
      const remoteBooks: ReceiveBook[] = remoteBooksRaw || [];
      const localBooks: BookStorage[] = localBooksRaw || [];

      // --- 构建 Map 便于查找 ---
      const remoteMap = new Map(remoteBooks.map(book => [book.book_id, book]));
      const localMap = new Map(localBooks.map(book => [book.book_id, book]));

      // --- 1. 本地有而远程没有的：上传到远程 ---
      const localNewBooks = localBooks.filter(
        book => !remoteMap.has(book.book_id)
      );
      console.log("localNewBooks", localNewBooks);
      for (const book of localNewBooks) {
        const bookdata = await db.filesData.get(book.book_id);
        if (!bookdata) {
          console.error(`缺少文件数据，book_id: ${book.book_id}`);
          continue;
        }
        const createBook: CreateBook = {
          book_id: book.book_id,
          name: book.name,
          size: book.size,
          imported_at: book.importedAt,
          updated_at: book.updatedAt || 0,
          progress_page: book.progressPage || 0,
          total_page: book.totalPage,
          book_data: bookdata.data,
        };
        console.log("createBook", createBook);
        try {
  const response = await fetch(api_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(createBook),
  });
  
  // 检查响应是否成功，如果不成功则抛出异常
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to post local new book ${book.book_id}: ${errorText}`);
  }
  
  console.log(`Posted local new book ${book.book_id} to remote.`);
} catch (err) {
  console.error(
    `Error posting local new book ${book.book_id}:`,
    err
  );
  setToastMessage(`${book.name} 同步失败, ${err}`);
  // throw err;
}

      }

      // --- 2. 远程有而本地没有的：保存到本地数据库 ---
      const remoteNewBooks = remoteBooks.filter(
        book => !localMap.has(book.book_id)
      );
      console.log("remoteNewBooks", remoteNewBooks);
      for (const book of remoteNewBooks) {
        const bookStorage: BookStorage = {
          book_id: book.book_id,
          name: book.name,
          size: book.size,
          importedAt: book.imported_at,
          updatedAt: book.updated_at,
          progressPage: book.progress_page,
          totalPage: book.total_page,
        };
        console.log("bookStorage", bookStorage);
        try {
          const bookdata = await fetchBookdata(token, book.book_id);
          await addData(book.book_id, bookdata.data);
          await db.books.add(bookStorage);
          console.log(`Added remote new book ${book.id} to local DB.`);
        } catch (err) {
          console.error(
            `Error adding remote new book ${book.id} to local DB:`,
            err
          );
        }
      }

      // --- 3. 两端都存在的书籍：检查数据是否更新 ---
      const commonBookIds = remoteBooks
        .filter(book => localMap.has(book.book_id))
        .map(book => book.book_id);

      for (const id of commonBookIds) {
        const remoteBook = remoteMap.get(id);
        const localBook = localMap.get(id);

        if (!remoteBook || !localBook) {
          console.warn(`Book ${id} missing on one side; skipping update.`);
          continue;
        }

        const remoteTime = remoteBook.updated_at || remoteBook.imported_at;
        const localTime = localBook.updatedAt || localBook.importedAt;

        if (remoteTime > localTime) {
          // 远程数据较新，更新本地数据
          try {
            const bookStorage: BookStorage = {
              book_id: remoteBook.book_id,
              name: remoteBook.name,
              size: remoteBook.size,
              importedAt: remoteBook.imported_at,
              updatedAt: remoteBook.updated_at,
              progressPage: remoteBook.progress_page,
              totalPage: remoteBook.total_page,
            };
            await db.books.put(bookStorage);
            console.log(
              `Updated local book ${id} with remote changes.`
            );
          } catch (err) {
            console.error(`Error updating local book ${id}:`, err);
          }
        } else if (localTime > remoteTime) {
          // 本地数据较新，更新远程数据
          const updateBook: UpdateBook = {
            book_id: localBook.book_id,
            updated_at: localBook.updatedAt,
            progress_page: localBook.progressPage,
          };
          try {
            const response = await fetch(api_url, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(updateBook),
            });
            if (response.ok) {
              console.log(
                `Updated remote book ${id} with local changes.`
              );
            } else {
              console.error(
                `Failed to update remote book ${id}:`,
                await response.text()
              );
            }
          } catch (err) {
            console.error(
              `Error updating remote book ${id}:`,
              err
            );
          }
        } else {
          console.log(`Book ${id} is up-to-date.`);
        }
      }

      // setToastMessage("同步成功");
      setToastColor("success");
    } catch (error) {
      console.error("同步过程中发生错误:", error);
      setToastMessage("同步过程中发生错误");
      setToastColor("danger");
    } finally {
      setLoading(false);
      setShowToast(true);
    }
  };

  return (
    <>
      <IonButton onClick={handleSync}>
        同步图书数据
      </IonButton>
      <IonLoading isOpen={loading} message="同步中，请稍候..." />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={20000}
        color={toastColor}
      />
    </>
  );
};

const fetchBooks = async (token: string) => {
  try {
    const response = await fetch(api_url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("receiveBook", data);
    return data;
  } catch (error) {
    console.error("Error fetching books:", error);
  }
};

const fetchBookdata = async (token: string, book_id: string) => {
  try {
    const response = await fetch(`${api_url}/${book_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("receive Book data", data[0]);
    return data[0];
  } catch (error) {
    console.error("Error fetching book data:", error);
  }
};

export const putUpdateBook = async (
  book_id: string,
  updated_at: number,
  progress_page: number
) => {
  const updateBook: UpdateBook = {
    book_id: book_id,
    updated_at: updated_at,
    progress_page: progress_page,
  };

  try {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    const response = await fetch(api_url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updateBook),
    });
    if (response.ok) {
      console.log(`Updated remote book ${book_id} with local changes.`);
    } else {
      console.error(
        `Failed to update remote book ${book_id}:`,
        await response.text()
      );
    }
  } catch (err) {
    console.error(`Error updating remote book ${book_id}:`, err);
  }
};

export default SyncButton;
