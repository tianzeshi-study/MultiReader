import './i18n'; // 确保 i18n 初始化
import { useTranslation } from 'react-i18next';

import React from "react";
// import PagesReader from "./components/PagesReader";
import WorkspaceTab from "./pages/WorkspaceTab";
import BookViewer from "./pages/BookViewer";
import Bookshelf from "./components/Bookshelf";

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

<Route path="/books/:id">
            <BookViewer />
          </Route>
          
          <Route exact path="/bookshelf">
            <Bookshelf/>
          </Route>



          <Route exact path="/reader">
            <WorkspaceTab/>
          </Route>

          <Route exact path="/">
            <Redirect to="/reader" />
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
          
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);
};

export default App;