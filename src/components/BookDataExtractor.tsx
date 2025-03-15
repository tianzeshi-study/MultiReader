import React, { useEffect } from 'react';

const BookDataExtractor: React.FC<{
  onHtmlExtracted: (html: string) => void;
  bookData?: string[];
// }> = React.memo(({ onHtmlExtracted, bookData }) => {
    }> = ({ onHtmlExtracted, bookData }) => {
    console.log("extracting"); 
  useEffect(() => {

    if (bookData) {
      // const processData = async () => {
          let  index =0;
        for (const data of bookData) {
          console.log("data", bookData.length);
          console.log(`第 ${index + 1} 次循环，数据：`);
  index++; // 每次循环后递增索引

          onHtmlExtracted(data);
          // await new Promise((resolve) => setTimeout(resolve, 10000)); // 添加暂停
        }
      // };
      // processData();
    }
  }, [ ]);

  return <div></div>;
// });
};

export default BookDataExtractor;