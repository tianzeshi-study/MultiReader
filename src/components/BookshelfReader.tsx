import React, { useState, useEffect , useCallback, useRef} from 'react';
import { useTranslation } from 'react-i18next';
import {putUpdateBook} from './SyncButton';
import { db, DataStorage, BookStorage } from '../data/database';
import { useParams } from 'react-router';
import HtmlViewer from "./HtmlViewer";
import usePageJumper from '../hooks/usePageJumper';
import SearchBox from './SearchBox'; 



interface BookInfo {
  bookName: string;
  bookPages: number;
  currentPage?: number;
  bookData: string[];
}

// Add props interface
interface BookshelfReaderProps {
    FileToHtmlComponent: React.FC<{
        onHtmlExtracted: (html: string) => void;
        onFileUploaded?: (file: File) => void;
        bookData?: string[];
    }>;
bookData?: string[];
progressPage?: number;
}

const BookshelfReader: React.FC<BookshelfReaderProps> = ({ FileToHtmlComponent, bookData, progressPage}) => {
    
    const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang); // 记住用户选择
  };


  const [htmlContent, setHtmlContent] = useState<string>('');
  const [htmlArray, setHtmlArray] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [booksInfo, setBooksInfo] = useState<BookInfo[]>([]);
  const [currentBookIndex, setCurrentBookIndex] = useState<number>(0);
  const [storedBook, setStoredBook] = useState(!!bookData);
  const params = useParams<{ id: string }>();
  
  const headingRef = useRef<HTMLHeadingElement>(null);

  // 2. 在 currentPage 改变时，让 <h2> 获取焦点
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [currentPage]);


  const unmountEffect=  useEffect(() => {
    return () => {
      console.log('BookshelfReader unmounted, resetting state');
      setHtmlContent('');
      setHtmlArray([]);
      setBooksInfo([]);
    };
  }, []);

const mountEffect =  useEffect(() => {
      if (storedBook) {
          if (bookData) {
          setHtmlArray(bookData);
          }
          if (progressPage) {
          setCurrentPage(progressPage);
          }  
          // console.log("mountEffect");



const loadData = async () => {
          const data = await db?.filesData.get(params.id);
      const b = await db?.books.get(params.id);
      booksInfo[currentBookIndex] = {} as BookInfo;
          booksInfo[currentBookIndex].bookPages = b?.totalPage!;
          booksInfo[currentBookIndex].bookName = b?.name!;
          booksInfo[currentBookIndex].bookData = bookData || [];
          setBooksInfo(booksInfo);
          // if (b.progressPage) {
          // setCurrentPage(b.progressPage);
          // console.log("set progressPage", b.progressPage);
          // } else {
              // console.log("no progressPage", b.progressPage, b );
          // }              
console.log("mount booksInfo[currentBookIndex]", booksInfo[currentBookIndex]);          
};
loadData();
console.log("mountEffect");

      } else {
          console.log("nothing");
      }
  
  }, []);

    const handleHtmlExtracted = useCallback(async (html:string) => {
        // setHtmlArray(prevArray => [...prevArray, html]);
        /*
        const data = await db?.filesData.get(params.id);
      const b = await db?.books.get(params.id);
      booksInfo[currentBookIndex] = {} as BookInfo;
          booksInfo[currentBookIndex].bookPages = b.totalPage;
          booksInfo[currentBookIndex].bookName = b.name;
          booksInfo[currentBookIndex].bookData = bookData;
          setBooksInfo(booksInfo);
          if (b.progressPage) {
          setCurrentPage(b.progressPage);
          console.log("set progressPage", b.progressPage);
          } else {
              console.log("no progressPage", b.progressPage, b );
          }              
          */
    }, []);


