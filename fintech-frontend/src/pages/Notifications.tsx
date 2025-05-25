
import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonText, IonButtons,
  IonBackButton, IonNote, IonSpinner
} from '@ionic/react';
import API from '../services/api';

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const markAsRead = async (id: number) => {
    try {
      await API.post(`/notifications/${id}/read`);
      setNotifications(prev => {
        const updated = prev.map(n => n.id === id ? { ...n, is_read: true } : n);
       
        if (window.dispatchEvent) {
          window.dispatchEvent(new Event("notification-read"));
        }
        return updated;
      });
    } catch (e) {
      console.error('Erreur lors du marquage comme lu:', e);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/notifications');
        setNotifications(res.data.notifications);
      } catch (err) {
        console.error('Erreur chargement notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>Notifications</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" /> Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <IonText color="medium">
            <p className="ion-text-center">Aucune notification reçue.</p>
          </IonText>
        ) : (
          <IonList>
            {notifications.map((notif) => (
              <IonItem button onClick={() => markAsRead(notif.id)} key={notif.id} lines="inset" color={notif.is_read ? '' : 'light'}>
                <IonLabel>
                  <h3>{notif.title}</h3>
                  <p>{notif.message}</p>
                </IonLabel>
                <IonNote slot="end">{new Date(notif.created_at).toLocaleString()}</IonNote>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Notifications;
