import React from 'react';
import { useSeason } from '../../context/SeasonContext';

export default function BrutalButton({ 
  children, 
  variant = 'solar', 
  size = 'md',
  onClick, 
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
  title
}) {
  const { playSound } = useSeason();

  const handleClick = (e) => {
    if (disabled) return;
    playSound?.('beep');
    if (onClick) onClick(e);
  };

  const variantStyles = {
    solar: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black border-2 border-black',
    hydro: 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black border-2 border-black',
    dark: 'bg-obsidian-800 hover:bg-obsidian-700 text-white font-bold border-2 border-slate-700 hover:border-slate-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white font-black border-2 border-black',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border-2 border-transparent hover:border-slate-700 shadow-none'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-4 py-2 text-xs sm:text-sm',
    lg: 'px-6 py-3 text-sm sm:text-base'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      title={title}
      className={`brutal-btn font-mono uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 ${variantStyles[variant] || variantStyles.solar} ${sizeStyles[size]} ${disabled ? 'opacity-50 cursor-not-allowed transform-none shadow-none' : ''} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
    </button>
  );
}
