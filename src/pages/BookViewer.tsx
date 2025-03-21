import { useEffect, useState, useMemo } from 'react';
import { db, DataStorage, BookStorage } from '../data/database';
import BookshelfReader from '../components/BookshelfReader';
import HtmlViewer from '../components/HtmlViewer';
import BookDataExtractor from '../components/BookDataExtractor';

import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  IonToolbar,
  IonButton, // 添加 IonButton 组件
  useIonViewWillEnter,
  useIonViewWillLeave,
  useIonViewDidLeave,
} from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import { useParams } from 'react-router';

// const BookViewer: React.FC = () => {
function BookViewer() {
  const [fileData, setFileData] = useState<DataStorage>();
  const [book, setBook] = useState<BookStorage>();
  const [showChildren, setShowChildren] = useState(true);
const [showFullText, setShowFullText] = useState(false); 
  const params = useParams<{ id: string }>();

  useIonViewWillLeave(() => {
    console.log('BookViewer is about to leave');
  });

  useIonViewDidLeave(() => {
    console.log('BookViewer has left');
    setFileData(undefined); // 重置 fileData
    setBook(undefined); // 重置 book
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await db?.filesData.get(params.id);
      const b = await db?.books.get(params.id);

      if (data && JSON.stringify(data) !== JSON.stringify(fileData)) {
        console.log('Setting file data');
        setFileData(data);
      }
      if (b && JSON.stringify(b) !== JSON.stringify(book)) {
        setBook(b);
      }
    };

    loadData(); // 调用异步函数

    return () => {
      console.log('unmount or update or load');
    };
  }, [params.id]); // 依赖 params.id，确保 id 变化时重新加载数据

  // 使用 useMemo 缓存 bookData，避免每次渲染时重新生成
  const bookData = useMemo(() => {
    console.log('getting book data', fileData);
    return fileData?.data || [];
  }, [fileData]);



  // 点击按钮卸载所有子组件
  const handleUnmountChildren = () => {
    console.log('Unmounting all children');
    setShowChildren(!showChildren); // 设置 showChildren 为 false，卸载子组件
  };

const handleShowFullText = () => {
    console.log('show or hiding  full text');
    setShowFullText    (!showFullText); // 设置 showChildren 为 false，卸载子组件
  };

  return (
    <IonPage id="view-book-page">
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Inbox" defaultHref="../bookshelf" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>

        <IonButton expand="full" onClick={handleUnmountChildren}>
            {!showChildren ?(<div>显示</div>): (<div>隐藏</div>)}
        </IonButton>
        <IonButton expand="full" onClick={handleShowFullText}>
            {!showFullText?(<div>展开</div>):(<div>折叠</div>)}
        </IonButton>

        {fileData && showChildren ? ( 
          <>
            <IonItem>
              <IonIcon aria-hidden="true" icon={personCircle} color="primary" />
              <IonLabel className="ion-text-wrap">
                <h1>{book?.name}</h1>
              </IonLabel>
            </IonItem>

            <div className="ion-padding">
              <div>
              {!showFullText ?(
                <BookshelfReader
                  FileToHtmlComponent={BookDataExtractor}
                  bookData={bookData} // 传递缓存的 bookData
                  progressPage= {book?.progressPage}
                />
              ) :(<HtmlViewer htmlContent={fileData.data.toString()} />)}
              </div>
            </div>
          </>
        ) : (
          <div>BOOK DATA NOT FOUND!</div>
        )}
      </IonContent>
    </IonPage>
  );
// };
}

export default BookViewer;