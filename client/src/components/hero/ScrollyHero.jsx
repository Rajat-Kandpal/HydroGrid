import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeason } from '../../context/SeasonContext';
import { 
  Flame, 
  Droplets, 
  Activity, 
  Volume2, 
  VolumeX, 
  Zap, 
  ArrowDown,
  Compass,
  Radio,
  Layers,
  ShieldAlert
} from 'lucide-react';
import BrutalBadge from '../ui/BrutalBadge';

// Dynamically import all 240 frame assets in client/src/frames/
const rawFrameModules = import.meta.glob('../../frames/frame_*.jpg', { eager: true, import: 'default' });

export default function ScrollyHero({ onExploreMatrix }) {
  const { season, setSeason, soundEnabled, setSoundEnabled, playSound } = useSeason();

  // Sort frame URLs strictly in numerical order: frame_001.jpg -> frame_240.jpg
  const frameUrls = useMemo(() => {
    return Object.entries(rawFrameModules)
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([_, url]) => url);
  }, []);

  const totalFrames = frameUrls.length || 240;

  // DOM References
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesCacheRef = useRef([]);
  const lastDrawnIndexRef = useRef(-1);
  const audioTriggeredRef = useRef({ rain: false, thunder: false, heat: false });

  // State
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0); // 0.0 to 1.0
  const [loadedCount, setLoadedCount] = useState(0);
  const [isInitialReady, setIsInitialReady] = useState(false);

  // Progressive frame preloading
  useEffect(() => {
    if (!frameUrls.length) return;

    let isMounted = true;
    imagesCacheRef.current = new Array(totalFrames);

    // 1. Immediate Tier: Load frame 0 instantly
    const firstImg = new Image();
    firstImg.src = frameUrls[0];
    firstImg.onload = () => {
      if (!isMounted) return;
      imagesCacheRef.current[0] = firstImg;
      setIsInitialReady(true);
      setLoadedCount(prev => prev + 1);
      drawFrame(0);
    };

    // 2. Fast Keyframe Stride: every 8th frame for responsive scrub
    const keyframeIndices = [];
    for (let i = 8; i < totalFrames; i += 8) {
      keyframeIndices.push(i);
    }

    const loadKeyframes = async () => {
      for (const idx of keyframeIndices) {
        if (!isMounted) break;
        const img = new Image();
        img.src = frameUrls[idx];
        await new Promise((resolve) => {
          img.onload = () => {
            if (isMounted) {
              imagesCacheRef.current[idx] = img;
              setLoadedCount(prev => prev + 1);
            }
            resolve();
          };
          img.onerror = resolve;
        });
      }

      // 3. Complete Tier: Load all remaining intermediate frames in background
      for (let i = 1; i < totalFrames; i++) {
        if (!isMounted) break;
        if (imagesCacheRef.current[i]) continue;

        const img = new Image();
        img.src = frameUrls[i];
        img.onload = () => {
          if (isMounted) {
            imagesCacheRef.current[i] = img;
            setLoadedCount(prev => prev + 1);
          }
        };
      }
    };

    loadKeyframes();

    return () => {
      isMounted = false;
    };
  }, [frameUrls, totalFrames]);

  // Canvas drawing loop with aspect-cover math
  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let img = imagesCacheRef.current[frameIndex];
    if (!img) {
      for (let offset = 1; offset < totalFrames; offset++) {
        if (frameIndex - offset >= 0 && imagesCacheRef.current[frameIndex - offset]) {
          img = imagesCacheRef.current[frameIndex - offset];
          break;
        }
        if (frameIndex + offset < totalFrames && imagesCacheRef.current[frameIndex + offset]) {
          img = imagesCacheRef.current[frameIndex + offset];
          break;
        }
      }
    }

    if (!img) return;

    const ctx = canvas.getContext('2d');
    const cw = canvas.width;
    const ch = canvas.height;

    const hRatio = cw / img.naturalWidth;
    const vRatio = ch / img.naturalHeight;
    const ratio = Math.max(hRatio, vRatio);

    const shiftX = (cw - img.naturalWidth * ratio) / 2;
    const shiftY = (ch - img.naturalHeight * ratio) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      shiftX,
      shiftY,
      img.naturalWidth * ratio,
      img.naturalHeight * ratio
    );

    lastDrawnIndexRef.current = frameIndex;
  };

  // Resize canvas according to device pixel ratio
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasRef.current.width = window.innerWidth * dpr;
      canvasRef.current.height = window.innerHeight * dpr;
      if (lastDrawnIndexRef.current >= 0) {
        drawFrame(lastDrawnIndexRef.current);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll listener for sticky scrubbing
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!containerRef.current || !ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) {
            ticking = false;
            return;
          }

          const rect = containerRef.current.getBoundingClientRect();
          const totalScrollableDistance = containerRef.current.scrollHeight - window.innerHeight;
          
          if (totalScrollableDistance <= 0) {
            ticking = false;
            return;
          }

          const currentScrolled = -rect.top;
          const rawProgress = currentScrolled / totalScrollableDistance;
          const clampedProgress = Math.max(0, Math.min(1, rawProgress));

          setScrollProgress(clampedProgress);

          const targetFrame = Math.min(
            totalFrames - 1,
            Math.floor(clampedProgress * totalFrames)
          );

          setCurrentFrameIndex(targetFrame);
          drawFrame(targetFrame);

          // Dynamic seasonal theme synchronization
          if (clampedProgress > 0.52 && season !== 'flood') {
            setSeason('flood');
          } else if (clampedProgress <= 0.48 && season !== 'drought') {
            setSeason('drought');
          }

          // Sound milestone triggers
          if (soundEnabled) {
            if (clampedProgress > 0.42 && !audioTriggeredRef.current.rain) {
              playSound('rain');
              audioTriggeredRef.current.rain = true;
            } else if (clampedProgress <= 0.35) {
              audioTriggeredRef.current.rain = false;
            }

            if (clampedProgress > 0.68 && !audioTriggeredRef.current.thunder) {
              playSound('thunder');
              audioTriggeredRef.current.thunder = true;
            } else if (clampedProgress <= 0.60) {
              audioTriggeredRef.current.thunder = false;
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalFrames, season, setSeason, soundEnabled, playSound]);

  // Jump to specific scroll section
  const jumpToStage = (targetRatio) => {
    if (!containerRef.current) return;
    const totalScrollable = containerRef.current.scrollHeight - window.innerHeight;
    const targetY = containerRef.current.offsetTop + totalScrollable * targetRatio;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
    playSound('beep');
  };

  // Determine narrative phase
  const isDroughtPhase = scrollProgress <= 0.38;
  const isMidPhase = scrollProgress > 0.38 && scrollProgress < 0.68;
  const isFloodPhase = scrollProgress >= 0.68;

  const bufferPercentage = Math.round((loadedCount / totalFrames) * 100);

  return (
    <div ref={containerRef} className="relative w-full h-[350vh] bg-[#05070B]">
      {/* Sticky Hero Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden select-none">
        
        {/* Layer 1: Hardware-Accelerated Canvas (z-10) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-10 filter contrast-[1.08] brightness-[0.92]"
        />

        {/* Layer 2: Dynamic Atmospheric Vignette & Blueprint Grid (z-20) */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-700 z-20"
          style={{
            background: isDroughtPhase
              ? 'radial-gradient(ellipse at 50% 30%, rgba(255, 69, 0, 0.24) 0%, rgba(5, 7, 11, 0.5) 75%, rgba(5, 7, 11, 0.92) 100%)'
              : isMidPhase
                ? 'radial-gradient(ellipse at 50% 50%, rgba(99, 102, 241, 0.28) 0%, rgba(15, 23, 42, 0.65) 75%, rgba(5, 7, 11, 0.94) 100%)'
                : 'radial-gradient(ellipse at 50% 70%, rgba(0, 229, 255, 0.25) 0%, rgba(5, 7, 11, 0.55) 75%, rgba(5, 7, 11, 0.95) 100%)'
          }}
        />
        <div className="absolute inset-0 pointer-events-none blueprint-grid z-20 opacity-30"></div>

        {/* Layer 3: Floating Tactical HUD Controls (z-30) - Fixed pt-28 to eliminate Navbar collision */}
        <div className="absolute top-0 left-0 right-0 z-30 pt-28 sm:pt-32 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* Geolocation Tag with Skewed Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-900/90 backdrop-blur-md border-2 border-black text-[11px] font-mono text-slate-300 shadow-[4px_4px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold text-white uppercase">SURVEILLANCE GRID</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300 font-bold">28.6139° N, 77.2090° E</span>
          </div>

          {/* Buffer Indicator & Sound FX Switch */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-900/90 backdrop-blur-md border-2 border-black text-[11px] font-mono text-slate-300 shadow-[4px_4px_0px_#000]">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>SCADA FEED:</span>
              <span className={`font-bold ${bufferPercentage === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {bufferPercentage}% CACHED
              </span>
              <span className="text-slate-500 text-[10px]">
                ({loadedCount}/{totalFrames})
              </span>
            </div>

            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playSound('beep');
              }}
              className={`p-2 rounded-lg border-2 border-black transition-all backdrop-blur-md shadow-[4px_4px_0px_#000] ${
                soundEnabled 
                  ? 'bg-cyan-400 text-black font-bold' 
                  : 'bg-obsidian-900/90 text-slate-400 hover:text-white'
              }`}
              title={soundEnabled ? "Mute Atmospheric Soundscape" : "Enable Atmospheric Soundscape"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Layer 3: Narrative Stage Overlays (z-30) - Scaled with safe bottom padding (pb-28) */}
        <div className="absolute inset-0 z-30 flex flex-col justify-center pt-28 pb-28 px-4 sm:px-10 lg:px-16 max-w-7xl mx-auto pointer-events-none">
          
          {/* STAGE 1: DROUGHT / TANKER SCENE */}
          <AnimatePresence>
            {isDroughtPhase && (
              <motion.div
                key="stage-drought"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl pointer-events-auto"
              >
                <div className="mb-3">
                  <BrutalBadge variant="solar" icon={Flame}>
                    PHASE 01 // CRITICAL THERMAL RADIANCE
                  </BrutalBadge>
                </div>

                {/* Scaled Comic Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tighter text-white uppercase leading-[0.98] drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)] mb-3">
                  DRY LANDS. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-amber-300">
                    NO WATER.
                  </span> <br />
                  RUNNING DRY.
                </h1>

                <p className="text-xs sm:text-sm text-slate-200 font-sans max-w-lg mb-5 bg-black/75 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] leading-relaxed">
                  Asphalt radiance crosses <strong className="text-orange-400 font-mono">49°C</strong>. Informal settlements queue for hours as the deep aquifer plunges beyond 40m, requiring over 400 municipal tankers to maintain survival rations.
                </p>

                {/* Tactical Telemetry Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl">
                  <div className="bg-obsidian-900/95 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">GROUNDWATER DEPLETION</span>
                    <span className="text-lg sm:text-xl font-black text-orange-400">-2.4m</span>
                    <span className="text-[10px] text-slate-500 block">Annual Drop</span>
                  </div>

                  <div className="bg-obsidian-900/95 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">SURFACE RADIANCE</span>
                    <span className="text-lg sm:text-xl font-black text-red-400">48.7°C</span>
                    <span className="text-[10px] text-slate-500 block">Thermal Asphalt</span>
                  </div>

                  <div className="bg-obsidian-900/95 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">EMERGENCY TANKERS</span>
                    <span className="text-lg sm:text-xl font-black text-amber-300">418 FLEET</span>
                    <span className="text-[10px] text-emerald-400 block font-bold">Active Dispatch</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 2: INVERSION / CLOUDBURST STORM */}
          <AnimatePresence>
            {isMidPhase && (
              <motion.div
                key="stage-mid"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl pointer-events-auto"
              >
                <div className="mb-3">
                  <BrutalBadge variant="warning" icon={Zap}>
                    PHASE 02 // METEOROLOGICAL INVERSION DETECTED
                  </BrutalBadge>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tighter text-white uppercase leading-[0.98] drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)] mb-3">
                  100MM/HR CLOUDBURST. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
                    RUNOFF PARALYSIS.
                  </span> <br />
                  DRAINS CHOKED.
                </h1>

                <p className="text-xs sm:text-sm text-slate-200 font-sans max-w-lg mb-5 bg-black/75 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] leading-relaxed">
                  The sky fractures. Tropical monsoon cells dump flash rain across concrete catchments. Delhi's 57km Najafgarh trunk and urban culverts reverse flow, turning thoroughfares into swift rapids.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl">
                  <div className="bg-obsidian-900/95 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">PRECIPITATION RATE</span>
                    <span className="text-lg sm:text-xl font-black text-cyan-300">94.2 mm/h</span>
                    <span className="text-[10px] text-purple-400 block">Flash Downpour</span>
                  </div>

                  <div className="bg-obsidian-900/95 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">NAJAFGARH SILT LOAD</span>
                    <span className="text-lg sm:text-xl font-black text-amber-400">78%</span>
                    <span className="text-[10px] text-red-400 block font-bold">Severe Occlusion</span>
                  </div>

                  <div className="bg-obsidian-900/95 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">PUMP CAPACITY</span>
                    <span className="text-lg sm:text-xl font-black text-red-400">OVERWHELMED</span>
                    <span className="text-[10px] text-slate-400 block">Reverse Sump</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* STAGE 3: WATERLOGGING / DELUGE SCENE */}
          <AnimatePresence>
            {isFloodPhase && (
              <motion.div
                key="stage-flood"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="max-w-3xl pointer-events-auto"
              >
                <div className="mb-3">
                  <BrutalBadge variant="hydro" icon={Droplets}>
                    PHASE 03 // CATASTROPHIC INUNDATION GRID
                  </BrutalBadge>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tighter text-white uppercase leading-[0.98] drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)] mb-3">
                  CITIES SUBMERGED. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-teal-200">
                    CHOKED DRAINS.
                  </span> <br />
                  LIFE ON HALT.
                </h1>

                <p className="text-xs sm:text-sm text-slate-200 font-sans max-w-lg mb-5 bg-black/75 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] leading-relaxed">
                  Vehicles sink beneath Minto Bridge and Zakhira underpasses. Yamuna floodplains breach the 205.33m Danger Mark, cutting off vital arterial grids and inundating residential colonies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl">
                  <div className="bg-obsidian-900/95 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">WATERLOGGING DEPTH</span>
                    <span className="text-lg sm:text-xl font-black text-cyan-300">2.8m</span>
                    <span className="text-[10px] text-red-400 block font-bold">Minto Bridge Sump</span>
                  </div>

                  <div className="bg-obsidian-900/95 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">YAMUNA GAUGE</span>
                    <span className="text-lg sm:text-xl font-black text-blue-400">205.85m</span>
                    <span className="text-[10px] text-red-400 block font-bold">+0.52m Breach</span>
                  </div>

                  <div className="bg-obsidian-900/95 backdrop-blur-md p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_#000] font-mono">
                    <span className="text-[10px] text-slate-400 block font-bold">PUMPING FLEET</span>
                    <span className="text-lg sm:text-xl font-black text-emerald-400">89 UNITS</span>
                    <span className="text-[10px] text-slate-400 block">MCD Rapid Response</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Layer 4: Bottom Neo-Brutalist Scrub Timeline Bar (z-30) */}
        <div className="absolute bottom-6 left-0 right-0 z-30 px-4 sm:px-8 max-w-7xl mx-auto pointer-events-auto">
          <div className="bg-obsidian-900/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-2.5">
            
            {/* Stage Selector Buttons & Frame Counter */}
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => jumpToStage(0.1)}
                  className={`brutal-btn px-2.5 py-1 rounded text-[11px] font-black uppercase transition-all ${
                    isDroughtPhase 
                      ? 'bg-orange-500 text-black border-2 border-black shadow-[3px_3px_0px_#000]' 
                      : 'bg-black/60 text-slate-400 border-2 border-slate-800 hover:text-white'
                  }`}
                >
                  01 // DROUGHT
                </button>

                <button
                  onClick={() => jumpToStage(0.5)}
                  className={`brutal-btn px-2.5 py-1 rounded text-[11px] font-black uppercase transition-all ${
                    isMidPhase 
                      ? 'bg-purple-500 text-white border-2 border-black shadow-[3px_3px_0px_#000]' 
                      : 'bg-black/60 text-slate-400 border-2 border-slate-800 hover:text-white'
                  }`}
                >
                  02 // CLOUDBURST
                </button>

                <button
                  onClick={() => jumpToStage(0.9)}
                  className={`brutal-btn px-2.5 py-1 rounded text-[11px] font-black uppercase transition-all ${
                    isFloodPhase 
                      ? 'bg-cyan-400 text-black border-2 border-black shadow-[3px_3px_0px_#000]' 
                      : 'bg-black/60 text-slate-400 border-2 border-slate-800 hover:text-white'
                  }`}
                >
                  03 // DELUGE
                </button>
              </div>

              {/* Real-time Frame Index readout */}
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-400 hidden sm:inline font-bold">SCRUB:</span>
                <span className="font-black text-white bg-black/80 px-2 py-0.5 rounded border border-white/10">
                  {Math.round(scrollProgress * 100)}%
                </span>
                <span className="text-cyan-300 font-black bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  FRAME {String(currentFrameIndex + 1).padStart(3, '0')} / {totalFrames}
                </span>
              </div>
            </div>

            {/* Continuous Scrub Progress Bar */}
            <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-black shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  isDroughtPhase
                    ? 'bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_10px_#ff4500]'
                    : isMidPhase
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-400 shadow-[0_0_10px_#a855f7]'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_#00e5ff]'
                }`}
                style={{ width: `${Math.max(2, scrollProgress * 100)}%` }}
              />
            </div>

            {/* Bottom Status bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
              <span className="flex items-center gap-1 font-bold text-slate-300">
                <ArrowDown className="w-3 h-3 text-cyan-400 animate-bounce" />
                SCROLL DOWN TO DIVE INTO CITY TELEMETRY & REPORTING
              </span>
              <span className="text-slate-500 hidden sm:inline">
                CANVAS ACCELERATED // 60 FPS
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
