import React from 'react';
import AuthPage from '../components/AuthPage'; 



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


const DashboardTab: React.FC = () => {

  return (
    
  <IonPage id="home-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle></IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
    <div>
      <AuthPage/>
    </div>
    
    </IonContent>
    </IonPage>
  );
};

export default DashboardTab;