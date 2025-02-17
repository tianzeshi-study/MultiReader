import React, { useState, useEffect } from 'react';
import HtmlViewer from "./HtmlViewer";
import FileToHtml from "./FileToHtml";

// GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
// GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.js';

const UniReader: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [htmlArray, setHtmlArray] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const handleHtmlExtracted = (html: string) => {
    setHtmlArray(prevArray => [...prevArray, html]);
  };

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

  return (
    <div>
      <h1>书山有路你不走</h1>
      <FileToHtml onHtmlExtracted={handleHtmlExtracted} />
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
          </div>
        </>
      )}
    </div>
  );
};

export default UniReader;