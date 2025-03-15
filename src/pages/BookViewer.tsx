import {useEffect, useState, useMemo } from 'react';
import { db, DataStorage, BookStorage } from '../data/database';
import WorkspaceReader from '../components/WorkspaceReader';
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
  useIonViewWillEnter,
  useIonViewWillLeave,
  useIonViewDidLeave  
} from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import { useParams } from 'react-router';

const BookViewer: React.FC = () => {
// function  BookViewer()  {
  const [fileData, setFileData] = useState<DataStorage>();
  const [book, setBook] = useState<BookStorage>();
  const params = useParams<{ id: string }>();

/*
  useIonViewWillEnter(async () => {
    const data = await db?.filesData.get(params.id);
    const b = await db?.books.get(params.id);
    console.log("entering");

    // 仅在数据实际发生变化时更新状态
    if (data && JSON.stringify(data) !== JSON.stringify(fileData)) {
      console.log("Setting file data");
      setFileData(data);
    }
    if (b && JSON.stringify(b) !== JSON.stringify(book)) {
      setBook(b);
    }
  });
*/
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
      console.log("Setting file data");
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
}, []); // 依赖 params.id，确保 id 变化时重新加载数据
  // 使用 useMemo 缓存 bookData，避免每次渲染时重新生成
  const bookData = useMemo(() => {
      console.log("getting book data");
    return fileData?.data || [];
  }, [fileData]);
  console.log("bookData");

  return (
    <IonPage id="view-book-page">
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton 
            text="Inbox" 
            defaultHref="../bookshelf"

            >
            </IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {fileData ? (
          <>
            <IonItem>
              <IonIcon aria-hidden="true" icon={personCircle} color="primary"></IonIcon>
              <IonLabel className="ion-text-wrap">
                <h1>{book?.name}</h1>
              </IonLabel>
            </IonItem>

            <div className="ion-padding">
              <div>
                {/* <HtmlViewer htmlContent={fileData.data.toString()} /> */}
                <WorkspaceReader
                  FileToHtmlComponent={BookDataExtractor}
                  bookData={bookData} // 传递缓存的 bookData
                />
              </div>
            </div>
          </>
        ) : (
          <div>BOOK DATA NOT FOUND!</div>
        )}
      </IonContent>
    </IonPage>
  );
};
// }

export default BookViewer;