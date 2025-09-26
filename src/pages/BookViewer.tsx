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
import { useParams, useLocation } from 'react-router';

// const BookViewer: React.FC = () => {
    const base_url = import.meta.env.VITE_BASE_URL;
    interface BookBundle {
        book_meta:BookStorage;
        book_data: DataStorage;
        }
function BookViewer() {
  const [fileData, setFileData] = useState<DataStorage>();
  const [book, setBook] = useState<BookStorage>();

  const [showChildren, setShowChildren] = useState(true);
const [showFullText, setShowFullText] = useState(false); 
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  // 从 query 参数中获取 token 的值
  const sharing_token = queryParams.get('token');
  

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
        if (sharing_token) {
            console.log("queryParams token:\n", sharing_token);
            const bundle = await fetchSharingBook(sharing_token);
            if (!bundle) {
                return null;
            };
            setFileData(bundle.book_data);
setBook(bundle.book_meta);
            console.log("bundle:\n", bundle);

            try {
            await db?.books.add(bundle.book_meta);
            await db?.filesData.add(bundle.book_data);
            } catch (error: any) {
  if (error.name === 'ConstraintError') {
    console.log('数据插入时违反了唯一性约束，可能数据已存在：', error);
    // 根据需求可以选择使用更新逻辑或提示用户
  } else {
    console.error('数据操作失败：', error);
  }
            }
                    } else {
      const data = await db?.filesData.get(params.id);
      const b = await db?.books.get(params.id);

      if (data && JSON.stringify(data) !== JSON.stringify(fileData)) {
        console.log('Setting file data');
        setFileData(data);
      }
      if (b && JSON.stringify(b) !== JSON.stringify(book)) {
        setBook(b);
      }
                    }
    };

    loadData(); // 调用异步函数

    return () => {
      console.log('unmount or update or load');
    };
  }, [params.id]); // 依赖 params.id，确保 id 变化时重新加载数据

  // 使用 useMemo 缓存 bookData，避免每次渲染时重新生成
  const bookData = useMemo(() => {
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
            <IonBackButton text="返回" defaultHref="../bookshelf" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
<IonToolbar>

        <IonButton expand="full" onClick={handleUnmountChildren}>
            {!showChildren ?(<div>显示</div>): (<div>隐藏</div>)}
        </IonButton>
        <IonButton expand="full" onClick={handleShowFullText}>
            {!showFullText?(<div>展开</div>):(<div>折叠</div>)}
        </IonButton>
</IonToolbar>
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
          <div>这里似乎什么也没有!</div>
        )}
      </IonContent>
    </IonPage>
  );
// };
}

const fetchSharingBook = async (sharing_token: string) => {
  try {
    const response = await fetch(`${base_url}/books/sharing?token=${sharing_token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      },
    });
    if (response.ok) {
    const data = await response.json();
    console.log("receiveBook", data);
    let book_data: DataStorage = data.book_data;
    let book_meta: BookStorage = {
        book_id: data.book_meta.book_id,
  name: data.book_meta.name,
  size: data.book_meta.size,
  importedAt: data.book_meta.imported_at,
  updatedAt: data.book_meta.updated_at,
  progressPage: data.book_meta.progress_page,
  totalPage: data.book_meta.total_page
    };
    return {
        book_meta: book_meta,
        book_data: book_data
    };
    } else if (response.status === 401){
        console.log("token unauthorize", response);
        alert("无效链接");
    } else {
        console.error("unknown sharing error", response.json());
        alert("链接解析失败");
    };
  } catch (error) {
    console.error("Error fetching sharing books:", error);
  }
};

export default BookViewer;