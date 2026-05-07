import React, { useState, useCallback, useEffect } from 'react';
import { checkIfEmailExists, savePendingRegistration } from './services/firebaseService';
import { UserData, AppState } from './types';
import LandingPage from './components/LandingPage';
import RegistrationForm from './components/RegistrationForm';
import ConfirmationScreen from './components/ConfirmationScreen';
import { SuccessScreen, PendingPaymentScreen, PaymentFailedScreen } from './components/Screens';

const App: React.FC = () => {
  const getInitialAppState = (): AppState => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') return 'success';
    if (payment === 'failure') return 'payment_failed';
    if (payment === 'pending') return 'pending_payment';
    return 'landing';
  };

  const [appState, setAppState] = useState<AppState>(getInitialAppState);
  const [userData, setUserData] = useState<UserData>({ firstName: '', lastName: '', email: '', howDidYouHear: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manejar navegación con botones del navegador (atrás/adelante)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.appState) {
        setAppState(event.state.appState);
      } else {
        // Volver al estado inicial si no hay estado en el historial
        setAppState(getInitialAppState());
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Inicializar el estado en el historial para la página actual
    if (!window.history.state) {
      window.history.replaceState({ appState: getInitialAppState() }, '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Función para cambiar de estado y actualizar el historial
  const navigateTo = useCallback((newState: AppState) => {
    setAppState(newState);
    window.history.pushState({ appState: newState }, '');
  }, []);

  const handleConfirmRegistration = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const exists = await checkIfEmailExists(userData.email);
      if (exists) {
        setError('Este email ya inició un proceso de registro. Si ya pagaste, revisa tu correo.');
        navigateTo('form');
        return;
      }

      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
        }),
      });

      if (response.status === 409) {
        setError('Este email ya está registrado. Revisa tu bandeja de entrada.');
        navigateTo('form');
        return;
      }

      if (!response.ok) throw new Error('Error al crear la preferencia de pago.');

      const { init_point } = await response.json();

      await savePendingRegistration({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        howDidYouHear: userData.howDidYouHear,
        paymentStatus: 'pending_payment',
        registeredAt: new Date().toISOString(),
      });

      // Para procesos externos como Mercado Pago, no usamos navigateTo interno
      setAppState('pending_payment');
      window.location.href = init_point;

    } catch (err: any) {
      console.error('Registration failed:', err);
      setError('Ocurrió un error. Inténtalo de nuevo.');
      navigateTo('confirmation');
    } finally {
      setIsSubmitting(false);
    }
  }, [userData, navigateTo]);

  const renderContent = () => {
    switch (appState) {
      case 'landing':
        return <LandingPage onStart={() => navigateTo('form')} />;
      case 'form':
        return <RegistrationForm userData={userData} setUserData={setUserData} setAppState={navigateTo} error={error} setError={setError} />;
      case 'confirmation':
        return <ConfirmationScreen userData={userData} onConfirmOnline={handleConfirmRegistration} onBack={() => navigateTo('form')} isSubmitting={isSubmitting} />;
      case 'pending_payment':
        return <PendingPaymentScreen />;
      case 'success':
        return <SuccessScreen />;
      case 'payment_failed':
        return <PaymentFailedScreen onRetry={() => navigateTo('landing')} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        backgroundImage: "url('/images/nuevo fondo pagina registro3500pxls.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#3B1F0E',
        color: '#F5ECD7',
      }}
    >
      {renderContent()}
    </div>
  );
};

export default App;
