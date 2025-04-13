import React from 'react';
import WorkspaceReader from '../components/WorkspaceReader'; 
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

const WorkspaceTab: React.FC = () => {
    
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
      <WorkspaceReader FileToHtmlComponent={FileToHtml} />
    </div>
            
    </IonContent>
    </IonPage>
  );
};

export default WorkspaceTab;