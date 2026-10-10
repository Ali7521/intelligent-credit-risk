import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function RiskBadge({ category, size = 'md' }) {
  const norm = (category || '').toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3.5 py-1 gap-1.5 font-semibold',
    lg: 'text-base px-4 py-1.5 gap-2 font-bold tracking-wide',
  };

  if (norm.includes('LOW')) {
    return (
      <span className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]}`}>
        <ShieldCheck className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        LOW RISK
      </span>
    );
  }

  if (norm.includes('MEDIUM') || norm.includes('MODERATE')) {
    return (
      <span className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses[size]}`}>
        <AlertTriangle className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        MEDIUM RISK
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-red-500/10 text-red-400 border border-red-500/30 ${sizeClasses[size]}`}>
      <AlertOctagon className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      HIGH RISK
    </span>
  );
}
