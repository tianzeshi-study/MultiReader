import React, { useState, useEffect } from 'react';
import Epub from 'epubjs';
import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// 设置 PDF.js 的 worker
GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';

// 创建一个 Worker 来处理文件
const fileProcessorWorker = new Worker(new URL('./fileProcessorWorker.ts', import.meta.url));

// 将文件转换为 HTML 的组件
const FileToHtml: React.FC<{ onHtmlExtracted: (html: string) => void }> = ({ onHtmlExtracted }) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 创建一个 FileReader 来读取文件
    const reader = new FileReader();
    reader.onload = () => {
      // 将文件传给 Worker 进行处理
      fileProcessorWorker.postMessage(reader.result);
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    // 监听 Worker 返回的处理结果
    fileProcessorWorker.onmessage = (event) => {
      const htmlContent = event.data;
      onHtmlExtracted(htmlContent);
    };
    return () => {
      fileProcessorWorker.terminate();
    };
  }, [onHtmlExtracted]);

  return (
    <div>
      <input type="file" accept=".epub,.docx,.pdf" onChange={handleFileUpload} />
    </div>
  );
};

// 显示 HTML 内容的组件
const HtmlViewer: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
  return (
    <div
      style={{ border: '1px solid #ddd', padding: '10px', maxHeight: '400px', overflowY: 'auto' }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

// 主组件
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
