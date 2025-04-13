import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';  // 使用 useHistory
import { handleFiles, fetchBook } from '../data/file';
import { db, BookStorage } from '../data/database';

// 定义 BookItem 子组件，用于控制单本书的操作（删除、共享等）
interface BookItemProps {
  book: BookStorage;
  onDelete: (bookId: string) => void;
  onShare: (book: BookStorage) => void;
  onClick: (bookId: string) => void;
}
/*
const BookItem: React.FC<BookItemProps> = ({ book, onDelete, onShare, onClick }) => {
  return (
    <tr>
      <td>
        <span
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => onClick(book.book_id)}
        >
          {book.name}
        </span>
      </td>
      <td>{book.totalPage}</td>
      <td>{book.progressPage ? book.progressPage + 1 : 0}</td>
      <td>{(book.size / (1024 * 1024)).toFixed(2)}</td>
      <td>{new Date(book.importedAt).toLocaleString()}</td>
      <td>{book.updatedAt ? new Date(book.updatedAt).toLocaleString() : 'N/A'}</td>
      <td>
        <button onClick={() => onDelete(book.book_id)} style={{ marginRight: '5px' }}>
          删除
        </button>
        <button onClick={() => onShare(book)}>
          共享
        </button>
      </td>
    </tr>
  );
};
*/
const BookItem: React.FC<BookItemProps> = ({ book, onDelete, onShare, onClick }) => {
  const [showActions, setShowActions] = useState<boolean>(false);

  const toggleActions = () => {
    setShowActions(!showActions);
  };

  return (
    <tr>
      <td>
        <span
          style={{ color: 'blue', cursor: 'pointer' }}
          onClick={() => onClick(book.book_id)}
        >
          {book.name}
        </span>
      </td>
      <td>{book.totalPage}</td>
      <td>{book.progressPage ? book.progressPage + 1 : 0}</td>
      <td>{(book.size / (1024 * 1024)).toFixed(2)}</td>
      <td>{new Date(book.importedAt).toLocaleString()}</td>
      <td>{book.updatedAt ? new Date(book.updatedAt).toLocaleString() : 'N/A'}</td>
      <td>
        {showActions ? (
          <>
            <button
              onClick={() => {
                onDelete(book.book_id);
                setShowActions(false);
              }}
              style={{ marginRight: '5px' }}
            >
              删除
            </button>
            <button
              onClick={() => {
                onShare(book);
                setShowActions(false);
              }}
            >
              共享
            </button>
            <button
              onClick={toggleActions}
              style={{ marginLeft: '5px' }}
            >
              关闭
            </button>
          </>
        ) : (
          <button onClick={toggleActions}>
            更多操作
          </button>
        )}
      </td>
    </tr>
  );
};
const Bookshelf: React.FC = () => {
  const [books, setBooks] = useState<BookStorage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();  // 使用 history hook

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const booksFromDb = await db.books.toArray();
      console.log("booksFromDb", booksFromDb);
      setBooks(booksFromDb);
    } catch (error) {
      setError('Failed to load books.');
      console.error(error);
    }
  };

  const onDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const files = event.dataTransfer.files;
    try {
      const newBooks = await handleFiles(files);
      setBooks((prevBooks) => [...prevBooks, ...newBooks]);
    } catch (error) {
      setError('Failed to import books.');
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
        const newBooks = await handleFiles(files);
        setBooks((prevBooks) => [...prevBooks, ...newBooks]);
      } catch (error) {
        setError('Failed to import books.');
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
      const newBook = await fetchBook(url);
      if (newBook) {
        setBooks((prevBooks) => {
          if (prevBooks.find(b => b.book_id === newBook.book_id)) {
            return prevBooks;
          }
          return [...prevBooks, newBook];
        });
      }
    } catch (error) {
      setError('Failed to fetch book.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleBookClick = (id: string) => {
    history.push(`/books/${id}`);  // 使用 history.push 进行路由跳转
  };

  // 实现删除图书的操作，同时更新数据库和组件状态
  const handleDeleteBook = async (bookId: string) => {
    try {
      await db.books.delete(bookId);
      await db.filesData.delete(bookId);
      setBooks(prevBooks => prevBooks.filter(book => book.book_id !== bookId));
    } catch (error) {
      console.error('删除图书时发生错误：', error);
      setError('删除图书失败');
    }
  };

  // 示例：实现图书共享功能，此处仅输出日志，可根据需要扩展功能
  const handleShareBook = (book: BookStorage) => {
    // 可使用 Web Share API 或者其他方式进行共享
    console.log('共享图书：', book);
    // 示例提示，可自行替换为弹窗或其他用户反馈方式
    alert(`共享图书：${book.name}`);
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
        Drag and drop books here, or click to select files.
        <input type="file" multiple onChange={onInputChange} style={{ marginTop: '10px' }} />
      </div>
      {/*
      <div>
        <input
          type="text"
          placeholder="Enter book URL"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleFetchBook((e.target as HTMLInputElement).value);
            }
          }}
        />
        <button onClick={() => handleFetchBook((document.querySelector('input[type="text"]') as HTMLInputElement).value)}>
          Fetch Book
        </button>
      </div>
*/}

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
    </div>
  );
};

export default Bookshelf;
