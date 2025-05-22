import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonItem, IonLabel, IonToast, IonText, IonLoading, IonInput
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useHistory } from 'react-router-dom';
import API from '../services/api';

const Register: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoId, setPhotoId] = useState<File>();
  const [selfie, setSelfie] = useState<File>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileImport = (callback: (file: File) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) callback(file);
    };
    input.click();
  };

  const takeSelfie = async () => {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 80
    });
    const blob = await fetch(`data:image/jpeg;base64,${photo.base64String}`).then(res => res.blob());
    const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
    setSelfie(file);
  };

  const handleRegister = async () => {
    if (!email || !phone || !photoId || !selfie) {
      return setError("Tous les champs sont requis.");
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('photo_id', photoId);
    formData.append('selfie', selfie);

    try {
      setLoading(true);
      const res = await API.post('/biometric-register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      history.replace('/login');
    } catch (err: any) {
      console.error("Erreur API register :", err.response?.data || err.message);
      setError("Échec de l’inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inscription biométrique</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{
          maxWidth: '400px',
          margin: '40px auto',
          padding: '24px',
          borderRadius: '16px',
          background: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <img
            src="/assets/register-illustration.svg"
            alt="register"
            style={{ width: '100%', maxWidth: '180px', marginBottom: '20px' }}
          />

          <IonText color="primary">
            <h2>Créer un compte</h2>
            <p>Inscription avec pièce et selfie</p>
          </IonText>

          <IonItem>
            <IonLabel position="floating">Email</IonLabel>
            <IonInput type="email" value={email} onIonChange={(e) => setEmail(e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonLabel position="floating">Téléphone</IonLabel>
            <IonInput type="tel" value={phone} onIonChange={(e) => setPhone(e.detail.value!)} />
          </IonItem>

          <IonButton expand="block" onClick={() => handleFileImport(setPhotoId)} className="ion-margin-top">
            🪪 Importer pièce d'identité
          </IonButton>
          {photoId && <p style={{ fontSize: '12px' }}>📄 {photoId.name}</p>}

          <IonButton expand="block" onClick={takeSelfie} className="ion-margin-top">
            🤳 Prendre un selfie
          </IonButton>
          {selfie && <p style={{ fontSize: '12px' }}>📸 {selfie.name}</p>}

          <IonButton expand="block" color="success" className="ion-margin-top" onClick={handleRegister}>
            ✅ S’inscrire
          </IonButton>

          <IonText className="ion-text-center ion-margin-top">
            <p style={{ fontSize: '14px' }}>
              Déjà un compte ? <a href="/login">Se connecter</a>
            </p>
          </IonText>
        </div>

        <IonToast isOpen={!!error} message={error} duration={3000} onDidDismiss={() => setError('')} />
        <IonLoading isOpen={loading} message="Inscription en cours..." />
      </IonContent>
    </IonPage>
  );
};

export default Register;
