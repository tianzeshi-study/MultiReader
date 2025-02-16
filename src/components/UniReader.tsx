import React, { useState } from 'react';

import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import HtmlViewer from "./HtmlViewer";
import FileToHtml from "./FileToHtml";

GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
// GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.js';
// GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.min.js';

const UniReader: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  return (
    <div>
      <h1>书山有路你不走</h1>
      <FileToHtml onHtmlExtracted={setHtmlContent} />
      {htmlContent && (
        <>
          <h2>学海无涯你闯进来</h2>
          <HtmlViewer htmlContent={htmlContent} />
        </>
      )}
    </div>
  );
};

export default UniReader;
