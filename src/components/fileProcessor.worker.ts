import Epub from 'epubjs';
import mammoth from "mammoth";
import { getDocument } from "pdfjs-dist";

// 处理文件的 Worker
onmessage = async (event) => {
  const arrayBuffer = event.data as ArrayBuffer;
  const resultHtml: string[] = [];

  try {
    // 根据文件类型进行处理
    const fileType = getFileType(arrayBuffer);
    switch (fileType) {
      case "docx":
        const { value: docxHtml } = await mammoth.convertToHtml({ arrayBuffer });
        resultHtml.push(docxHtml);
        break;
      case "epub":
        const book = Epub(arrayBuffer);
        await book.ready;
        for (const spineItem of book.spine.spineItems) {
          const section = await book.load(spineItem.href);
          resultHtml.push(section.body.innerHTML);
        }
        break;
      case "pdf":
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        let combinedHtml = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          combinedHtml += textContent.items.map((item: any) => item.str).join("</div> <div>");
        }
        resultHtml.push(`<div>${combinedHtml}</div>`);
        break;
      default:
        console.error("Unsupported file type");
    }
  } catch (error) {
    console.error(error);
  }

  // 将结果返回给主线程
  postMessage(resultHtml.join(''));
};

// 获取文件类型
function getFileType(arrayBuffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(arrayBuffer);
  const fileSignature = uint8Array.slice(0, 4).join('');
  
  if (fileSignature === "504b34") return "docx";  // docx
  if (fileSignature === "3c3f786d") return "epub";  // epub
  if (fileSignature.includes("25504446")) return "pdf";  // pdf
  return "unknown";
}
