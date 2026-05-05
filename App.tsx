import React, { useState, useCallback } from 'react';
import { firebaseApp } from './services/firebaseService';
import { checkIfPaidEmailExists, savePendingRegistration, checkIfEmailExists } from './services/firebaseService';
import { sendConfirmationEmail } from './services/emailService';
import { UserData, AppState } from './types';
import Window from './components/Window';
import Button from './components/Button';
import Input from './components/Input';
import MatrixBanner from './components/MatrixBanner';

const RegistrationForm: React.FC<{
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}> = ({ userData, setUserData, setAppState, error, setError }) => {
  const [formErrors, setFormErrors] = useState<{ firstName?: string; lastName?: string; email?: string }>({});

  const validate = (data: UserData) => {
    const errors: { firstName?: string; lastName?: string; email?: string } = {};
    
    // Validación y sanitización de firstName
    if (!data.firstName) {
      errors.firstName = "Requerido";
    } else if (data.firstName.length < 2) {
      errors.firstName = "Mínimo 2 caracteres";
    } else if (data.firstName.length > 50) {
      errors.firstName = "Máximo 50 caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(data.firstName)) {
      errors.firstName = "Solo letras, espacios y guiones";
    }

    // Validación y sanitización de lastName
    if (!data.lastName) {
      errors.lastName = "Requerido";
    } else if (data.lastName.length < 2) {
      errors.lastName = "Mínimo 2 caracteres";
    } else if (data.lastName.length > 50) {
      errors.lastName = "Máximo 50 caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(data.lastName)) {
      errors.lastName = "Solo letras, espacios y guiones";
    }

    // Validación de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!data.email) {
      errors.email = "Requerido";
    } else if (data.email.length > 100) {
      errors.email = "Email demasiado largo";
    } else if (!emailRegex.test(data.email)) {
      errors.email = "Email inválido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanData = {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        email: userData.email.trim().toLowerCase()
    };

    setUserData(cleanData);

    if (validate(cleanData)) {
      setAppState('confirmation');
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    setUserData({ firstName: '', lastName: '', email: '' });
    setFormErrors({});
    setError(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-6 sm:pt-8 md:pt-10 pb-20 md:pb-24 px-4">
      {/* Header Section */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 text-[#3B1F0E] uppercase">ESTÁS MIRANDO EN RADIANES</h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal mb-2 text-black">MAYO 14</h2>
        
        <p className="text-xs sm:text-sm md:text-base text-[#6B3A2A] max-w-md mx-auto leading-relaxed px-2 font-bold">
          Ingresa tu primer nombre, primer apellido y email para poder enviarte el código QR necesario y hacer válida tu entrada el día del evento.
        </p>
      </div>

      {/* Form Box */}
      <Window className="mb-8 md:mb-12">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 md:space-y-6">
          <h3 className="text-2xl sm:text-3xl font-light text-center mb-2 text-[#F5ECD7]">Pre-registro</h3>
          
          {error && <div className="bg-[#3B1F0E] border border-[#D9534F] text-[#F5ECD7] px-4 py-2 text-sm text-center">{error}</div>}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input 
                id="firstName"
                type="text" 
                value={userData.firstName}
                onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                className={`w-full ${formErrors.firstName ? 'border-red-500' : ''}`}
                placeholder="Primer nombre..."
                maxLength={50}
              />
              {formErrors.firstName && <p className="text-[#D9534F] text-xs mt-1 ml-1">{formErrors.firstName}</p>}
            </div>
            <div className="flex-1">
              <Input 
                id="lastName"
                type="text" 
                value={userData.lastName}
                onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                className={`w-full ${formErrors.lastName ? 'border-red-500' : ''}`}
                placeholder="Primer apellido..."
                maxLength={50}
              />
              {formErrors.lastName && <p className="text-[#D9534F] text-xs mt-1 ml-1">{formErrors.lastName}</p>}
            </div>
          </div>

          <div>
            <Input 
              id="email"
              type="email" 
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              className={`w-full ${formErrors.email ? 'border-red-500' : ''}`}
              placeholder="Email..."
              maxLength={100}
            />
            {formErrors.email && <p className="text-[#D9534F] text-xs mt-1 ml-1">{formErrors.email}</p>}
          </div>

          <p className="text-[10px] text-center text-gray-500 uppercase tracking-wide">
            Asegurate de ingresar tu info correctamente
          </p>
          
          <div className="flex flex-col-reverse md:flex-row justify-center pt-2 gap-3">
            <button 
              type="button"
              onClick={handleReset}
              className="px-6 py-2 bg-transparent border-2 border-[#6B3A2A] text-[#F5ECD7] opacity-60 font-bold uppercase tracking-widest hover:border-[#C1714F] hover:opacity-100 transition-colors w-full md:w-auto min-w-[120px]"
            >
              Limpiar
            </button>
            <Button type="submit" className="w-full md:w-auto min-w-[120px]">Enviar</Button>
          </div>
        </form>
      </Window>

      {/* Footer Info */}
      <div className="text-center space-y-2 mb-8 md:mb-16">
        <p className="text-base text-[#3B1F0E] px-2 tracking-wide font-bold text-center">
          Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees
        </p>
      </div>

      {/* Bottom Brand */}
      <div className="fixed bottom-4 left-0 right-0">
        <p className="font-bold text-sm tracking-widest uppercase opacity-90 text-center text-[#C1714F]">
          INVITRO
        </p>
      </div>
    </div>
  );
};

const ConfirmationScreen: React.FC<{
  userData: UserData;
  onConfirmOnline: () => void;
  onConfirmDoor: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}> = ({ userData, onConfirmOnline, onConfirmDoor, onBack, isSubmitting }) => (
  <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-4 pb-20 px-4">
    <Window>
      <div className="flex flex-col space-y-4 md:space-y-6 text-center">
        <h3 className="text-xl sm:text-2xl font-light text-[#F5ECD7]">Confirmar Datos</h3>
        <div className="text-left space-y-3 md:space-y-4 border-t border-b border-[#6B3A2A] py-3 md:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <span className="font-bold text-[#F5ECD7] opacity-60 text-xs sm:text-sm uppercase">Nombre:</span>
            <span className="sm:col-span-2 font-medium text-sm sm:text-base break-words text-[#F5ECD7]">{userData.firstName} {userData.lastName}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
            <span className="font-bold text-[#F5ECD7] opacity-60 text-xs sm:text-sm uppercase">Email:</span>
            <span className="sm:col-span-2 font-medium text-sm sm:text-base break-all text-[#F5ECD7]">{userData.email}</span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex flex-col gap-3">
             <Button onClick={onConfirmOnline} disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Procesando...' : 'Pagar en Línea (Mercado Pago)'}
            </Button>
            <button 
              onClick={onConfirmDoor} 
              disabled={isSubmitting}
              className="w-full px-6 py-2 bg-transparent border-2 border-[#C1714F] text-[#F5ECD7] font-bold uppercase tracking-widest hover:bg-[#C1714F] hover:text-[#3B1F0E] transition-all disabled:opacity-50"
            >
              Registrar y Pagar en Puerta
            </button>
          </div>
          
          <button 
            onClick={onBack} 
            disabled={isSubmitting} 
            className="text-xs uppercase tracking-widest text-[#F5ECD7] opacity-40 hover:opacity-100 transition-opacity"
          >
            ← Volver a editar
          </button>
        </div>
      </div>
    </Window>
  </div>
);

const SuccessPayAtDoorScreen: React.FC = () => (
  <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-6 md:pt-10 pb-20 px-4">
    <div className="text-center mb-6 md:mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 text-[#3B1F0E] uppercase">ESTÁS MIRANDO EN RADIANES</h1>
    </div>

    <Window className="mb-8 md:mb-12">
      <div className="flex flex-col space-y-4 md:space-y-6 text-center">
        <h3 className="text-2xl sm:text-3xl font-light mb-3 md:mb-4 text-[#F5ECD7]">¡Registro Recibido!</h3>
        
        <div className="text-left space-y-3 md:space-y-4 border-t border-b border-[#6B3A2A] py-4 md:py-6">
          <p className="text-sm md:text-base text-[#F5ECD7] opacity-80 leading-relaxed px-2">
            Tu registro ha sido guardado correctamente. <br/><br/>
            <strong className="text-[#C1714F]">PAGO PENDIENTE:</strong> Deberás realizar tu pago directamente en la entrada del evento para recibir tu acceso.
          </p>
        </div>
        
        <p className="text-base md:text-lg lg:text-xl font-light text-[#F5ECD7]">
          Te esperamos 8:00 PM
        </p>
      </div>
    </Window>

    <div className="text-center px-4 mb-12 animate-pulse">
      <p className="text-sm md:text-base text-[#3B1F0E] font-bold tracking-wide">
        CONFIRMACIÓN ENVIADA: Revisa tu bandeja de entrada. <br className="hidden sm:block" />
        Hemos enviado los detalles de tu registro a tu correo electrónico.
      </p>
      <p className="text-[10px] md:text-xs text-[#3B1F0E] mt-2 uppercase tracking-widest font-bold opacity-90">
        (No olvides checar tu carpeta de SPAM)
      </p>
    </div>

    <div className="fixed bottom-4 left-0 right-0">
      <p className="font-bold text-sm tracking-widest uppercase opacity-90 text-center text-[#C1714F]">
        INVITRO
      </p>
    </div>
  </div>
);

const SuccessScreen: React.FC = () => (
  <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-6 md:pt-10 pb-20 px-4">
    {/* Header Section */}
    <div className="text-center mb-6 md:mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 text-[#3B1F0E] uppercase">ESTÁS MIRANDO EN RADIANES</h1>
    </div>

    {/* Success Box */}
    <Window className="mb-8 md:mb-12">
      <div className="flex flex-col space-y-4 md:space-y-6 text-center">
        <h3 className="text-2xl sm:text-3xl font-light mb-3 md:mb-4 text-[#F5ECD7]">¡Pre-registro Exitoso!</h3>
        
        <div className="text-left space-y-3 md:space-y-4 border-t border-b border-[#6B3A2A] py-4 md:py-6">
          <p className="text-sm md:text-base text-[#F5ECD7] opacity-80 leading-relaxed px-2">
            Tu pago fue confirmado. Recibirás un correo con el código QR en los próximos minutos — puede tardar un poco en llegar.
          </p>
        </div>
        
        <p className="text-base md:text-lg lg:text-xl font-light text-[#F5ECD7]">
          Te esperamos 8:00 PM
        </p>
      </div>
    </Window>

    {/* Footer Info */}
    <div className="text-center space-y-2 mb-8 md:mb-16">
      <p className="text-base text-[#3B1F0E] px-2 tracking-wide font-bold text-center">
        Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees
      </p>
    </div>

    {/* Bottom Brand */}
    <div className="fixed bottom-4 left-0 right-0">
      <p className="font-bold text-sm tracking-widest uppercase opacity-90 text-center text-[#C1714F]">
        INVITRO
      </p>
    </div>
  </div>
);

const PendingPaymentScreen: React.FC = () => (
  <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-6 md:pt-10 pb-20 px-4">
    <div className="text-center mb-6 md:mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 text-[#3B1F0E] uppercase">ESTÁS MIRANDO EN RADIANES</h1>
    </div>
    <Window className="mb-8 md:mb-12">
      <div className="flex flex-col space-y-4 text-center">
        <h3 className="text-xl sm:text-2xl font-light text-[#F5ECD7]">Redirigiendo a Mercado Pago...</h3>
        <p className="text-sm text-[#F5ECD7] opacity-80">
          Estás siendo redirigido para completar tu pago de forma segura.
        </p>
      </div>
    </Window>
    <div className="fixed bottom-4 left-0 right-0">
      <p className="font-bold text-sm tracking-widest uppercase opacity-90 text-center text-[#C1714F]">INVITRO</p>
    </div>
  </div>
);

const PaymentFailedScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-6 md:pt-10 pb-20 px-4">
    <div className="text-center mb-6 md:mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 text-[#3B1F0E] uppercase">ESTÁS MIRANDO EN RADIANES</h1>
    </div>
    <Window className="mb-8 md:mb-12">
      <div className="flex flex-col space-y-4 md:space-y-6 text-center">
        <h3 className="text-xl sm:text-2xl font-light text-[#F5ECD7]">Pago no completado</h3>
        <div className="border-t border-b border-[#6B3A2A] py-4">
          <p className="text-sm text-[#F5ECD7] opacity-80 leading-relaxed px-2">
            Tu pago no fue procesado. Puedes intentarlo de nuevo cuando quieras.
          </p>
        </div>
        <Button onClick={onRetry} className="w-full sm:w-auto mx-auto">Intentar de nuevo</Button>
      </div>
    </Window>
    <div className="fixed bottom-4 left-0 right-0">
      <p className="font-bold text-sm tracking-widest uppercase opacity-90 text-center text-[#C1714F]">INVITRO</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const getInitialAppState = (): AppState => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') return 'success';
    if (payment === 'failure') return 'payment_failed';
    if (payment === 'pending') return 'pending_payment';
    return 'form';
  };

  const [appState, setAppState] = useState<AppState>(getInitialAppState);
  const [userData, setUserData] = useState<UserData>({ firstName: '', lastName: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmRegistration = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Check if email exists before creating preference
      const exists = await checkIfEmailExists(userData.email);
      if (exists) {
        setError('Este email ya inició un proceso de registro. Si ya pagaste, revisa tu correo.');
        setAppState('form');
        return;
      }

      // Call Vercel Serverless Function to create MP preference
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
        setAppState('form');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al crear la preferencia de pago.');
      }

      const { init_point } = await response.json();

      // Save pending registration in Firebase before redirecting
      await savePendingRegistration({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        paymentStatus: 'pending_payment',
        registeredAt: new Date().toISOString(),
      });

      // Redirect to Mercado Pago
      setAppState('pending_payment');
      window.location.href = init_point;

    } catch (err: any) {
      console.error("Registration failed:", err);
      setError('Ocurrió un error. Inténtalo de nuevo.');
      setAppState('confirmation');
    } finally {
      setIsSubmitting(false);
    }
  }, [userData]);

  const handleRegisterAtDoor = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const exists = await checkIfEmailExists(userData.email);
      if (exists) {
        setError('Este email ya está registrado.');
        setAppState('form');
        return;
      }

      const qrContent = encodeURIComponent(
        `PAGO EN PUERTA | Nombre: ${userData.firstName} ${userData.lastName} | Email: ${userData.email} | Evento: RADIANES - MAYO 14`
      );
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrContent}&margin=10`;

      await savePendingRegistration({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        paymentStatus: 'pay_at_door',
        registeredAt: new Date().toISOString(),
        qrCodeUrl: qrCodeUrl
      });

      // Send email notification for door payment
      try {
        await sendConfirmationEmail({
          to_name: `${userData.firstName} ${userData.lastName}`,
          to_email: userData.email,
          qr_code_image_url: qrCodeUrl,
          event_name: "ESTÁS MIRANDO EN RADIANES",
          event_date: "14 de Mayo",
          event_location: "Por confirmar",
          event_time: "8:00 PM"
        });
      } catch (e) {
        console.warn("Email could not be sent, but registration is saved.");
      }

      setAppState('success_door');
    } catch (err: any) {
      console.error("Door registration failed:", err);
      setError('Error al registrar. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [userData]);

  const handleGoBack = () => {
    setAppState('form');
  };

  const renderContent = () => {
    switch (appState) {
      case 'form':
        return <RegistrationForm userData={userData} setUserData={setUserData} setAppState={setAppState} error={error} setError={setError} />;
      case 'confirmation':
        return <ConfirmationScreen 
          userData={userData} 
          onConfirmOnline={handleConfirmRegistration} 
          onConfirmDoor={handleRegisterAtDoor}
          onBack={handleGoBack} 
          isSubmitting={isSubmitting} 
        />;
      case 'pending_payment':
        return <PendingPaymentScreen />;
      case 'success':
        return <SuccessScreen />;
      case 'success_door':
        return <SuccessPayAtDoorScreen />;
      case 'payment_failed':
        return <PaymentFailedScreen onRetry={() => setAppState('form')} />;
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
      {/* <MatrixBanner /> */}
    </div>
  );
};

export default App;
