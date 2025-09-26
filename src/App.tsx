import './i18n'; // 确保 i18n 初始化
import { useTranslation } from 'react-i18next';

import React from "react";
import DashboardTab  from "./pages/DashboardTab";
import WorkspaceTab from "./pages/WorkspaceTab";
import BookViewer from "./pages/BookViewer";
// import Bookshelf from "./components/Bookshelf";
import BookshelfTab from "./pages/BookshelfTab";

import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';


import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';


setupIonicReact();

const App: React.FC = () => {

     const { t, i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang); // 记住用户选择
  };

  
    return (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>

<Route path="/bookshelf/:id">
            <BookViewer />
          </Route>
          
          <Route exact path="/bookshelf">
            <BookshelfTab/>
          </Route>



          <Route exact path="/reader">
            <WorkspaceTab/>
          </Route>

          <Route exact path="/">
            <Redirect to="/reader" />
          </Route>
          
          <Route exact path="/auth">
            <DashboardTab/>
          </Route>
          
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
   
              <IonTabButton tab="reader" href="/reader">
            <IonIcon aria-hidden="true" icon={square} />
            <IonLabel> {t('WORKSPACE')} </IonLabel>
          </IonTabButton>
          
          
                        <IonTabButton tab="bookshelf" href="/bookshelf">
            <IonIcon aria-hidden="true" icon={square} />
            <IonLabel> {t('BOOKSHELF')}</IonLabel>
          </IonTabButton>
          
          <IonTabButton tab="auth" href="/auth">
            <IonIcon aria-hidden="true" icon={square} />
            <IonLabel> {t('AUTH')} </IonLabel>
          </IonTabButton>
          
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);
};

export default App;