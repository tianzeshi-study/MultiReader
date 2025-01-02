import React, { useState } from 'react';
import Epub from 'epubjs';
import Spine  from 'epubjs';
import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
// GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.js';
// GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.min.js';
// 将EPUB转化为HTML的组件
const FileToHtml: React.FC<{ onHtmlExtracted: (html: string) => void }> = ({ onHtmlExtracted }) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
    const resultHtml: string[] = [];    
        const fileType = file.type;
try {
      switch (fileType) {
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        console.log("docx");
        const arrayBuffer = reader.result as ArrayBuffer;
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
    resultHtml.push(html);
          // await handleDocx(file);
          break;
        case "application/epub+zip":
        console.log("epub");
      // const book = new Epub(reader.result as ArrayBuffer);
      const book = Epub(reader.result as ArrayBuffer);
const rendition = book.renderTo('viewer', { flow: 'paginated', width: '100%', height: '100%' });
await book.ready;
for (const spineItem of book.spine.spineItems) {
  // const spine = await book.spine; // 解开 Promise
  // for (const spineItem of spine.spineItems ) {

        const section = await book.load(spineItem.href);
        console.log(section);
        resultHtml.push(section.body.innerHTML);
      }
          break;
        case "application/pdf":
        console.log("pdf");
        const arrayBuffer1 = reader.result as ArrayBuffer;
        const pdf = await getDocument({ data: arrayBuffer1 }).promise;
    let combinedHtml = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // combinedHtml += textContent.items.map((item: any) => item.str).join("<div></div>");
      combinedHtml += textContent.items.map((item: any) => item.str).join("</div> <div>");
    }

    // setHtmlContent(`<div>${combinedHtml}</div>`);
    resultHtml.push(`<div>${combinedHtml}</div>`);

// resultHtml.push(combinedHtml);


          break;
        default:
console.error("error");

      }
    } catch (error) {
      console.error(error);
    }
    
      
      
      

      
      

      onHtmlExtracted(resultHtml.join(''));
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <input type="file" accept=".epub,.docx,.pdf" onChange={handleFileUpload} />
    </div>
  );
};

// 显示HTML内容的组件
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
