import React from 'react';
import Window from './Window';

export const SuccessScreen: React.FC = () => (
  <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-6 md:pt-10 pb-20 px-4">
    <div className="text-center mb-6 md:mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 text-[#3B1F0E] uppercase">
        ESTÁS MIRANDO EN RADIANES
      </h1>
    </div>
    <Window className="mb-8 md:mb-12">
      <div className="flex flex-col space-y-4 md:space-y-6 text-center">
        <h3 className="text-2xl sm:text-3xl font-light mb-3 md:mb-4 text-[#F5ECD7]">¡Listo!</h3>
        <div className="text-left space-y-3 border-t border-b border-[#6B3A2A] py-4 md:py-6">
          <p className="text-sm md:text-base text-[#F5ECD7] opacity-80 leading-relaxed px-2">
            Tu mirada ya tiene fecha. Revisa tu correo — te mandamos todo lo que necesitas saber.
          </p>
        </div>
        <p className="text-base md:text-lg font-light text-[#F5ECD7]">
          Te esperamos el 14 de mayo · 6:00 PM
        </p>
      </div>
    </Window>
    <div className="text-center px-4 mb-12 animate-pulse">
      <p className="text-sm md:text-base text-[#3B1F0E] font-bold tracking-wide">
        CONFIRMACIÓN ENVIADA: Revisa tu bandeja de entrada.
      </p>
      <p className="text-[10px] md:text-xs text-[#3B1F0E] mt-2 uppercase tracking-widest font-bold opacity-90">
        (No olvides checar tu carpeta de SPAM)
      </p>
    </div>
    <div className="fixed bottom-4 left-0 right-0">
      <p className="font-bold text-sm tracking-widest uppercase opacity-90 text-center text-[#C1714F]">INVITRO</p>
    </div>
  </div>
);

export const PendingPaymentScreen: React.FC = () => (
  <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-6 md:pt-10 pb-20 px-4">
    <div className="text-center mb-6 md:mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 text-[#3B1F0E] uppercase">
        ESTÁS MIRANDO EN RADIANES
      </h1>
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

export const PaymentFailedScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen pt-6 md:pt-10 pb-20 px-4">
    <div className="text-center mb-6 md:mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide mb-2 text-[#3B1F0E] uppercase">
        ESTÁS MIRANDO EN RADIANES
      </h1>
    </div>
    <Window className="mb-8 md:mb-12">
      <div className="flex flex-col space-y-4 md:space-y-6 text-center">
        <h3 className="text-xl sm:text-2xl font-light text-[#F5ECD7]">Pago no completado</h3>
        <div className="border-t border-b border-[#6B3A2A] py-4">
          <p className="text-sm text-[#F5ECD7] opacity-80 leading-relaxed px-2">
            Tu pago no fue procesado. Puedes intentarlo de nuevo cuando quieras. Tu lugar no ha sido reservado.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="w-full sm:w-auto mx-auto px-6 py-2 bg-[#C1714F] text-[#3B1F0E] font-bold uppercase tracking-widest hover:bg-[#F5ECD7] transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </Window>
    <div className="fixed bottom-4 left-0 right-0">
      <p className="font-bold text-sm tracking-widest uppercase opacity-90 text-center text-[#C1714F]">INVITRO</p>
    </div>
  </div>
);
