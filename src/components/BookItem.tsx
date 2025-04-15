import React, { useState, useEffect } from 'react';
import {BookStorage } from '../data/database';


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
              分享
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



export  default BookItem;