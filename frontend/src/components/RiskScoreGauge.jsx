import React from 'react';

export default function RiskScoreGauge({ score = 50, defaultProb = 0.5, category = 'MEDIUM RISK' }) {
  // Score is 0 - 100
  const normalizedScore = Math.min(100, Math.max(0, score));
  const defaultPercentage = Math.round(defaultProb * 100);

  // Determine accent color
  let colorClass = '#f59e0b'; // amber
  let glowColor = 'rgba(245, 158, 11, 0.3)';
  if (category === 'LOW RISK') {
    colorClass = '#10b981'; // emerald
    glowColor = 'rgba(16, 185, 129, 0.3)';
  } else if (category === 'HIGH RISK') {
    colorClass = '#ef4444'; // red
    glowColor = 'rgba(239, 68, 68, 0.3)';
  }

  // SVG Gauge Calculations
  const radius = 70;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  // We use 270 degree arc for gauge
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (normalizedScore / 100) * arcLength;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg
          height={radius * 2 + 10}
          width={radius * 2 + 10}
          className="transform -rotate-135"
        >
          {/* Background Track */}
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            r={normalizedRadius}
            cx={radius + 5}
            cy={radius + 5}
            strokeLinecap="round"
          />
          {/* Active Value Bar */}
          <circle
            stroke={colorClass}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 8px ${glowColor})`
            }}
            r={normalizedRadius}
            cx={radius + 5}
            cy={radius + 5}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Risk Score
          </span>
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {normalizedScore}
            </span>
            <span className="text-sm font-medium text-slate-400 ml-1">/ 100</span>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-300">Default Prob:</span>
            <span className="text-xs font-bold" style={{ color: colorClass }}>
              {defaultPercentage}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-xs text-slate-400 max-w-[200px]">
          {category === 'LOW RISK'
            ? 'Strong creditworthiness profile with minimal risk indicators'
            : category === 'MEDIUM RISK'
            ? 'Balanced profile with moderate risk exposure'
            : 'Subprime profile with elevated probability of default'}
        </p>
      </div>
    </div>
  );
}
