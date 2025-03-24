import React from 'react';
import { BookStorage, db } from '../data/database';

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

const SyncButton: React.FC = () => {
    const api_url = 'http://localhost:3000/books';
  


const handleSync = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
        return 
            };
  // --- 封装 Worker 返回结果为 Promise ---
  const workerPromise: Promise<ReceiveBook[]> = new Promise((resolve, reject) => {
    // 注意：如果你使用打包工具（如 Vite、Webpack），请使用相应方式引入 worker 文件
    const worker = new Worker('worker.js');
    // 如有需要，可以传递其他参数，此处仅作 token 示例
    worker.postMessage({ token });
  
    worker.onmessage = (event) => {
      const { success, books, error } = event.data;
      if (success) {
        // 如果 books 为空，则返回空数组
        resolve(books || []);
      } else {
        reject(error);
      }
    };
  
    worker.onerror = (err) => {
      console.error('Worker encountered an error:', err);
      reject(err);
    };
  });

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
      // 本地数据较新，更新远程数据（假设 PUT /book/{id} 接口更新远程数据）
      try {
        const response = await fetch(`${api_url}${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
          },
          body: JSON.stringify(localBook)
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
    const response = await fetch('http://localhost:3000/books', {
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
export default SyncButton;
