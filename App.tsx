import React, { useState, useCallback } from 'react';
import { firebaseApp } from './services/firebaseService';
import { checkIfEmailExists, saveRegistration } from './services/firebaseService';
import { sendConfirmationEmail } from './services/emailService';
import { UserData, AppState } from './types';
import Window from './components/Window';
import Button from './components/Button';
import Input from './components/Input';
import MatrixBanner from './components/MatrixBanner';

// This is a global declaration for the QRCode library loaded from CDN
declare var QRCode: any;

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
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide mb-2 text-[#3B1F0E]">Estás Mirando en Radianes</h1>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-2 text-black">MAYO 14</h2>
        <p className="text-base sm:text-lg md:text-xl font-light mb-2 text-[#F5ECD7] max-w-md mx-auto leading-relaxed px-2">
          Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees.
        </p>
        
        <p className="text-xs sm:text-sm md:text-base text-[#F5ECD7] opacity-80 max-w-md mx-auto leading-relaxed px-2">
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
        <p className="text-sm text-gray-400 px-2 tracking-wide font-light text-center">
          Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees.
        </p>
      </div>

      {/* Bottom Brand */}
      <div className="mt-auto">
        <p className="font-normal text-xs tracking-widest uppercase opacity-90 text-center text-[#C1714F]">
          INVITRO
        </p>
      </div>
    </div>
  );
};

const ConfirmationScreen: React.FC<{
  userData: UserData;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}> = ({ userData, onConfirm, onBack, isSubmitting }) => (
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
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4 pt-2">
          <Button onClick={onBack} disabled={isSubmitting} className="w-full sm:w-auto border-gray-400 text-gray-600">Volver</Button>
          <Button onClick={onConfirm} disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? '...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </Window>
  </div>
);

const SuccessScreen: React.FC = () => (
  <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-6 md:pt-10 pb-20 px-4">
    {/* Header Section */}
    <div className="text-center mb-6 md:mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-wide mb-2 text-[#3B1F0E]">Estás Mirando en Radianes</h1>
    </div>

    {/* Success Box */}
    <Window className="mb-8 md:mb-12">
      <div className="flex flex-col space-y-4 md:space-y-6 text-center">
        <h3 className="text-2xl sm:text-3xl font-light mb-3 md:mb-4 text-[#F5ECD7]">¡Pre-registro Exitoso!</h3>
        
        <div className="text-left space-y-3 md:space-y-4 border-t border-b border-[#6B3A2A] py-4 md:py-6">
          <p className="text-sm md:text-base text-[#F5ECD7] opacity-80 leading-relaxed px-2">
            Debiste recibir un correo con la dirección del evento, además del código QR que deberás presentar ese día en la puerta.
          </p>
        </div>
        
        <p className="text-base md:text-lg lg:text-xl font-light text-[#F5ECD7]">
          Te esperamos 8:00 PM
        </p>
      </div>
    </Window>

    {/* Footer Info */}
    <div className="text-center space-y-2 mb-8 md:mb-16">
      <p className="text-sm text-gray-400 px-2 tracking-wide font-light text-center">
        Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees.
      </p>
    </div>

    {/* Bottom Brand */}
    <div className="mt-auto">
      <p className="font-normal text-xs tracking-widest uppercase opacity-90 text-center text-[#C1714F]">
        INVITRO
      </p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('form');
  const [userData, setUserData] = useState<UserData>({ firstName: '', lastName: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmRegistration = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Initialize firebase if not already
      firebaseApp; 

      const emailExists = await checkIfEmailExists(userData.email);
      if (emailExists) {
        setError('Este email ya ha sido registrado.');
        setAppState('form');
        setIsSubmitting(false);
        return;
      }

      const fullName = `${userData.firstName} ${userData.lastName}`;
      const registrationDate = new Date();
      
      // Format date and time in readable format (Spanish locale)
      const formattedDate = registrationDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = registrationDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      // QR Code content formatted in an executive/professional way
      // This will be readable when scanned and can be used to mark as processed in Firebase
      const qrContent = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PRE-REGISTRO VÁLIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre: ${userData.firstName} ${userData.lastName}
Email: ${userData.email}
Fecha: ${formattedDate}
Hora: ${formattedTime}
Evento: ESTÁS MIRANDO EN RADIANES - MAYO 14

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
      
      // Check if QRCode is available
      if (typeof QRCode === 'undefined') {
        throw new Error('QRCode library not loaded');
      }
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrContent, { width: 300, margin: 2 });

      const registrationData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: fullName, // Keeping 'name' for backward compatibility if needed
        email: userData.email,
        qrCodeDataUrl: qrCodeDataUrl,
        registeredAt: new Date().toISOString()
      };

      await saveRegistration(registrationData as any);
      
      await sendConfirmationEmail({
        to_name: fullName,
        to_email: userData.email,
        qr_code_image_url: qrCodeDataUrl,
        event_name: "ESTÁS MIRANDO EN RADIANES",
        event_date: "14 de Mayo",
        event_location: "Por confirmar",
        event_time: "8:00 PM"
      });

      setAppState('success');
    } catch (err: any) {
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Registration failed:", err);
      }
      setError(`Ocurrió un error. Inténtalo de nuevo.`);
      setAppState('form');
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
        return <ConfirmationScreen userData={userData} onConfirm={handleConfirmRegistration} onBack={handleGoBack} isSubmitting={isSubmitting} />;
      case 'success':
        return <SuccessScreen />;
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
