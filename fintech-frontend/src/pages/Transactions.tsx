
import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonNote, IonIcon, IonButtons,
  IonBackButton, IonText, IonSpinner
} from '@ionic/react';
import { cashOutline, arrowDownOutline, arrowUpOutline } from 'ionicons/icons';
import API from '../services/api';

interface Transaction {
  id: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await API.get('/transactions');
        setTransactions(res.data.transactions);
      } catch (error) {
        console.error('Erreur chargement transactions :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Historique</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" /> Chargement...
          </div>
        ) : transactions.length === 0 ? (
          <IonText color="medium">
            <p className="ion-text-center">Aucune transaction trouvée.</p>
          </IonText>
        ) : (
          <IonList>
            {transactions.map((tx) => (
              <IonItem key={tx.id} lines="full">
                <IonIcon
                  icon={tx.type === 'credit' ? arrowDownOutline : arrowUpOutline}
                  slot="start"
                  color={tx.type === 'credit' ? 'success' : 'danger'}
                />
                <IonLabel>
                  <h3>{tx.description}</h3>
                  <p>{new Date(tx.created_at).toLocaleString()}</p>
                </IonLabel>
                <IonNote slot="end" color={tx.type === 'credit' ? 'success' : 'danger'}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()} FCFA
                </IonNote>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Transactions;
