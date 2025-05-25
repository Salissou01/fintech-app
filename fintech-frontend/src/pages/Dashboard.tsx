import React, { useEffect, useState } from 'react';
import {
  IonPage, IonContent, IonText, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonIcon, IonButton, IonGrid,
  IonRow, IonCol, IonImg, IonList, IonLabel, IonNote, IonItem
} from '@ionic/react';
import {
  eyeOffOutline, eyeOutline, logOutOutline,
  sendOutline, cashOutline, notificationsOutline,
  arrowDownOutline, arrowUpOutline
} from 'ionicons/icons';
import API from '../services/api';
import { useHistory } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { personCircleOutline } from 'ionicons/icons';
interface WalletAPI {
  card_number: string;
}

interface User {
  nom: string;
  prenom: string;
  photo: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<User>({ nom: '', prenom: '', photo: '' });
  const [wallet, setWallet] = useState<WalletAPI | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [showCard, setShowCard] = useState(false);
  const [latestTransactionId, setLatestTransactionId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
 

  const { balance, triggerRefresh, setTriggerRefresh, updateBalance } = useUser();

  const fetchTransactions = async () => {
    try {
      const resTx = await API.get('/transactions');
      const txList = resTx.data.transactions.slice(0, 3);
      setTransactions(txList);
      if (txList.length > 0 && txList[0].id !== latestTransactionId) {
        setLatestTransactionId(txList[0].id);
      }
    } catch (err) {
      console.error('Erreur fetch tx:', err);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      const all = res.data.notifications;
      const unread = all.filter((n: any) => !n.is_read);
      setUnreadCount(unread.length);
    } catch (e) {
      console.error('Erreur fetch notifications:', e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return history.replace('/login');

        const resUser = await API.get('/user');
        setUser(resUser.data);

        const resWallet = await API.get('/wallet');
        setWallet(resWallet.data);
        updateBalance(resWallet.data.balance);

        await fetchTransactions();
        await fetchUnreadNotifications();
      } catch (error) {
        console.error("Erreur récupération:", error);
        history.replace('/login');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!triggerRefresh) return;
    const timeout = setTimeout(async () => {
      await fetchTransactions();
      const walletResponse = await API.get('/wallet');
      updateBalance(walletResponse.data.balance);
      await fetchUnreadNotifications();
      setTriggerRefresh(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [triggerRefresh]);

  useEffect(() => {
    const handler = () => fetchUnreadNotifications();
    window.addEventListener('notification-read', handler);
    return () => window.removeEventListener('notification-read', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding" style={{ background: '#f4f6fc' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
        <IonIcon
          icon={personCircleOutline}
          style={{ fontSize: '100px', color: '#1e3a8a', marginBottom: '10px' }}
        />
        <IonText className="ion-text-center">
          <h2 style={{ color: '#1e3a8a' }}>Bienvenue,</h2>
          <h3 style={{ marginTop: '-8px', fontWeight: 'bold' }}>{user.prenom.toUpperCase()}</h3>
        </IonText>
      </div>


        <IonCard style={{ marginTop: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', color: 'white' }}>
          <IonCardHeader>
            <IonCardTitle style={{ fontSize: '1.5rem' }}>
              Solde actuel
              <IonIcon
                icon={showBalance ? eyeOffOutline : eyeOutline}
                onClick={() => setShowBalance(!showBalance)}
                style={{ marginLeft: '8px', cursor: 'pointer' }}
              />
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <h1 style={{ fontSize: '2.3rem', margin: 0 }}>
              {showBalance ? balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) + ' FCFA' : '••••••••'}
            </h1>
            <p style={{ marginTop: '10px' }}>
              Carte virtuelle : {showCard ? wallet?.card_number : '**** **** **** ' + wallet?.card_number?.slice(-4)}
              <IonIcon
                icon={showCard ? eyeOffOutline : eyeOutline}
                onClick={() => setShowCard(!showCard)}
                style={{ marginLeft: '8px', cursor: 'pointer' }}
              />
            </p>
          </IonCardContent>
        </IonCard>

        <IonGrid className="ion-margin-top">
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
            <IonCol size="12">
              <IonButton expand="block" color="warning" onClick={() => history.push('/notifications')}>
                <IonIcon icon={notificationsOutline} slot="start" />
                Notifications
                {unreadCount > 0 && (
                  <IonNote slot="end" color="danger" style={{ marginLeft: '8px', fontSize: '0.8rem' }}>
                    {unreadCount}
                  </IonNote>
                )}
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonCard style={{ borderRadius: '16px', marginTop: '16px' }}>
          <IonCardHeader>
            <IonCardTitle>Historique récent</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {transactions.length === 0 ? (
              <IonText color="medium">Aucune transaction récente.</IonText>
            ) : (
              <IonList>
                {transactions.map((tx) => (
                  <IonItem key={tx.id} lines="inset">
                    <IonIcon
                      icon={tx.type === 'credit' ? arrowDownOutline : arrowUpOutline}
                      slot="start"
                      color={tx.type === 'credit' ? 'success' : 'danger'}
                      style={{ fontSize: '20px' }}
                    />
                    <IonLabel>
                      <h3 style={{ margin: 0 }}>{tx.description}</h3>
                      <p style={{ fontSize: '0.9rem', color: '#555' }}>{new Date(tx.created_at).toLocaleString()}</p>
                    </IonLabel>
                    <IonNote slot="end" color={tx.type === 'credit' ? 'success' : 'danger'}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} FCFA
                    </IonNote>
                  </IonItem>
                ))}
              </IonList>
            )}
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <IonButton size="small" fill="clear" onClick={() => history.push('/transactions')}>
                Voir plus
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <IonButton color="danger" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} slot="start" />
            Déconnexion
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
