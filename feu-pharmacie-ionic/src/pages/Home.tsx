import { IonContent, IonButton, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { useIonRouter } from '@ionic/react';



const Home: React.FC = () => {
  // Dans le composant
  const router = useIonRouter();

  const handleNavigationToPharmacySignEditor = () => {
    router.push('/PharmacySignEditor');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Blank</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer />

        <IonButton onClick={handleNavigationToPharmacySignEditor}>Go to Pharmacy Sign Editor</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
