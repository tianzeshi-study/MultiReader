import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';  // 使用 useHistory
import { handleFiles, fetchBook } from '../data/file';
import { db, BookStorage } from '../data/database';



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

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h2>Imported Books</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Total Pages</th>
            <th>progress Pages</th>
            <th>Size (MB)</th>
            <th>Imported At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.book_id}>
              <td>

                <span
                  style={{ color: 'blue', cursor: 'pointer' }}
                  onClick={() => handleBookClick(book.book_id)}  // 添加点击事件处理
                >
                  {book.name}
                </span>

        
              </td>
              <td>{book.totalPage}</td>
              <td>{book.progressPage ? book.progressPage+1: 0}</td>
              <td>{(book.size / (1024 * 1024)).toFixed(2)}</td>
              <td>{new Date(book.importedAt).toLocaleString()}</td>
              <td>{book.updatedAt ? new Date(book.updatedAt).toLocaleString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    

    
  );
};

export default Bookshelf;
