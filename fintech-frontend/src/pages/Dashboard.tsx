import React, { useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonText, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonIcon, IonButton, IonGrid,
  IonRow, IonCol
} from '@ionic/react';
import {
  walletOutline, personCircleOutline, logOutOutline,
  sendOutline, cashOutline, listOutline, notificationsOutline
} from 'ionicons/icons';
import API from '../services/api';
import { useHistory } from 'react-router-dom';

interface Wallet {
  balance: number;
  card_number: string;
}

interface User {
  name: string;
}

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<User>({ name: '' });
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return history.replace('/login');

        const resUser = await API.get('/user');
        setUser(resUser.data);

        const resWallet = await API.get('/wallet');
        setWallet(resWallet.data);
      } catch (error) {
        console.error("Erreur récupération:", error);
        history.replace('/login');
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding" style={{ background: '#f4f6fc' }}>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <IonIcon icon={personCircleOutline} style={{ fontSize: '64px', color: '#1e3a8a' }} />
          <IonText>
            <h2 style={{ marginTop: '8px', color: '#1e3a8a' }}>Bienvenue, {user.name}</h2>
          </IonText>
        </div>

        {/* Carte virtuelle */}
        <IonCard style={{
          marginTop: '24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          color: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          transition: 'transform 0.3s',
          animation: 'pulse 3s infinite ease-in-out'
        }}>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1.5rem', color: 'white' }}>
              Solde actuel
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <h1 style={{ fontSize: '2.3rem', margin: 0 }}>
              {wallet?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })} FCFA
            </h1>
            <p style={{ marginTop: '10px' }}>
              Carte virtuelle : **** **** **** {wallet?.card_number.slice(-4)}
            </p>
          </IonCardContent>
        </IonCard>

        {/* Actions */}
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonButton expand="block" color="primary" onClick={() => history.push('/topup')}>
                <IonIcon icon={cashOutline} slot="start" />
                Recharger
              </IonButton>
            </IonCol>
            <IonCol size="6">
              <IonButton expand="block" color="tertiary" onClick={() => history.push('/transfer')}>
                <IonIcon icon={sendOutline} slot="start" />
                Transfert
              </IonButton>
            </IonCol>
            <IonCol size="6">
              <IonButton expand="block" color="medium" onClick={() => history.push('/transactions')}>
                <IonIcon icon={listOutline} slot="start" />
                Historique
              </IonButton>
            </IonCol>
            <IonCol size="6">
              <IonButton expand="block" color="warning" onClick={() => history.push('/notifications')}>
                <IonIcon icon={notificationsOutline} slot="start" />
                Notifications
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <IonButton color="danger" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} slot="start" />
            Déconnexion
          </IonButton>
        </div>

        <style>
          {`
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.02); }
              100% { transform: scale(1); }
            }
          `}
        </style>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
