import React, { createContext, useContext, useState, useEffect } from 'react';

const SeasonContext = createContext();

export const SeasonProvider = ({ children }) => {
  // 'flood' (Monsoon Flood Mode) or 'drought' (Summer Drought Mode)
  const [season, setSeason] = useState('flood');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [audioCtx, setAudioCtx] = useState(null);

  useEffect(() => {
    // Synchronize HTML root class or attributes
    if (season === 'drought') {
      document.documentElement.classList.add('theme-drought');
      document.documentElement.classList.remove('theme-flood');
    } else {
      document.documentElement.classList.add('theme-flood');
      document.documentElement.classList.remove('theme-drought');
    }
  }, [season]);

  const toggleSeason = () => {
    const nextSeason = season === 'flood' ? 'drought' : 'flood';
    setSeason(nextSeason);
    playSound(nextSeason === 'flood' ? 'water' : 'heat');
  };

  // Procedural Web Audio API sound synthesizer
  const playSound = (type) => {
    if (!soundEnabled) return;

    try {
      let ctx = audioCtx;
      if (!ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        ctx = new AudioContext();
        setAudioCtx(ctx);
      }

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        // High-tech UI blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'water') {
        // Hydro surge frequency drop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(210, now + 0.35);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'heat') {
        // Solar pulse frequency rise
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.3);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'verify') {
        // Harmonic chime for AI verification badge
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        notes.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
          noteGain.gain.setValueAtTime(0.08, now + idx * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
          
          noteOsc.start(now + idx * 0.08);
          noteOsc.stop(now + idx * 0.08 + 0.25);
        });
      }
    } catch (e) {
      console.warn("Audio playback not supported or user gesture required:", e);
    }
  };

  const themeColors = {
    isDrought: season === 'drought',
    primary: season === 'drought' ? '#FF4500' : '#00E5FF',
    primaryHover: season === 'drought' ? '#FF5E1E' : '#33EBFF',
    accent: season === 'drought' ? '#FFA500' : '#0077FF',
    glowClass: season === 'drought' ? 'glow-border-amber' : 'glow-border-cyan',
    badgeText: season === 'drought' ? 'SOLAR AMBER // 48°C THERMAL PEAK' : 'HYDRO CYAN // 205.8M YAMUNA SURGE',
    seasonTitle: season === 'drought' ? 'SUMMER DROUGHT' : 'MONSOON FLOOD'
  };

  return (
    <SeasonContext.Provider
      value={{
        season,
        setSeason,
        toggleSeason,
        themeColors,
        soundEnabled,
        setSoundEnabled,
        playSound
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
};

export const useSeason = () => useContext(SeasonContext);
