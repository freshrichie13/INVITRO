import React from 'react';
import { UserData } from '../types';
import Window from './Window';
import Button from './Button';

const ConfirmationScreen: React.FC<{
  userData: UserData;
  onConfirmOnline: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}> = ({ userData, onConfirmOnline, onBack, isSubmitting }) => (
  <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-4 pb-20 px-4">
    <Window>
      <div className="flex flex-col space-y-4 md:space-y-6 text-center">
        <h3 className="text-xl sm:text-2xl font-light text-[#F5ECD7]">Confirmar Datos</h3>

        {/* Texto de instrucción de pago */}
        <p className="text-xs text-[#F5ECD7] opacity-70 leading-relaxed">
          Para completar tu pre-registro y asegurar tu lugar completa tu pago por el monto de <strong className="opacity-100">$550</strong>
        </p>

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
          <Button onClick={onConfirmOnline} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Procesando...' : 'Pagar en Línea (Mercado Pago)'}
          </Button>
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

    {/* Info debajo del recuadro */}
    <div className="text-center mt-6 space-y-1 px-4">
      <p className="text-[11px] text-[#8B5E3C] opacity-80 uppercase tracking-widest">Horario: 6:00 pm a 8:30 pm</p>
      <p className="text-[10px] text-[#8B5E3C] opacity-70 leading-relaxed max-w-xs mx-auto">
        Lugar: SAMÖ Cafeart — C. Cortadores de Aurora 120, Cd Aurora, 37110 León de los Aldama, Gto
      </p>
      <p className="text-xs font-bold text-[#8B5E3C] mt-2">
        Al completar tu pago recibirás un correo con INFORMACION IMPORTANTE para tu participación en el taller
      </p>
    </div>

    <div className="fixed bottom-4 left-0 right-0">
      <p className="font-bold text-sm tracking-widest uppercase opacity-90 text-center text-[#C1714F]">INVITRO</p>
    </div>
  </div>
);

export default ConfirmationScreen;
