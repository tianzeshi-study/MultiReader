import React from 'react';
import {DataStorage,  BookStorage, db } from '../data/database';
import {addData}  from '../data/file';

interface CreateBook {
  book_id: string
  name: string
  size: number
  imported_at: number
  updated_at?: number
  progress_page?: number
  total_page: number,
  book_data: string[]
}

interface UpdateBook {
  book_id: string
  updated_at?: number
  progress_page?: number
}

interface  ReceiveBook    {
    id: number,
    belong_to: number,
    book_id: string,      
    name: string,
    size: number,
    imported_at: number,
    updated_at: number,              
    progress_page: number,           
    total_page: number,
}

    const api_url = 'http://localhost:3000/books';
const SyncButton: React.FC = () => {
  


const handleSync = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        return 
            };
const remotePromise: Promise<ReceiveBook[]> = fetchBooks(token ) ||  [];

  // --- 本地数据库查询 ---
  const localPromise = db.books.toArray().catch(err => {
    console.error('Error querying local db:', err);
    return []; // 如果查询出错，则以空数组处理
  });

  // 并行执行两个异步任务
  const [remoteBooksRaw, localBooksRaw] = await Promise.all([remotePromise, localPromise]);
  // 如果任一端为空，使用空数组确保全量同步
  const remoteBooks: ReceiveBook[] = remoteBooksRaw || [];
  const localBooks: BookStorage[] = localBooksRaw || [];


  // --- 构建 Map 便于查找（根据 id） ---
  const remoteMap = new Map(remoteBooks.map(book => [book.book_id, book]));
  const localMap = new Map(localBooks.map(book => [book.book_id, book]));

  // --- 1. 本地有而远程没有的：上传到远程 ---
  const localNewBooks = localBooks.filter(book => !remoteMap.has(book.book_id));
  console.log("localNewBooks", localNewBooks);
  for (const book of localNewBooks) {
      const bookdata = await db.filesData.get(book.book_id);
      if (!bookdata) {
          return
      };
      const createBook: CreateBook =  {
          book_id: book.book_id,
name:book.name,
size: book.size,
imported_at: book.importedAt,
updated_at: book.updatedAt || 0,
progress_page: book.progressPage|| 0 ,
total_page:book.totalPage,
book_data: bookdata.data
      };
      console.log("createBook",createBook);
    try {
      const response = await fetch(api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(createBook)
      });
      if (response.ok) {
        console.log(`Posted local new book ${book.book_id} to remote.`);
      } else {
        console.error(`Failed to post local new book ${book.book_id}:`, await response.text());
      }
    } catch (err) {
      console.error(`Error posting local new book ${book.book_id}:`, err);
    }
  }

  // --- 2. 远程有而本地没有的：保存到本地数据库 ---
  const remoteNewBooks = remoteBooks.filter(book => !localMap.has(book.book_id));
  console.log("remoteNewBooks", remoteNewBooks)
  for (const book of remoteNewBooks) {
      const bookStorage: BookStorage = {
          book_id: book.book_id,
          name: book.name,
  size: book.size,
  importedAt: book.imported_at,
  updatedAt: book.updated_at,
  progressPage: book.progress_page,
  totalPage: book.total_page
      };
      console.log("bookStorage", bookStorage);
    try {
        const bookdata = await fetchBookdata(token, book.book_id);
        await addData(book.book_id, bookdata.data);
      await db.books.add(bookStorage);
      console.log(`Added remote new book ${book.id} to local DB.`);
    } catch (err) {
      console.error(`Error adding remote new book ${book.id} to local DB:`, err);
    }
  }

  // --- 3. 两端都存在的书籍：检查数据是否更新 ---
  // 遍历两边共有的书籍id
  const commonBookIds = remoteBooks
    .filter(book => localMap.has(book.book_id))
    .map(book => book.book_id);

  for (const id of commonBookIds) {
    const remoteBook = remoteMap.get(id);
    const localBook = localMap.get(id);

    // 如果任意一侧数据为空（虽然一般不会出现），直接跳过或根据业务需求处理
    if (!remoteBook || !localBook) {
      console.warn(`Book ${id} missing on one side; skipping update.`);
      continue;
    }
    
    // 使用 updatedAt，如果没有则使用 importedAt 作为比较依据
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
  totalPage: remoteBook.total_page
          };
        await db.books.put(bookStorage);
        console.log(`Updated local book ${id} with remote changes.`);
      } catch (err) {
        console.error(`Error updating local book ${id}:`, err);
      }
    } else if (localTime > remoteTime) {
      // 本地数据较新，更新远程数据（ PUT /book 接口更新远程数据）
      const updateBook: UpdateBook = {
          book_id: localBook.book_id,
          updated_at: localBook.updatedAt,
          progress_page: localBook.progressPage
      }
      try {
        const response = await fetch(`${api_url}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          },
          body: JSON.stringify(updateBook)
        });
        if (response.ok) {
          console.log(`Updated remote book ${id} with local changes.`);
        } else {
          console.error(`Failed to update remote book ${id}:`, await response.text());
        }
      } catch (err) {
        console.error(`Error updating remote book ${id}:`, err);
      }
    } else {
      // 如果时间相等，认为数据一致
      console.log(`Book ${id} is up-to-date.`);
    }
  }
};

  return (
    <button onClick={handleSync}>
      同步图书数据
    </button>
  );
};



const fetchBooks = async (token: string) => {
try {
    const response = await fetch(api_url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 通过 Authorization 头传递 token，这里假设 token 使用 Bearer 方式
        'Authorization': `Bearer ${token}`
      }
    });
    
    // 获取返回的 JSON 对象
    const data = await response.json();
    console.log("receiveBook", data);
   return data;
} catch (error) {
    console.error('Error fetching books:', error);
 }
}


const fetchBookdata = async (token: string, book_id: string) => {

try {
    const response = await fetch(`${api_url}/${book_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 通过 Authorization 头传递 token，这里假设 token 使用 Bearer 方式
        'Authorization': `Bearer ${token}`
      }
    });
    
    // 获取返回的 JSON 对象
    const data = await response.json();
    console.log("receive Book data", data[0]);
   return data[0];
} catch (error) {
    console.error('Error fetching books:', error);
 }
}


export default SyncButton;
