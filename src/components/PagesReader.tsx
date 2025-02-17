import React, { useState, useEffect } from 'react';
import HtmlViewer from "./HtmlViewer";
import FileToHtml from "./FileToHtml";
import usePageJumper from '../hooks/usePageJumper'; // 导入自定义 Hook

// GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
// GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.js';

const PagesReader: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [htmlArray, setHtmlArray] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);

    const handleHtmlExtracted = (html:string) => {
        setHtmlArray(prevArray => [...prevArray, html]);
    }

  useEffect(() => {
    console.log(htmlArray.length);
    if (htmlArray.length > 0) {
      setHtmlContent(htmlArray[currentPage]);
    }
  }, [htmlArray, currentPage]);

  useEffect(() => {
    if (htmlArray.length > 0) {
      setCurrentPage(0); // 确保有内容时显示第一页
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

  return (
    <div>
      <h1>书山有路你不走</h1>
      <FileToHtml onHtmlExtracted={handleHtmlExtracted}/>
      {htmlContent && (
        <>
          <h2>学海无涯你闯进来</h2>
          <HtmlViewer htmlContent={htmlContent} />
          <div>
            <button onClick={() => handlePageChange('prev')} disabled={currentPage === 0}>
              上一页
            </button>
            <button onClick={() => handlePageChange('next')} disabled={currentPage === htmlArray.length - 1}>
              下一页
            </button>
            {/* 使用自定义 Hook 提供的状态和函数 */}
            <input
              type="text"
              value={jumpPage}
              onChange={handleJumpInputChange}
              placeholder="跳转到..."
            />
            <button onClick={handleJump}>跳转</button>
          </div>
        </>
      )}
    </div>
  );
};

export default PagesReader;