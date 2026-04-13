
import React, { useState, useRef, useEffect } from 'react';

const GlitchSound: React.FC = () => {
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // This sound is a royalty-free "computer static" sound from Pixabay
  const audioSrc = "https://cdn.pixabay.com/download/audio/2022/11/17/audio_7015dd5b6a.mp3";

  // Effect to handle the muted property of the audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  // Effect to attempt playing the audio on component mount
  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      // Muted autoplay is generally allowed by browsers. Unmuted can be tricky.
      audioEl.play().catch(error => {
        console.warn("Audio autoplay was prevented by the browser. User must interact to enable sound.", error);
        // If autoplay fails, we should reflect that in the state
        setIsMuted(true);
      });
    }
  }, []);

  const toggleMute = () => {
    setIsMuted(prevMuted => !prevMuted);
  };

  return (
    <div>
      <audio ref={audioRef} src={audioSrc} loop autoPlay playsInline />
      <button
        onClick={toggleMute}
        className="fixed bottom-0 right-0 m-4 z-50 text-[#39FF14] hover:brightness-150 focus:outline-none"
        aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
      >
        {isMuted ? (
          // Speaker slashed icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        ) : (
          // Speaker wave icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 8.25c.534.931.841 2.01.841 3.125s-.307 2.194-.841 3.125m2.109-6.25a9 9 0 010 6.25m-2.109-6.25a9 9 0 000 6.25M6.75 8.25H4.51c-.88 0-1.704.507-1.938-1.354A9.01 9.01 0 012.25 12c0 .83.112 1.633.322 2.396C2.806 15.244 3.63 15.75 4.51 15.75H6.75l4.72 4.72a.75.75 0 001.28-.53V4.06a.75.75 0 00-1.28-.53L6.75 8.25z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default GlitchSound;
