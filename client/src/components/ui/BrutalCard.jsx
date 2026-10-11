import React from 'react';

export default function BrutalCard({
  children,
  title,
  tag,
  tagVariant = 'default',
  className = '',
  action,
  glow = false
}) {
  const tagStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    solar: 'bg-orange-500 text-black border-black font-black',
    hydro: 'bg-cyan-400 text-black border-black font-black',
    danger: 'bg-red-500 text-white border-black font-black',
    success: 'bg-emerald-500 text-black border-black font-black'
  };

  return (
    <div className={`brutal-card bg-obsidian-850/95 backdrop-blur-md rounded-xl p-5 border-2 border-black/80 relative overflow-hidden ${glow ? 'shadow-[0_0_30px_rgba(0,229,255,0.15)]' : ''} ${className}`}>
      {/* Header if title or tag exists */}
      {(title || tag || action) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2.5">
            {tag && (
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border shadow-[2px_2px_0px_#000] -rotate-1 ${tagStyles[tagVariant] || tagStyles.default}`}>
                {tag}
              </span>
            )}
            {title && (
              <h4 className="font-mono font-bold text-sm text-white tracking-wide uppercase">
                {title}
              </h4>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
