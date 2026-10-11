import React from 'react';

export default function BrutalBadge({
  children,
  variant = 'solar',
  icon: Icon,
  className = ''
}) {
  const variantStyles = {
    solar: 'bg-orange-500 text-black border-black',
    hydro: 'bg-cyan-400 text-black border-black',
    danger: 'bg-red-500 text-white border-black',
    warning: 'bg-amber-400 text-black border-black',
    success: 'bg-emerald-400 text-black border-black',
    dark: 'bg-obsidian-900 text-slate-300 border-slate-700'
  };

  return (
    <span className={`brutal-badge inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-black uppercase tracking-wider -rotate-1 ${variantStyles[variant] || variantStyles.solar} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
