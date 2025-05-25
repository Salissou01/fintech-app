
import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonInput,
  IonItem, IonLabel, IonButton, IonToast, IonLoading, IonIcon,
  IonButtons, IonBackButton, IonModal
} from '@ionic/react';
import { sendOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import Lottie from 'lottie-react';
import successAnimation from '../assets/lottie/success.json';
import errorAnimation from '../assets/lottie/error.json';
import API from '../services/api';
import { useUser } from '../contexts/UserContext';

const Transfer: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const history = useHistory();
  const { setTriggerRefresh } = useUser();

  const handleTransfer = async () => {
    if (!phone || !amount) {
      setErrorMessage("Veuillez remplir tous les champs obligatoires.");
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      await API.post('/transfer', {
        receiver_phone: phone,
        amount,
        note
      });

      setTriggerRefresh(true); 
      setShowSuccessModal(true);
      setPhone('');
      setAmount('');
      setNote('');
      setTimeout(() => {
        setShowSuccessModal(false);
        history.push('/dashboard');
      }, 2500);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Erreur lors du transfert.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Faire un transfert</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="ion-text-center">
          <IonIcon icon={sendOutline} style={{ fontSize: '60px', color: '#3880ff' }} />
          <h2>Envoyer de l'argent</h2>
        </div>

        <IonItem>
          <IonLabel position="stacked">Téléphone du destinataire</IonLabel>
          <IonInput
            type="tel"
            value={phone}
            onIonChange={e => setPhone(e.detail.value!)}
            placeholder="Ex: 771234567"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Montant (FCFA)</IonLabel>
          <IonInput
            type="number"
            value={amount}
            onIonChange={e => setAmount(e.detail.value!)}
            placeholder="Ex: 5000"
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Note (facultatif)</IonLabel>
          <IonInput
            type="text"
            value={note}
            onIonChange={e => setNote(e.detail.value!)}
            placeholder="Ex: remboursement, cadeau..."
          />
        </IonItem>

        <IonButton expand="block" className="ion-margin-top" onClick={handleTransfer}>
          Envoyer maintenant
        </IonButton>

        <IonLoading isOpen={loading} message="Traitement en cours..." />

    
        <IonModal isOpen={showSuccessModal} backdropDismiss={false}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
            <Lottie animationData={successAnimation} loop={false} style={{ height: 200 }} />
            <h3>Transfert réussi !</h3>
          </div>
        </IonModal>

    
        <IonModal isOpen={showErrorModal} backdropDismiss={true} onDidDismiss={() => setShowErrorModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
            <Lottie animationData={errorAnimation} loop={false} style={{ height: 200 }} />
            <h3 style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</h3>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Transfer;