const handleFileChange = (file:File) => {
        console.log("file changed", file.name);
        // 更新书籍页数信息
        setBooksInfo(prevBooks => {
          const existingBookIndex = prevBooks.findIndex(book => book.bookName === file.name);
          if (existingBookIndex > -1) {
            // 如果书籍已存在，则更新页数 (这里假设每次上传都会重置该书的页数)
            const updatedBooks = [...prevBooks];
            // Store the current htmlArray into bookData before resetting.
            console.log("update  book data", file.name);
            setCurrentBookIndex(existingBookIndex);
            // updatedBooks[existingBookIndex] = { ...updatedBooks[existingBookIndex], bookName: file.name, bookPages: 0, bookData: htmlArray }; // 初始为0，后续根据 htmlArray 更新
            return updatedBooks;
          } else {
            // 如果书籍不存在，则添加新书籍
            // Initialize bookData with an empty array.
            console.log("add new book", file.name);
            setCurrentBookIndex(booksInfo.length);
            // return [...prevBooks, { bookName: file.name, bookPages: 0, bookData: htmlArray }];
            return [...prevBooks, { bookName: file.name, bookPages: 0, bookData: [] }];
          }
        });
        console.log("file change booksInfo count ", booksInfo.length, booksInfo);

        // Clear htmlArray and reset currentPage
        setHtmlArray([]);
        setCurrentPage(0);
        // setCurrentBookIndex(booksInfo.length);
    }

  const bookChangeEffect =  useEffect(() => {
    if (htmlArray.length > 0) {
        console.log("book changed");
      setHtmlContent(htmlArray[currentPage]);

      // 更新当前书籍的总页数
      if (booksInfo.length > 0)  {
      setBooksInfo(prevBooks => {
        return prevBooks.map((book, index) => {
          // if (index === currentBookIndex) { // 修改：根据索引比较
          if (index === booksInfo.length -1&& currentBookIndex === booksInfo.length -1) {
          return { ...book, bookPages: htmlArray.length, bookData: htmlArray };
          } else {
          console.log("update book info", index);
          return { ...book};
          }
          return book;
        });
      });
    }
    }
  }, [currentBookIndex, htmlArray, currentPage]);


  const contentChangeEffect = useEffect(() => {
    if (htmlArray.length > 0) {
      setHtmlContent(htmlArray[currentPage]);
    }
    
  console.log("storedBook", storedBook, currentBookIndex, booksInfo, currentPage);
  if (booksInfo.length !== 0) {
  booksInfo[currentBookIndex].currentPage = currentPage;
  console.log("current book info",booksInfo[currentBookIndex]);
  }
 
          


  }, [htmlArray, currentPage]);
  
  const pageChangeEffect = useEffect(() => {
    if (storedBook) {
    const updateBookProgress = async () => {
        const nowtime =Date.now();
        let update = await db.books.update(params.id, {progressPage: currentPage, updatedAt: nowtime});
        console.log("update", update);
        await putUpdateBook(params.id, nowtime, currentPage);
    };
    updateBookProgress();
      } 
        


  }, [currentPage]);

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

  // 修改：处理书籍切换，接收索引
  const handleBookChange = (event: React.ChangeEvent<HTMLSelectElement>) => {


    const selectedBookIndex = parseInt(event.target.value, 10);
console.log("selectedBookIndex", selectedBookIndex);
console.log("selected book pages ", booksInfo[selectedBookIndex].bookData.length);
    setCurrentBookIndex(selectedBookIndex);


      // 切换书籍时，重置当前页码为 0
      setCurrentPage(0);
       


  };

const selectBookEffect = useEffect(() => {
    if (booksInfo.length > 0 && currentBookIndex < booksInfo.length) {
        console.log("booksInfo", booksInfo, booksInfo.length);
        console.log("currentBookIndex", currentBookIndex);
        // if (booksInfo.length > 1 ) {
        console.log("change to selected data");


      const selectedBookData = booksInfo[currentBookIndex].bookData;
      // setHtmlArray(selectedBookData);
      setHtmlArray([]);
      for (const data of selectedBookData) {
setHtmlArray(prevArray => [...prevArray, data]);
}

    }
  }, [currentBookIndex]);
  
  const handlePageSelectFromSearch = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };



  
  return (
    <div>
      <h1>{t('SLOGAN_PAIR1')}</h1>
      <FileToHtmlComponent
        onHtmlExtracted={handleHtmlExtracted}
        onFileUploaded={handleFileChange}
        bookData={bookData}
      />
      
      <SearchBox htmlArray={htmlArray} onPageSelect={handlePageSelectFromSearch} />

      {/* 修改：书籍选择下拉框 */}
      <div>
        <label htmlFor="book-select">选择书籍：</label>
        <select id="book-select" value={currentBookIndex} onChange={handleBookChange}>
          <option value="">请选择书籍</option>
          {booksInfo.map((book, index) => (
            <option key={index} value={index}> {/* 修改：value 为索引 */}
              {book.bookName} ({book.bookPages} 页)
            </option>
          ))}
        </select>
      </div>

      {htmlContent && (
        <>
          <h2
            ref={headingRef}
            tabIndex={-1}           // 必需，让非交互元素也能被 focus
            style={{ outline: 'none' }} // 可选：去掉默认聚焦时的虚线边框
          >
            {t('SLOGAN_PAIR2')}
          </h2>
          <HtmlViewer htmlContent={htmlContent} />
          <div>
            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 0}>{t('PREVIOUS_PAGE')}</button>

            <input
              type="text"
              value={jumpPage}
              onChange={handleJumpInputChange}
              onKeyPress={handleKeyPress} // 添加 onKeyPress 事件
              placeholder={`当前 ${currentPage + 1} / ${htmlArray.length}`}
            />

            <button onClick={() => handlePageChange('next')} disabled={currentPage === htmlArray.length - 1}>{t('NEXT_PAGE')}</button>
          </div>
        </>
      )}
    </div>
  );
};


export default BookshelfReader;