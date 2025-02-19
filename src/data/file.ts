import { BookStorage, db } from './database';
import Epub from 'epubjs';
import Spine from 'epubjs';
import mammoth from "mammoth";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { TextItem } from 'pdfjs-dist/types/src/display/api';

export async function fileToArray(file: File): Promise<string[]> {
    // if (!file) return;

    const reader = new FileReader();
    const resultHtml: string[] = [];

    // 使用一个 Promise 来包裹 FileReader 的 onload 事件
    const readFilePromise = new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
            const fileType = file.type;
            try {
                const arrayBuffer = reader.result as ArrayBuffer;
                switch (fileType) {
                    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                        console.log("docx");
                        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
                        resultHtml.push(html);
                        break;
                    case "application/epub+zip":
                        console.log("epub");
                        const book = Epub(arrayBuffer);
                        await book.ready;
                        for (const spineItem of book.spine.spineItems) {
                            const section = await book.load(spineItem.href);
                            resultHtml.push(section.body.innerHTML);
                        }
                        break;
                    case "application/pdf":
                        console.log("pdf");
                        const pdf = await getDocument({ data: arrayBuffer }).promise;
                        let combinedHtml = "";
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            const lines: any[] = [];
                            let currentLine: TextItem[] = [];

                            for (const item of textContent.items) {
                                if ('transform' in item) {
                                    const y = item.transform[5];
                                    if (currentLine.length === 0) {
                                        currentLine.push(item);
                                    } else {
                                        const lastItem = currentLine[currentLine.length - 1];
                                        const lastY = lastItem.transform[5];

                                        if (Math.abs(y - lastY) < 12) {
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

                            const htmlPage = lines.map(line => {
                                const lineText = line.map((item: TextItem) => item.str).join(" ");
                                return `<div>${lineText}</div>`;
                            }).join("");

                            resultHtml.push(`<div>${htmlPage}</div><button>${i}</button>`);
                        }
                        break;
                    case "text/plain":
                        console.log("txt");
                        const decoder = new TextDecoder('utf-8');
                        const textContent = decoder.decode(arrayBuffer);
                        const paragraphs = textContent.split(/\n/).map(paragraph => `<p>${paragraph}</p>`).join('');
                        for (const paragraph of paragraphs) {
                            resultHtml.push(paragraph);
                        }
                        const htmlContent = `<div>${paragraphs}</div>`;
                        resultHtml.push(htmlContent);
                        break;
                    default:
                        console.error("error");
                }
            } catch (error) {
                console.error(error);
            }
            resolve(); // 文件读取并处理完成后，调用 resolve
        };

        reader.onerror = reject; // 如果发生错误，调用 reject
    });

    await reader.readAsArrayBuffer(file); // 开始读取文件
    await readFilePromise; // 等待文件处理完成
    return resultHtml; // 返回结果
}

export async function handleFiles(files: Iterable<File>) {
  const books = await db?.books.toArray()
  const newBooks = []

  for (const file of files) {
    console.log(file)



const data = await fileToArray(file);
const datahash = await getHash(data);

    if (!books?.find((b) => b.id === datahash)) {
        addData(datahash, data);
        
            let book = books?.find((b) => b.name === file.name)

    if (!book) {
      book = await addBook(file);
    newBooks.push(book);
            } else {
        console.log("book already in bookshelf");
    }
    
    } else {
        console.log("same hash book exist ");
        await updateBook(datahash, {name: file.name, updatedAt: Date.now()});
    }





  }

  return newBooks
}

export async function addBook(file: File) {
  const data = await fileToArray(file);
const datahash = await getHash(data);
  const book: BookStorage = {
    id: datahash,
    name: file.name,
    size: file.size,
    importedAt: Date.now(),
    totalPage: data.length,
  }
  db?.books.add(book)
  // addFile(book.id, file);
  
  // addData(book.id, data);
  return book
}

/* 
export async function addFile(id: string, file: File) {
  db?.files.add({ id, file })

} 
*/

export async function addData(id: string, data: string[]) {
  db?.filesData.add({ id, data })
}

export function readBlob(fn: (reader: FileReader) => void) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      resolve(reader.result as string)
    })
    fn(reader)
  })
}

async function toDataUrl(url: string) {
  const res = await fetch(url)
  const buffer = await res.blob()
  return readBlob((r) => r.readAsDataURL(buffer))
}

export async function fetchBook(url: string) {
  const filename = decodeURIComponent(/\/([^/]*\.epub)$/i.exec(url)?.[1] ?? '')
  const books = await db?.books.toArray()
  const book = books?.find((b) => b.name === filename)

  return (
    book ??
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => addBook(new File([blob], filename)))
  )
}

async function getHash(data: string[]): Promise<string> {
  // 使用FileReader读取文件内容
  const combinedString = data.join('');
  const encoder = new TextEncoder();

  const arrayBuffer = encoder.encode(combinedString);


  // 使用crypto.subtle生成SHA-256哈希
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  
  // 将ArrayBuffer转换为16进制字符串
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // 转换为字节数组
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

async function updateBook(id: string, updatedFields: Partial<BookRecord>) {
  const updated = await db.books.update(id, updatedFields);
  if (updated) {
    console.log('Book updated successfully');
  } else {
    console.log('Book not found');
  }
}
