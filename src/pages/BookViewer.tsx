import { useState } from 'react';
import { db, DataStorage, BookStorage} from '../data/Database';
import WorkspaceReader from '../components/WorkspaceReader'; 
import HtmlViewer from '../components/HtmlViewer'; 

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
} from '@ionic/react';
import { personCircle } from 'ionicons/icons';
import { useParams } from 'react-router';


const BookViewer: React.FC = () => {
  const [fileData, setFileData] = useState<DataStorage>();
const [book, setBook] = useState<BookStorage>();
  const params = useParams<{ id: string }>();

  useIonViewWillEnter(async () =>  {
    // const msg = getFileData(parseInt(params.id, 10));
    const data = (await db?.filesData.get(params.id));
const b = (await db?.books.get(params.id));

    setFileData(data);
setBook(b);  
  });

  return (
    <IonPage id="view-book-page">

      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton text="Inbox" defaultHref="../bookshelf"></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {fileData ? (
          <>
            <IonItem>
              <IonIcon aria-hidden="true" icon={personCircle} color="primary"></IonIcon>
              <IonLabel className="ion-text-wrap">
                <h1>
                  {book.name}
                </h1>

              </IonLabel>
            </IonItem>

            <div className="ion-padding">
              <div>
              <HtmlViewer htmlContent={fileData.data[0]} />
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

export default BookViewer;