import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import { Info, HelpCircle } from 'lucide-react';

export default function ShapFeatureImpactChart({ impacts = [] }) {
  // Sort by impact ascending or descending for clean horizontal representation
  const sortedData = [...impacts]
    .slice(0, 10)
    .sort((a, b) => b.impact - a.impact)
    .map(item => ({
      name: item.feature_name.length > 28 ? item.feature_name.substring(0, 26) + '...' : item.feature_name,
      fullName: item.feature_name,
      impact: item.impact,
      isRiskIncreasing: item.impact > 0,
      rawValue: item.raw_value
    }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isRisk = data.impact > 0;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs max-w-xs">
          <p className="font-semibold text-white mb-1">{data.fullName}</p>
          <div className="flex items-center justify-between gap-4 text-slate-300">
            <span>Model Impact (SHAP):</span>
            <span className={`font-mono font-bold ${isRisk ? 'text-red-400' : 'text-emerald-400'}`}>
              {isRisk ? `+${data.impact.toFixed(3)}` : data.impact.toFixed(3)}
            </span>
          </div>
          {data.rawValue !== null && data.rawValue !== undefined && (
            <div className="flex items-center justify-between gap-4 text-slate-400 mt-1">
              <span>Applicant Value:</span>
              <span className="font-mono text-slate-200">{String(data.rawValue)}</span>
            </div>
          )}
          <p className="mt-2 text-[10px] text-slate-400 border-t border-slate-800 pt-1">
            {isRisk
              ? 'Escalates predicted default risk relative to population baseline.'
              : 'Reduces predicted default risk and buffers creditworthiness.'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Explainable AI: SHAP Feature Attribution
            <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Local Attribution
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            How each applicant metric influenced the ML model's default risk prediction
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500 inline-block"></span>
            <span className="text-slate-300">Increases Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
            <span className="text-slate-300">Reduces Risk</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        {sortedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sortedData}
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <XAxis
                type="number"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
                tickFormatter={(val) => val.toFixed(2)}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
              <Bar dataKey="impact" radius={[4, 4, 4, 4]}>
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.impact > 0 ? '#ef4444' : '#10b981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No SHAP attribution data available for this profile.
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Interpretability Notice:</strong> Feature impact values represent statistical feature attribution calculated via Shapley Additive Explanations (SHAP). These factors reflect <span className="text-slate-200 underline decoration-slate-600">model-influencing factors</span> relative to empirical training distributions, not guaranteed causal explanations.
        </p>
      </div>
    </div>
  );
}
