import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; 
import Transfer from './pages/Transfert'; 
import Transactions from './pages/Transactions'; 
/* Core CSS required for Ionic components to work properly */
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
import '@ionic/react/css/palettes/dark.system.css';
import { UserProvider } from './contexts/UserContext';
import './theme/variables.css';
import Topup from './pages/Topup';
import Notifications from './pages/Notifications';
setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <UserProvider>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/dashboard">
          <Dashboard />
        </Route>
        <Route path="/topup" component={Topup} exact />
        <Route path="/transactions" component={Transactions} exact />
        <Route path="/notifications" component={Notifications} exact />
        <Route path="/transfer" component={Transfer} exact />

        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
    </UserProvider>
  </IonApp>
);

export default App;
