import React, { useState, useEffect, useRef } from 'react';

const MatrixBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timeoutRef = useRef<number | null>(null);

  const message = "> SYSTEM ALERT: LIVE SETS @ VICENTE GUERRERO #130 [17 ABR 8:00 PM] COVER $90_";

  // Glitch sound (static noise) - optional, will fail silently if not available
  const audioSrc = null; // Disabled to avoid CORS/403 errors

  const playGlitchSound = () => {
    // Audio is optional - skip if not configured
    if (!audioSrc || !audioRef.current) {
      return;
    }
    
    try {
      // Randomize playback position to make it sound distinct each time
      audioRef.current.currentTime = Math.random() * 2;
      audioRef.current.volume = 0.3; // Lower volume so it's not too jarring
      audioRef.current.play().catch((err) => {
        // Silently ignore autoplay and network errors
        console.debug('Audio playback skipped:', err);
      });
      
      // Stop sound after a short burst
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }, 300 + Math.random() * 500);
    } catch (err) {
      // Silently ignore any audio errors
      console.debug('Audio error:', err);
    }
  };

  const triggerShortCircuit = () => {
    // 1. Start Glitch Sequence
    let flickerCount = 0;
    const maxFlickers = 5 + Math.floor(Math.random() * 10); // 5 to 15 flickers
    
    playGlitchSound();

    const flickerInterval = setInterval(() => {
      setOpacity(Math.random() > 0.5 ? 1 : 0.2); // Flicker between full and dim
      setIsVisible(true);
      flickerCount++;

      if (flickerCount >= maxFlickers) {
        clearInterval(flickerInterval);
        
        // 2. Determine if it stays ON or turns OFF
        const stayOn = Math.random() > 0.3; // 70% chance to stay on for a bit
        
        if (stayOn) {
          setOpacity(1);
          // Stay on for 2-5 seconds then turn off
          timeoutRef.current = window.setTimeout(() => {
            setOpacity(0);
            setIsVisible(false);
            scheduleNextGlitch();
          }, 2000 + Math.random() * 3000);
        } else {
          setOpacity(0);
          setIsVisible(false);
          scheduleNextGlitch();
        }
      }
    }, 50); // Fast flicker speed (50ms)
  };

  const scheduleNextGlitch = () => {
    // Wait anywhere from 3 to 10 seconds before the next short circuit
    const delay = 3000 + Math.random() * 7000;
    timeoutRef.current = window.setTimeout(triggerShortCircuit, delay);
  };

  useEffect(() => {
    // Start the loop
    scheduleNextGlitch();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isVisible) {
    return audioSrc ? <audio ref={audioRef} src={audioSrc} preload="auto" /> : null;
  }

  return (
    <>
      {audioSrc && <audio ref={audioRef} src={audioSrc} preload="auto" />}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-black text-[#39FF14] p-2 sm:p-3 z-50 overflow-hidden border-t-2 sm:border-t-4 border-[#39FF14]"
        style={{ 
          fontFamily: "'VT323', monospace", 
          opacity: opacity,
          boxShadow: "0 0 20px rgba(57, 255, 20, 0.5)",
          textShadow: "2px 2px 0px rgba(0, 50, 0, 0.8)"
        }}
      >
        <div className="container mx-auto text-center uppercase tracking-widest text-sm sm:text-base md:text-xl lg:text-2xl px-2">
          {message}
        </div>
        {/* Scanline effect overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] bg-repeat z-10 opacity-20"></div>
      </div>
    </>
  );
};

export default MatrixBanner;