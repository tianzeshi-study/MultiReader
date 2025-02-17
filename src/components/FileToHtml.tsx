import React, { useState } from 'react';
import Epub from 'epubjs';
import Spine from 'epubjs';
import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import HtmlViewer from "./HtmlViewer";

GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
// GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.js';


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
                        // resultHtml.push(html);
                        onHtmlExtracted(html);

                        break;
                    case "application/epub+zip":
                        console.log("epub");

                        const book = Epub(reader.result as ArrayBuffer);

                        await book.ready;
                        for (const spineItem of book.spine.spineItems) {
                            const section = await book.load(spineItem.href);
                            // console.log(section);
                            resultHtml.push(section.body.innerHTML);
    onHtmlExtracted(section.body.innerHTML);
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

                            // combinedHtml += textContent.items.map((item: any) => item.str).join("</div> <div>");
                            // resultHtml.push(textContent.items.map((item: any) => item.str).join("</div> <div>"));
                            const htmlPage = textContent.items.map((item: any) => item.str).join("</div> <div>");
                            resultHtml.push(`<div>${htmlPage}</div><button>${i}</button>`);
                            onHtmlExtracted(`<div>${htmlPage}</div><button>${i}</button>`);
                        }

                        // resultHtml.push(`<div>${combinedHtml}</div>`);

                        break;
                    case "text/plain":
                        console.log("txt");
                        const arrayBuffer2 = reader.result as ArrayBuffer;
                        const decoder = new TextDecoder('utf-8'); // 或者其他编码，根据文件实际编码决定
                        const textContent = decoder.decode(arrayBuffer2);
                        const paragraphs = textContent.split(/\n/).map(paragraph => `<p>${paragraph}</p>`).join('');
                        for (const paragraph of paragraphs) {
                            resultHtml.push(paragraph);
                        }
                                                const htmlContent = `<div>${paragraphs}</div>`;
                                                onHtmlExtracted(htmlContent);
                        // resultHtml.push(htmlContent);

                        break;
                   default:
                        console.error("error");

                }
            } catch (error) {
                console.error(error);
            }

            // onHtmlExtracted(resultHtml.join(''));
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div>
            <input type="file" accept=".epub,.docx,.pdf,.txt" onChange={handleFileUpload} />
        </div>
    );
};

export default FileToHtml;