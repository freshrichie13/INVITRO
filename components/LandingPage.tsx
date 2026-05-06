import React, { useState, useEffect } from 'react';
import { getOccupiedSpotsListener, addToWaitlist } from '../services/firebaseService';

const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const TOTAL_SPOTS = 30;
  const [occupiedSpots, setOccupiedSpots] = useState(0);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isSubmittingWaitlist, setIsSubmittingWaitlist] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = getOccupiedSpotsListener((count) => {
      setOccupiedSpots(count);
    });
    return () => unsubscribe();
  }, []);

  const availableSpots = Math.max(0, TOTAL_SPOTS - occupiedSpots);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setIsSubmittingWaitlist(true);
    try {
      await addToWaitlist(waitlistEmail);
      setWaitlistSuccess(true);
      setWaitlistEmail('');
    } catch (err) {
      alert("Error al unirse a la lista de espera. Intenta de nuevo.");
    } finally {
      setIsSubmittingWaitlist(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-20">

      {/* ── HEADER ── */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide text-[#3B1F0E] uppercase mb-2">
          ESTÁS MIRANDO EN RADIANES
        </h1>
        <h2 className="text-3xl sm:text-4xl font-normal text-black mb-6">MAYO 14</h2>
        <p className="text-sm text-[#6B3A2A] max-w-md mx-auto leading-relaxed">
          Un taller sobre cómo la mirada por default te ha estado costando más de lo que crees
        </p>
      </div>

      {/* ── CTA SECTION (top) ── */}
      <div className="flex flex-col items-center mb-12">
        {availableSpots > 0 ? (
          <>
            <button
              id="cta-top"
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-[#3B1F0E] text-[#F5ECD7] font-bold uppercase tracking-widest text-sm sm:text-base hover:bg-[#C1714F] transition-colors duration-300 shadow-lg"
            >
              Apartar mi lugar [$550 MXN]
            </button>
            <p className="mt-3 text-xs text-[#6B3A2A] tracking-wide">
              {availableSpots} de {TOTAL_SPOTS} lugares disponibles
            </p>
          </>
        ) : (
          <div className="w-full bg-[#3B1F0E] bg-opacity-5 border border-[#C1714F] p-6 text-center">
            <h4 className="text-[#3B1F0E] font-bold uppercase tracking-widest text-sm mb-4">
              Agotado — lista de espera
            </h4>
            {waitlistSuccess ? (
              <p className="text-sm text-[#6B3A2A] font-bold animate-pulse">
                ¡Te has unido a la lista! Te avisaremos si se libera un lugar.
              </p>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="email"
                  required
                  placeholder="Tu correo..."
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-transparent border border-[#6B3A2A] text-[#3B1F0E] text-sm focus:outline-none focus:border-[#C1714F]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingWaitlist}
                  className="px-6 py-3 bg-[#3B1F0E] text-[#F5ECD7] text-xs font-bold uppercase tracking-widest hover:bg-[#C1714F] transition-colors disabled:opacity-50"
                >
                  {isSubmittingWaitlist ? 'Enviando...' : 'Unirme'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ── SECCIÓN: ¿POR QUÉ? ── */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-[#3B1F0E] uppercase tracking-widest mb-3">
          ¿Por qué invertir mi tiempo en esto?
        </h3>
        <p className="text-sm text-[#3B1F0E] leading-relaxed mb-3">
          ¿Alguna vez arruinaste un examen de matemáticas porque tu calculadora estaba en Radianes y tú ni cuenta? Bueno. Existe la posibilidad de que algo parecido te esté pasando con la mirada.
        </p>
        <p className="text-sm text-[#3B1F0E] leading-relaxed mb-3">
          Las doctrinas, la escuela, el algoritmo <strong>TODO NOS ENSEÑA A VER LA REALIDAD EN UN MODO POR DEFAULT</strong> y hace que nos perdemos de cosas valiosas.
        </p>
        <p className="text-sm text-[#3B1F0E] leading-relaxed mb-3">
          Ideas, conexiones, oportunidades que están justo enfrente pero que no vemos porque nadie nos dijo que había otro modo de ver.
        </p>
        <p className="text-sm text-[#3B1F0E] leading-relaxed">
          Este taller va de eso. Usamos ejemplos de historia del arte para ilustrar lo que decimos [pero aplica pa todo]. Y de paso te vas a escuchar muy pro hablando de estas cosas con tus amigos.
        </p>
      </div>

      {/* ── SECCIÓN: ¿QUÉ HARÁS? ── */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-[#3B1F0E] uppercase tracking-widest mb-3">
          ¿Qué harás aquí?
        </h3>
        <ul className="space-y-3">
          {[
            'Entender cómo funciona la inspiración y la incubación de ideas desde la psicología del proceso creativo.',
            'Ver por qué el arte conceptual es básicamente filosofía con descaro [y qué tiene que ver eso contigo].',
            'Hacer algo con tus propias manos que no esperabas hacer. (Más info en el correo de confirmación)',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-[#3B1F0E] leading-relaxed">
              <span className="mt-1 w-2 h-2 rounded-full bg-[#C1714F] flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* ── SECCIÓN: ¿PARA QUIÉN? ── */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-[#3B1F0E] uppercase tracking-widest mb-3">
          ¿Para quién es esto?
        </h3>
        <p className="text-sm text-[#3B1F0E] leading-relaxed mb-3">
          Para cualquier persona curiosa que tenga ganas de desafiar sus ideas. No necesitas saber de arte. No necesitas ser artista ni creativo de profesión. Solo necesitas estar dispuestx a ver las cosas diferente [aunque sea tantito].
        </p>
        <p className="text-sm text-[#3B1F0E] leading-relaxed">
          Si alguna vez estuviste en un museo pensando "esto lo hubiera hecho yo" &lbrace;probablemente tenías razón&rbrace;. Ven a comprobarlo.
        </p>
      </div>

      {/* ── BLOQUE DE DATOS DEL EVENTO ── */}
      <div className="border border-[#C1714F] border-opacity-40 p-4 sm:p-6 mb-10 space-y-3 bg-[#3B1F0E] bg-opacity-5">
        {[
          { icon: '📅', label: 'Cuándo', text: 'Jueves 14 de mayo · 6:00 – 8:30 pm' },
          { icon: '📍', label: 'Dónde', text: 'SAMÖ Cafeart — C. Cortadores de Aurora 120, Cd Aurora, León, Gto.' },
          { icon: '🎟', label: 'Costo', text: '$550 MXN · Pago en línea vía MercadoPago · Es seguro y tu lugar queda confirmado solo al completar el pago' },
          { icon: '👥', label: 'Lugares', text: `Máximo 30 · Ya sabes cómo es esto.` },
        ].map(({ icon, label, text }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">{icon}</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#6B3A2A]">{label}  </span>
              <span className="text-sm text-[#3B1F0E]">{text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAPA GOOGLE MAPS ── */}
      <div className="mb-10">
        <div className="w-full overflow-hidden border border-[#C1714F] border-opacity-30 relative" style={{ paddingBottom: '56.25%', height: 0 }}>
          <iframe
            title="SAMÖ Cafeart ubicación"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.6!2d-101.6597!3d21.1326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842bbf35b01e0e07%3A0x6dce3d2b3c61c9e7!2sSAM%C3%96%20Cafeart!5e0!3m2!1ses!2smx!4v1"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="text-xs text-[#6B3A2A] mt-2 text-center">C. Cortadores de Aurora 120, Cd Aurora, 37110 León, Gto.</p>
      </div>

      {/* ── FRASE DUCHAMP ── */}
      <div className="mb-10 text-center px-4">
        <p className="text-sm text-[#3B1F0E] leading-relaxed italic">
          Duchamp puso un mingitorio en un museo y cambió el arte para siempre. Tú puedes seguir mirando en el modo que te instalaron &lbrace;o puedes venir el 14 de mayo a ver qué pasa cuando cambias la configuración&rbrace;.
        </p>
      </div>

      {/* ── CTA SECTION (bottom) ── */}
      <div className="flex flex-col items-center mb-6">
        {availableSpots > 0 ? (
          <>
            <button
              id="cta-bottom"
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 bg-[#3B1F0E] text-[#F5ECD7] font-bold uppercase tracking-widest text-sm sm:text-base hover:bg-[#C1714F] transition-colors duration-300 shadow-lg"
            >
              Apartar mi lugar [$550 MXN]
            </button>
            <p className="mt-3 text-xs text-[#6B3A2A] tracking-wide">
              {availableSpots} de {TOTAL_SPOTS} lugares disponibles
            </p>
          </>
        ) : (
          <div className="w-full bg-[#3B1F0E] bg-opacity-5 border border-[#C1714F] p-6 text-center">
            <h4 className="text-[#3B1F0E] font-bold uppercase tracking-widest text-sm mb-4">
              Agotado — lista de espera
            </h4>
            {waitlistSuccess ? (
              <p className="text-sm text-[#6B3A2A] font-bold animate-pulse">
                ¡Te has unido a la lista! Te avisaremos si se libera un lugar.
              </p>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="email"
                  required
                  placeholder="Tu correo..."
                  value={waitlistEmail}
                  onChange={(e) => setWaitlistEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-transparent border border-[#6B3A2A] text-[#3B1F0E] text-sm focus:outline-none focus:border-[#C1714F]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingWaitlist}
                  className="px-6 py-3 bg-[#3B1F0E] text-[#F5ECD7] text-xs font-bold uppercase tracking-widest hover:bg-[#C1714F] transition-colors disabled:opacity-50"
                >
                  {isSubmittingWaitlist ? 'Enviando...' : 'Unirme'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ── BRAND ── */}
      <div className="text-center mt-8">
        <p className="font-bold text-sm tracking-widest uppercase text-[#C1714F]">INVITRO</p>
      </div>
    </div>
  );
};

export default LandingPage;
