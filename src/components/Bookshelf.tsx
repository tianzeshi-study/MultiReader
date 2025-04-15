import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { liveQuery } from 'dexie';
import {
  IonModal,
  IonButton,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonLoading,
} from '@ionic/react';

import { handleFiles, fetchBook } from '../data/file';
import { db, BookStorage } from '../data/database';
import BookItem from './BookItem';

const base_url = import.meta.env.VITE_BASE_URL;
interface SharingBook {
  book_id: string;
  valid_time: number;
}

const Bookshelf: React.FC = () => {
  const [books, setBooks] = useState<BookStorage[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // 处理文件和图书加载时的 loading 状态
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  // 添加分享操作的 loading 状态，以及 Modal 控制状态
  const [shareLoading, setShareLoading] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [shareToken, setShareToken] = useState<string>('');
  const [shareBookName, setShareBookName] = useState<string>('');

  // 使用 liveQuery 监听 db.books 的变化
  useEffect(() => {
    const subscription = liveQuery(() => db.books.toArray()).subscribe({
      next: (booksFromDb: BookStorage[]) => {
        console.log("booksFromDb", booksFromDb);
        setBooks(booksFromDb);
      },
      error: (error) => {
        console.error("Error fetching books:", error);
        setError('加载图书数据失败');
      },
    });

    // 组件卸载时取消订阅，防止内存泄漏
    return () => subscription.unsubscribe();
  }, []);

  const onDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const files = event.dataTransfer.files;
    try {
      await handleFiles(files);
      // 这里无需手动更新 state，liveQuery 会自动触发更新
    } catch (error) {
      setError('导入图书失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (files) {
      setLoading(true);
      try {
        await handleFiles(files);
        // 同上，liveQuery 自动更新 state
      } catch (error) {
        setError('导入图书失败');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFetchBook = async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetchBook(url);
      // 新书添加成功后，liveQuery 会监控到 db.books 表的变化从而自动更新 books 状态
    } catch (error) {
      setError('加载图书失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleBookClick = (id: string) => {
    history.push(`/books/${id}`);
  };

  // 删除图书操作
  const handleDeleteBook = async (bookId: string) => {
    try {
      await db.books.delete(bookId);
      await db.filesData.delete(bookId);
      // liveQuery 自动更新状态
    } catch (error) {
      console.error('删除图书时发生错误：', error);
      setError('删除图书失败');
    }
  };

  /**
   * 分享图书操作：
   * - 开始时显示 Ionic Loading；
   * - 请求生成分享 token；
   * - 请求返回后复制 token 到剪贴板，并展示 IonModal 显示 token 信息；
   * - IonModal 包含关闭按钮以结束对话框。
   */
  const handleShareBook = async (book: BookStorage) => {
    setShareLoading(true);
    setError(null);
    setShareBookName(book.name);
    
    try {
      const sharing_token = await createBookSharing(book.book_id, 60 * 60 * 24 * 7);
      if (sharing_token) {
          const token = `${book.book_id}?token=${sharing_token}`;
        // 将 token 复制到剪贴板
        try {
          await navigator.clipboard.writeText(token);
        } catch (err) {
          console.error('复制到剪贴板失败：', err);
        }
        setShareToken(token);
        setShareModalOpen(true);
      } else {
        setError('生成分享链接失败');
      }
    } catch (err) {
      setError('分享图书失败');
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          marginBottom: '20px',
        }}
      >
        将图书文件拖放到此区域，或点击选择文件。
        <input type="file" multiple onChange={onInputChange} style={{ marginTop: '10px' }} />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Imported Books</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Total Pages</th>
            <th>Progress Pages</th>
            <th>Size (MB)</th>
            <th>Imported At</th>
            <th>Updated At</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <BookItem
              key={book.book_id}
              book={book}
              onClick={handleBookClick}
              onDelete={handleDeleteBook}
              onShare={handleShareBook}
            />
          ))}
        </tbody>
      </table>

      {/* IonLoading 用于分享操作过程中的 Loading 状态 */}
      <IonLoading
        isOpen={shareLoading}
        message={'分享图书中...'}
        onDidDismiss={() => {}}
      />

      {/* IonModal 用于展示分享结果 */}
      <IonModal isOpen={shareModalOpen} onDidDismiss={() => setShareModalOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>分享图书</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>图书名称：<strong>{shareBookName}</strong></p>
          <p>分享链接已复制到剪贴板：</p>
          <p style={{ wordBreak: 'break-all' }}><strong>{shareToken}</strong></p>
          <IonButton expand="block" onClick={() => setShareModalOpen(false)}>
            关闭
          </IonButton>
        </IonContent>
      </IonModal>
    </div>
  );
};


const createBookSharing = async (
  book_id: string,
  valid_time: number
): Promise<string | undefined> => {
  const sharingBook: SharingBook = {
    book_id,
    valid_time,
  };

  try {
    const token = localStorage.getItem("jwt");
    if (!token) return;
    const response = await fetch(`${base_url}/books/sharing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(sharingBook),
    });
    if (response.ok) {
      console.log(`sharing remote book ${book_id} with local changes.`);
      const sharing_token = await response.json();
      // 假设返回的分享标识码为数组的第一个元素
      console.log("receive sharing token", sharing_token);
      return sharing_token;
    } else {
      console.error(
        `Failed to share remote book ${book_id}:`,
        await response.text()
      );
    }
  } catch (err) {
    console.error(`Error sharing remote book ${book_id}:`, err);
  }
};

export default Bookshelf;
