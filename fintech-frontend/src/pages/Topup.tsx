import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonInput, IonItem, IonLabel, IonSelect, IonSelectOption, IonToast,
  IonLoading, IonIcon, IonButtons, IonBackButton, IonModal
} from '@ionic/react';
import { walletOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import Lottie from 'lottie-react';
import successAnimation from '../assets/lottie/success.json';

import API from '../services/api';
import { useUser } from '../contexts/UserContext';

const Topup: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const history = useHistory();
  const { updateBalance, setTriggerRefresh } = useUser();

  const handleTopup = async () => {
    if (!amount || !provider) {
      setToastMsg("Veuillez remplir tous les champs.");
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/topup', { amount, provider });

      updateBalance(res.data.new_balance);
      setTriggerRefresh(true);

      // ✅ Réinitialiser les champs
      setAmount('');
      setProvider('');

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        history.push('/dashboard');
      }, 2500);
    } catch (error: any) {
      setToastMsg(`❌ ${error.response?.data?.message || "Erreur lors de la recharge"}`);
      setShowToast(true);
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
          <IonTitle>Recharger mon solde</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="ion-text-center">
          <IonIcon icon={walletOutline} style={{ fontSize: '60px', color: '#3880ff' }} />
          <h2>Recharge via service</h2>
        </div>

        <IonItem>
          <IonLabel position="stacked">Montant (FCFA)</IonLabel>
          <IonInput
            type="number"
            placeholder="Ex: 1000"
            value={amount}
            onIonChange={(e) => setAmount(e.detail.value!)}
            required
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Service</IonLabel>
          <IonSelect
            placeholder="Choisissez un service"
            value={provider}
            onIonChange={(e) => setProvider(e.detail.value)}
          >
            <IonSelectOption value="Orange Money">Orange Money</IonSelectOption>
            <IonSelectOption value="Wave">Wave</IonSelectOption>
            <IonSelectOption value="Free Money">Free Money</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonButton expand="block" onClick={handleTopup} className="ion-margin-top">
          Recharger maintenant
        </IonButton>

        <IonToast
          isOpen={showToast}
          message={toastMsg}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
        />

        <IonLoading
          isOpen={loading}
          message={'Traitement en cours...'}
        />

        <IonModal isOpen={showSuccessModal} backdropDismiss={false}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
            <Lottie animationData={successAnimation} loop={false} style={{ height: 200 }} />
            <h3>Recharge réussie !</h3>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Topup;
