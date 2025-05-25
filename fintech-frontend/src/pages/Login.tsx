import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonToast, IonText, IonLoading, IonModal
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import API, { setAuthToken } from '../services/api';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import Lottie from 'lottie-react';
import successAnimation from '../assets/lottie/success.json';
import errorAnimation from '../assets/lottie/error.json'; 

const Login: React.FC = () => {
  const history = useHistory();
  const [photoId, setPhotoId] = useState<File>();
  const [selfie, setSelfie] = useState<File>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false); // 🔴

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

  const handleLogin = async () => {
    if (!photoId || !selfie) {
      return setError("Veuillez fournir la pièce d’identité et le selfie.");
    }

    const formData = new FormData();
    formData.append('photo_id', photoId);
    formData.append('selfie', selfie);

    try {
      setLoading(true);
      const res = await API.post('/biometric-login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const token = res.data.token;
      localStorage.setItem('token', token);
      setAuthToken(token);

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        history.replace('/dashboard');
      }, 3000);
    } catch (err: any) {
      console.error("Erreur API login :", err.response?.data || err.message);
      setShowErrorModal(true); 
      setTimeout(() => setShowErrorModal(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion biométrique</IonTitle>
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
            src="/assets/Login-illustration.svg"
            alt="login"
            style={{ width: '100%', maxWidth: '180px', marginBottom: '20px' }}
          />

          <IonText color="primary">
            <h2>Bienvenue 👋</h2>
            <p>Connectez-vous avec votre pièce d'identité</p>
          </IonText>

          <IonButton expand="block" onClick={() => handleFileImport(setPhotoId)} className="ion-margin-top">
            🪪 Importer pièce d'identité
          </IonButton>
          {photoId && <p style={{ fontSize: '12px' }}>📄 {photoId.name}</p>}

          <IonButton expand="block" onClick={takeSelfie} className="ion-margin-top">
            🤳 Prendre un selfie
          </IonButton>
          {selfie && <p style={{ fontSize: '12px' }}>📸 {selfie.name}</p>}

          <IonButton expand="block" color="success" className="ion-margin-top" onClick={handleLogin}>
            🔐 Se connecter
          </IonButton>

          <IonText className="ion-text-center ion-margin-top">
            <p style={{ fontSize: '14px' }}>
              Pas encore de compte ? <a href="/register">Créer un compte</a>
            </p>
          </IonText>
        </div>

        <IonToast isOpen={!!error} message={error} duration={3000} onDidDismiss={() => setError('')} />
        <IonLoading isOpen={loading} message="Connexion en cours..." />

    
        <IonModal isOpen={showSuccessModal} className="modal-lottie" backdropDismiss={false}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Lottie animationData={successAnimation} style={{ width: 200, height: 200 }} />
            <h2 style={{ color: 'green' }}>Connexion réussie ✅</h2>
            <p>Redirection vers le tableau de bord...</p>
          </div>
        </IonModal>

        
        <IonModal isOpen={showErrorModal} className="modal-lottie" backdropDismiss={false}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '20px',
            textAlign: 'center'
          }}>
            <Lottie animationData={errorAnimation} style={{ width: 200, height: 200 }} />
            <h2 style={{ color: 'red' }}>Échec de la connexion ❌</h2>
            <p>Vérifiez vos documents et réessayez.</p>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Login;
