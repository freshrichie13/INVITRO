import React, { useState } from 'react';
import { UserData, AppState } from '../types';
import Window from './Window';
import Button from './Button';
import Input from './Input';

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
    if (!data.firstName) errors.firstName = 'Requerido';
    else if (data.firstName.length < 2) errors.firstName = 'Mínimo 2 caracteres';
    else if (data.firstName.length > 50) errors.firstName = 'Máximo 50 caracteres';
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(data.firstName)) errors.firstName = 'Solo letras, espacios y guiones';

    if (!data.lastName) errors.lastName = 'Requerido';
    else if (data.lastName.length < 2) errors.lastName = 'Mínimo 2 caracteres';
    else if (data.lastName.length > 50) errors.lastName = 'Máximo 50 caracteres';
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/.test(data.lastName)) errors.lastName = 'Solo letras, espacios y guiones';

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!data.email) errors.email = 'Requerido';
    else if (data.email.length > 100) errors.email = 'Email demasiado largo';
    else if (!emailRegex.test(data.email)) errors.email = 'Email inválido';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanData = {
      ...userData,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      email: userData.email.trim().toLowerCase(),
    };
    setUserData(cleanData);
    if (validate(cleanData)) setAppState('confirmation');
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    setUserData({ firstName: '', lastName: '', email: '', howDidYouHear: '' });
    setFormErrors({});
    setError(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-6 sm:pt-8 md:pt-10 pb-20 px-4">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 text-[#3B1F0E] uppercase">
          ESTÁS MIRANDO EN RADIANES
        </h1>
        <h2 className="text-3xl sm:text-4xl font-normal mb-4 text-black">MAYO 14</h2>
        <p className="text-xs sm:text-sm md:text-base text-[#6B3A2A] max-w-md mx-auto leading-relaxed px-2">
          Ingresa tu primer nombre, primer apellido y email y realiza tu pago para poder registrarte y hacer válida tu entrada el día del evento.
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

          {/* Campo: ¿Cómo te enteraste? */}
          <div>
            <select
              id="howDidYouHear"
              value={userData.howDidYouHear ?? ''}
              onChange={(e) => setUserData(prev => ({ ...prev, howDidYouHear: e.target.value }))}
              className="w-full bg-transparent border border-[#6B3A2A] text-[#F5ECD7] px-3 py-2 text-sm focus:outline-none focus:border-[#C1714F] transition-colors"
            >
              <option value="" className="bg-[#3B1F0E]">¿Cómo te enteraste del taller? (opcional)</option>
              <option value="Instagram" className="bg-[#3B1F0E]">Instagram</option>
              <option value="Recomendación" className="bg-[#3B1F0E]">Recomendación</option>
              <option value="inVitro ArtLab" className="bg-[#3B1F0E]">inVitro ArtLab</option>
              <option value="Otro" className="bg-[#3B1F0E]">Otro</option>
            </select>
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

      {/* Footer info */}
      <div className="text-center space-y-2 mb-8 md:mb-16">
        <p className="text-base text-[#3B1F0E] px-2 tracking-wide text-center">
          Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees
        </p>
      </div>

      <div className="fixed bottom-4 left-0 right-0">
        <p className="font-bold text-sm tracking-widest uppercase opacity-90 text-center text-[#C1714F]">INVITRO</p>
      </div>
    </div>
  );
};

export default RegistrationForm;
