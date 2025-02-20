import React from "react";
// import PagesReader from "./components/PagesReader";
import WorkspaceTab from "./pages/WorkspaceTab";
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

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>

          <Route path="/bookshelf">
            <Bookshelf/>
          </Route>



          <Route path="/reader">
            <WorkspaceTab/>
          </Route>

          <Route exact path="/">
            <Redirect to="/reader" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
   
              <IonTabButton tab="reader" href="/reader">
            <IonIcon aria-hidden="true" icon={square} />
            <IonLabel>Workspace</IonLabel>
          </IonTabButton>
          
          
                        <IonTabButton tab="bookshelf" href="/bookshelf">
            <IonIcon aria-hidden="true" icon={square} />
            <IonLabel>Bookshelf</IonLabel>
          </IonTabButton>
          
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
