import React, { useState } from 'react';
import Epub from 'epubjs';
import Spine from 'epubjs';
import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import HtmlViewer from "./HtmlViewer";

GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
// GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.9.155/pdf.worker.min.js';


const FileToHtml: React.FC<{ onHtmlExtracted: (html: string) => void, onFileUploaded?: (file: File) => void }> = ({ onHtmlExtracted, onFileUploaded }) => {
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 调用 onFileUploaded 回调
        if (onFileUploaded) {
            onFileUploaded(file);
        }

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

                            // 组织 items 为行
                            const lines: any[] = [];
                            let currentLine: TextItem[] = [];

                            for (const item of textContent.items) {

                                if ('transform' in item) {

                                    const y = item.transform[5]; // 获取 y 坐标

                                    if (currentLine.length === 0) {
                                        currentLine.push(item);
                                    } else {
                                        const lastItem = currentLine[currentLine.length - 1];
                                        const lastY = lastItem.transform[5];

                                        // 比较 y 坐标，判断是否在同一行
                                        if (Math.abs(y - lastY) < 12) { // 阈值可根据实际情况调整
                                            currentLine.push(item);
                                        } else {
                                            lines.push(currentLine);
                                            currentLine = [item];
                                        }
                                    }
                                }
                            }
                            if (currentLine.length > 0) {
                                lines.push(currentLine);
                            }

                            // 将每行转换为 HTML
                            const htmlPage = lines.map(line => {
                                const lineText = line.map((item: TextItem) => item.str).join(" ");
                                return `<p>${lineText}</p>`;
                            }).join("");

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