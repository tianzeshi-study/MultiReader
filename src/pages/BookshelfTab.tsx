import React from 'react';
import Bookshelf from '../components/Bookshelf'; 
import FileToHtml from '../components/FileToHtml'; 


import {
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter
} from '@ionic/react';


const BookshelfTab: React.FC = () => {


const refresh = (e: CustomEvent) => {
    setTimeout(() => {
      e.detail.complete();
    }, 3000);
  };
  
  return (
  
  <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={refresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>




    <div>
      <Bookshelf/>
    </div>
    
        
    </IonContent>
    </IonPage>


  );
};

export default BookshelfTab;