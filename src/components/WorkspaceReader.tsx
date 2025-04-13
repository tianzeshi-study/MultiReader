import React, { useState, useEffect, useCallback } from 'react';
import HtmlViewer from "./HtmlViewer";
import usePageJumper from '../hooks/usePageJumper'; // 导入自定义 Hook

// 统一使用包含 currentPage 的接口定义
interface BookInfo {
  bookName: string;
  bookPages: number;
  currentPage: number;
  bookData: string[];
}

// Add props interface
interface WorkspaceReaderProps {
  FileToHtmlComponent: React.FC<{
    onHtmlExtracted: (html: string) => void;
    onFileUploaded?: (file: File) => void;
    bookData?: string[];
  }>;
  bookData?: string[];
}

const WorkspaceReader: React.FC<WorkspaceReaderProps> = ({ FileToHtmlComponent, bookData }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [htmlArray, setHtmlArray] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  // 初始化 booksInfo 数组时包含 currentPage 初始值
  const [booksInfo, setBooksInfo] = useState<BookInfo[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState<number>(-1);

  useEffect(() => {
    return () => {
      console.log('WorkspaceReader unmounted, resetting state');
      setHtmlContent('');
      setHtmlArray([]);
      setBooksInfo([]);
    };
  }, []);

  const handleHtmlExtracted = useCallback((html: string) => {
    setHtmlArray(prevArray => [...prevArray, html]);
  }, []);

  const handleFileChange = (file: File) => {
    console.log("file changed", file.name);
    setBooksInfo(prevBooks => {
      const existingBookIndex = prevBooks.findIndex(book => book.bookName === file.name);
      if (existingBookIndex > -1) {
        // 如果书籍已存在，则切换到该书，同时后续可能通过 useEffect 恢复当前页数与数据
        console.log("update existing book", file.name);
        setCurrentBookIndex(existingBookIndex);
        return prevBooks;
      } else {
        // 如果书籍不存在，则添加新书籍，并将当前页设置为 0
        console.log("add new book", file.name);
        const newBook: BookInfo = { 
          bookName: file.name, 
          bookPages: 0, 
          currentPage: 0, 
          bookData: [] 
        };
        setCurrentBookIndex(prevBooks.length); // 新书的索引为当前数组末尾
        return [...prevBooks, newBook];
      }
    });
    // 上传新文件时，清空 htmlArray，并将当前页重置为 0
    setHtmlArray([]);
    setCurrentPage(0);
  };

  // 当 htmlArray 变化时，同步更新当前书籍的书页数据和总页数
  useEffect(() => {
    if (htmlArray.length > 0 && currentBookIndex !== -1) {
      console.log("htmlArray changed, update current book info");
      setHtmlContent(htmlArray[currentPage]);
      setBooksInfo(prevBooks => {
        return prevBooks.map((book, index) => {
          if (index === currentBookIndex) {
            return { 
              ...book, 
              bookPages: htmlArray.length, 
              bookData: htmlArray 
            };
          }
          return book;
        });
      });
    }
  }, [htmlArray, currentPage, currentBookIndex]);

  // 当页码变化时，更新显示内容，同时同步保存到 booksInfo
  useEffect(() => {
    if (htmlArray.length > 0) {
      setHtmlContent(htmlArray[currentPage]);
    }
    if (currentBookIndex !== -1) {
      setBooksInfo(prevBooks => {
        return prevBooks.map((book, index) => {
          if (index === currentBookIndex) {
            return { ...book, currentPage };
          }
          return book;
        });
      });
    }
  }, [currentPage, currentBookIndex, htmlArray]);

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < htmlArray.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const { jumpPage, handleJumpInputChange, handleJump } = usePageJumper({
    totalPages: htmlArray.length,
    onPageChange: setCurrentPage,
  });

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleJump();
    }
  };

  // 处理书籍切换操作，同时存储当前书的状态，再恢复目标书籍的阅读进度和数据
  const handleBookChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBookIndex = parseInt(event.target.value, 10);
    if (isNaN(selectedBookIndex)) return;

    console.log("切换书籍, 当前索引:", currentBookIndex, "目标索引:", selectedBookIndex);

    // 在切换书籍前保存当前书籍的最新状态
    if (currentBookIndex !== -1) {
      setBooksInfo(prevBooks => {
        const updatedBooks = [...prevBooks];
        updatedBooks[currentBookIndex] = {
          ...updatedBooks[currentBookIndex],
          // 更新当前书的页数和数据
          currentPage: currentPage,
          bookPages: htmlArray.length,
          bookData: htmlArray,
        };
        return updatedBooks;
      });
    }

    // 切换到目标书籍
    setCurrentBookIndex(selectedBookIndex);

    // 从目标书籍恢复历史数据和阅读页数
    setBooksInfo(prevBooks => {
      const targetBook = prevBooks[selectedBookIndex];
      if (targetBook) {
        // 若存在书籍数据，则切换回之前的阅读页数和数据，否则初始化为空
        setHtmlArray(targetBook.bookData);
        setCurrentPage(targetBook.currentPage);
      } else {
        setHtmlArray([]);
        setCurrentPage(0);
      }
      return prevBooks;
    });
  };

  // 当 currentBookIndex 发生改变时，可以通过 useEffect 来确保显示最新数据（例如当外部 booksInfo 更新后）
  useEffect(() => {
    if (currentBookIndex !== -1 && booksInfo[currentBookIndex]) {
      console.log("切换到书籍：", booksInfo[currentBookIndex].bookName);
      // 确保 htmlArray 与当前书籍数据保持一致
      const targetBookData = booksInfo[currentBookIndex].bookData;
      if (targetBookData && targetBookData.length > 0) {
        setHtmlArray(targetBookData);
        setCurrentPage(booksInfo[currentBookIndex].currentPage);
      } else {
        // 若数据为空则保持当前状态
        setHtmlArray([]);
        setCurrentPage(0);
      }
    }
  }, [currentBookIndex, booksInfo]);

  return (
    <div>
      <h1>书山有路你不走</h1>
      <FileToHtmlComponent
        onHtmlExtracted={handleHtmlExtracted}
        onFileUploaded={handleFileChange}
        bookData={bookData}
      />

      {/* 书籍选择下拉框 */}
      <div>
        <label htmlFor="book-select">选择书籍：</label>
        <select id="book-select" value={currentBookIndex} onChange={handleBookChange}>
          <option value={-1}>请选择书籍</option>
          {booksInfo.map((book, index) => (
            <option key={index} value={index}>
              {book.bookName} ({book.bookPages} 页, 当前第 {book.currentPage + 1} 页)
            </option>
          ))}
        </select>
      </div>

      {htmlContent && (
        <>
          <h2>学海无涯你闯进来</h2>
          <HtmlViewer htmlContent={htmlContent} />
          <div>
            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 0}>上一页</button>

            <input
              type="text"
              value={jumpPage}
              onChange={handleJumpInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`当前 ${currentPage + 1} / ${htmlArray.length}`}
            />

            <button onClick={() => handlePageChange('next')} disabled={currentPage === htmlArray.length - 1}>下一页</button>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceReader;
