import React, { useState, useEffect } from 'react';
import HtmlViewer from "./HtmlViewer";
import FileToHtml from "./FileToHtml";
import usePageJumper from '../hooks/usePageJumper'; // 导入自定义 Hook



interface BookPageInfo {
  bookName: string;
  totalPages: number;
}

const PagesReader: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [htmlArray, setHtmlArray] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [booksPage, setBooksPage] = useState<BookPageInfo[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState<number>(0); // 修改：存储索引

    const handleHtmlExtracted = (html:string) => {
        setHtmlArray(prevArray => [...prevArray, html]);
    }

const handleFileChange = (file:File) => {
        console.log("file changed", file.name);
        // 更新书籍页数信息
        setBooksPage(prevBooks => {
          const existingBookIndex = prevBooks.findIndex(book => book.bookName === file.name);
          if (existingBookIndex > -1) {
            // 如果书籍已存在，则更新页数 (这里假设每次上传都会重置该书的页数)
            const updatedBooks = [...prevBooks];
            updatedBooks[existingBookIndex] = { bookName: file.name, totalPages: 0 }; // 初始为0，后续根据 htmlArray 更新
            return updatedBooks;
          } else {
            // 如果书籍不存在，则添加新书籍
            return [...prevBooks, { bookName: file.name, totalPages: 0 }];
          }
        });
    }

    /*
    const handleFileChange = (file:File) => {
        console.log("file changed", file.name);
      setBooksPage(prevBooks => {
        return prevBooks.map((book, index) => {
            console.log(book, index);
          if (index === currentBookIndex) { // 修改：根据索引比较
            return { ...book, totalPages: htmlArray.length };
          }
          return book;
        });
      });
}
*/

  useEffect(() => {
    // console.log(htmlArray.length);
    if (htmlArray.length > 0) {
      setHtmlContent(htmlArray[currentPage]);

      // 更新当前书籍的总页数
      setBooksPage(prevBooks => {
        return prevBooks.map((book, index) => {
          // if (index === currentBookIndex) { // 修改：根据索引比较
            // return { ...book, totalPages: htmlArray.length };
          // }
          // return book;
          if (index > 0) { // 修改：根据索引比较
          return { ...book, totalPages: (htmlArray.length - booksPage[index -1].totalPages) };
          }
          return book;
        });
      });
    }
  }, [htmlArray, currentPage, currentBookIndex]); 



useEffect(() => {
    if (htmlArray.length > 0) {
      setHtmlContent(htmlArray[currentPage]);
      // 更新当前书籍的总页数
      setBooksPage(prevBooks => {
        return prevBooks.map((book, index) => {
            console.log(book, index);
          if (index === currentBookIndex) { // 修改：根据索引比较
            return { ...book, totalPages: htmlArray.length };
          }
          return book;
        });
      });
    }
  }, [booksPage.length]);

  useEffect(() => {
    if (htmlArray.length > 0) {
      // setCurrentPage(0); // 确保有内容时显示第一页
      setCurrentPage(currentPage);
    }
  }, [htmlArray]);

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

  // 处理回车事件
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleJump();
    }
  };

  // 修改：处理书籍切换，接收索引
  const handleBookChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBookIndex = parseInt(event.target.value, 10); // 解析索引
    setCurrentBookIndex(selectedBookIndex);
      // 切换书籍时，重置当前页码为 0
      // setCurrentPage(0);
      // TODO: 根据书籍名称加载对应的 htmlArray

  };

  return (
    <div>
      <h1>书山有路你不走</h1>
      <FileToHtml
        onHtmlExtracted={handleHtmlExtracted}
        onFileUploaded={handleFileChange}
      />

      {/* 修改：书籍选择下拉框 */}
      <div>
        <label htmlFor="book-select">选择书籍：</label>
        <select id="book-select" value={currentBookIndex} onChange={handleBookChange}>
          <option value="">请选择书籍</option>
          {booksPage.map((book, index) => (
            <option key={index} value={index}> {/* 修改：value 为索引 */}
              {book.bookName} ({book.totalPages} 页)
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
              onKeyPress={handleKeyPress} // 添加 onKeyPress 事件
              placeholder={`当前 ${currentPage + 1} / ${htmlArray.length}`}
            />

            <button onClick={() => handlePageChange('next')} disabled={currentPage === htmlArray.length - 1}>下一页</button>
          </div>
        </>
      )}
    </div>
  );
};

export default PagesReader;