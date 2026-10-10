import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ConfusionMatrixCard({ matrix, modelName, totalSamples }) {
  if (!matrix) return null;

  const { true_negatives: tn, false_positives: fp, false_negatives: fn, true_positives: tp } = matrix;
  const total = tn + fp + fn + tp || totalSamples || 1;

  const tnPct = ((tn / total) * 100).toFixed(1);
  const fpPct = ((fp / total) * 100).toFixed(1);
  const fnPct = ((fn / total) * 100).toFixed(1);
  const tpPct = ((tp / total) * 100).toFixed(1);

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white">{modelName}</h4>
          <span className="text-xs text-slate-400">Confusion Matrix (N = {total.toLocaleString()})</span>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          FN = {fn} Defaults Missed
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        {/* True Negatives */}
        <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">True Negative</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{tn}</div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">{tnPct}% of test set</div>
          <p className="text-[10px] text-slate-400 mt-1">Correctly identified Non-Default</p>
        </div>

        {/* False Positives */}
        <div className="p-3.5 bg-amber-950/20 border border-amber-500/20 rounded-xl">
          <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">False Positive</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{fp}</div>
          <div className="text-[11px] text-amber-400/80 mt-0.5">{fpPct}% of test set</div>
          <p className="text-[10px] text-slate-400 mt-1">Non-defaulter flagged as risky (Friction)</p>
        </div>

        {/* False Negatives (Critical default loss) */}
        <div className="p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl ring-1 ring-red-500/30">
          <div className="flex items-center justify-center gap-1.5 text-red-400 mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-300">False Negative (Risk)</span>
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">{fn}</div>
          <div className="text-[11px] text-red-400/80 mt-0.5">{fnPct}% of test set</div>
          <p className="text-[10px] text-red-300/80 mt-1">Actual default missed (Credit Loss)</p>
        </div>

        {/* True Positives */}
        <div className="p-3.5 bg-blue-950/30 border border-blue-500/20 rounded-xl">
          <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">True Positive</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{tp}</div>
          <div className="text-[11px] text-blue-400/80 mt-0.5">{tpPct}% of test set</div>
          <p className="text-[10px] text-slate-400 mt-1">Defaulter caught successfully</p>
        </div>
      </div>
    </div>
  );
}
