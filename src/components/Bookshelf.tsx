import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { handleFiles, fetchBook } from '../data/file';
import { db, BookStorage } from '../data/database';
import { liveQuery } from 'dexie';

interface BookItemProps {
  book: BookStorage;
  onDelete: (bookId: string) => void;
  onShare: (book: BookStorage) => void;
  onClick: (bookId: string) => void;
}

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
              详情
            </button>
            <button onClick={toggleActions} style={{ marginLeft: '5px' }}>
              关闭
            </button>
          </>
        ) : (
          <button onClick={toggleActions}>更多操作</button>
        )}
      </td>
    </tr>
  );
};

const Bookshelf: React.FC = () => {
  const [books, setBooks] = useState<BookStorage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

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
      const newBooks = await handleFiles(files);
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
        const newBooks = await handleFiles(files);
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
      const newBook = await fetchBook(url);
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

  // 实现删除图书的操作，同时更新数据库，liveQuery 同步回调会自动更新 UI
  const handleDeleteBook = async (bookId: string) => {
    try {
      await db.books.delete(bookId);
      await db.filesData.delete(bookId);
      // 无需手动调用 setBooks，因为 liveQuery 会更新状态
    } catch (error) {
      console.error('删除图书时发生错误：', error);
      setError('删除图书失败');
    }
  };

  const handleShareBook = (book: BookStorage) => {
    console.log('详情图书：', book);
    alert(`图书标识码：${book.name}:\n${book.book_id}`);
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
    </div>
  );
};

export default Bookshelf;
