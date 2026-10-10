import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Cpu,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Activity,
  Layers,
  Info
} from 'lucide-react';
import { getModelMetrics } from '../services/api';
import ConfusionMatrixCard from '../charts/ConfusionMatrixCard';

export default function ModelPerformancePage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getModelMetrics()
      .then((res) => setMetrics(res))
      .catch((err) => console.error('Error fetching model metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading model benchmark evaluation data...</p>
      </div>
    );
  }

  const {
    best_model_name,
    selection_metric,
    dataset_summary = {},
    all_models_evaluations = {}
  } = metrics;

  const modelList = Object.keys(all_models_evaluations).map((name) => all_models_evaluations[name]);

  // Combine ROC curves for multi-line comparison chart
  // Model evaluations contain 25 sample points
  const rocPoints = [];
  const logRegRoc = all_models_evaluations['Logistic Regression']?.roc_curve || [];
  const rfRoc = all_models_evaluations['Random Forest']?.roc_curve || [];
  const xgbRoc = all_models_evaluations['XGBoost']?.roc_curve || [];

  for (let i = 0; i < logRegRoc.length; i++) {
    rocPoints.push({
      fpr: logRegRoc[i]?.fpr ?? (i / (logRegRoc.length - 1)),
      'Logistic Regression': logRegRoc[i]?.tpr,
      'Random Forest': rfRoc[i]?.tpr,
      'XGBoost': xgbRoc[i]?.tpr,
    });
  }

  // Combine PR curves
  const prPoints = [];
  const logRegPr = all_models_evaluations['Logistic Regression']?.pr_curve || [];
  const rfPr = all_models_evaluations['Random Forest']?.pr_curve || [];
  const xgbPr = all_models_evaluations['XGBoost']?.pr_curve || [];

  for (let i = 0; i < logRegPr.length; i++) {
    prPoints.push({
      recall: logRegPr[i]?.recall ?? (i / (logRegPr.length - 1)),
      'Logistic Regression': logRegPr[i]?.precision,
      'Random Forest': rfPr[i]?.precision,
      'XGBoost': xgbPr[i]?.precision,
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-2">
          <Cpu className="w-3.5 h-3.5" />
          Rigorous ML Benchmark Suite
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Machine Learning Model Performance</h1>
        <p className="text-xs text-slate-400 mt-1">
          Empirical comparison between Logistic Regression, Random Forest, and XGBoost under class imbalance (SMOTE).
        </p>
      </div>

      {/* CHAMPION MODEL BANNER */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/40 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Champion Model Selected:
              </span>
            </div>
            <h2 className="text-3xl font-black text-white">{best_model_name}</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Selected via <strong>Cost-Sensitive Composite Metric</strong> prioritizing Default Recall ({all_models_evaluations[best_model_name]?.recall * 100}%) and PR-AUC ({all_models_evaluations[best_model_name]?.pr_auc}). In credit risk, capturing defaulting borrowers is orders of magnitude more critical than raw accuracy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase">ROC-AUC</span>
              <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
                {all_models_evaluations[best_model_name]?.roc_auc}
              </div>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase">Default Recall</span>
              <div className="text-xl font-extrabold text-blue-400 font-mono mt-0.5">
                {(all_models_evaluations[best_model_name]?.recall * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase">PR-AUC</span>
              <div className="text-xl font-extrabold text-indigo-400 font-mono mt-0.5">
                {all_models_evaluations[best_model_name]?.pr_auc}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODEL COMPARISON BENCHMARK TABLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Full Benchmark Evaluation Matrix</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluated on held-out test split (20% stratified) with empirical metrics (Do not rely on accuracy alone).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Algorithm</th>
                <th className="px-4 py-4">Accuracy</th>
                <th className="px-4 py-4">Precision (Class 1)</th>
                <th className="px-4 py-4 text-blue-400 font-bold">Recall (Defaults) *</th>
                <th className="px-4 py-4">F1-Score</th>
                <th className="px-4 py-4">ROC-AUC</th>
                <th className="px-4 py-4 text-emerald-400 font-bold">PR-AUC *</th>
                <th className="px-4 py-4">False Negatives (Misses)</th>
                <th className="px-4 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {modelList.map((m) => {
                const isChampion = m.model_name === best_model_name;
                const fn = m.confusion_matrix?.false_negatives;

                return (
                  <tr key={m.model_name} className={`hover:bg-slate-800/40 ${isChampion ? 'bg-blue-950/20' : ''}`}>
                    <td className="px-6 py-4 font-sans font-bold text-white flex items-center gap-2">
                      {isChampion && <Trophy className="w-4 h-4 text-amber-400 shrink-0" />}
                      <span>{m.model_name}</span>
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {(m.accuracy * 100).toFixed(2)}%
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {(m.precision * 100).toFixed(2)}%
                    </td>

                    <td className="px-4 py-4 font-bold text-blue-400">
                      {(m.recall * 100).toFixed(2)}%
                    </td>

                    <td className="px-4 py-4 text-slate-300">
                      {(m.f1_score * 100).toFixed(2)}%
                    </td>

                    <td className="px-4 py-4 text-emerald-400 font-semibold">
                      {m.roc_auc.toFixed(4)}
                    </td>

                    <td className="px-4 py-4 text-indigo-400 font-semibold">
                      {m.pr_auc.toFixed(4)}
                    </td>

                    <td className="px-4 py-4 text-red-400 font-bold">
                      {fn} missed
                    </td>

                    <td className="px-4 py-4 text-right font-sans">
                      {isChampion ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Champion
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                          Candidate
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFUSION MATRICES SIDE BY SIDE */}
      <div>
        <h3 className="text-lg font-bold text-white mb-2">Confusion Matrix Analysis</h3>
        <p className="text-xs text-slate-400 mb-6">
          Comparing True Negatives, False Positives, False Negatives, and True Positives across all 3 models.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modelList.map((m) => (
            <ConfusionMatrixCard
              key={m.model_name}
              matrix={m.confusion_matrix}
              modelName={m.model_name}
              totalSamples={1000}
            />
          ))}
        </div>
      </div>

      {/* ROC CURVES & PR CURVES CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curves */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-1">ROC Curves Comparison</h3>
          <p className="text-xs text-slate-400 mb-4">True Positive Rate vs False Positive Rate across decision thresholds</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="fpr" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 1]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Logistic Regression" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Random Forest" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="XGBoost" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PR Curves */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-1">Precision-Recall Curves (Imbalanced Domain)</h3>
          <p className="text-xs text-slate-400 mb-4">Precision vs Recall in minority default detection</p>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="recall" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} label={{ value: 'Recall', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} domain={[0, 1]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Logistic Regression" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Random Forest" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="XGBoost" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* EDUCATIONAL / INDUSTRY RATIONALE CARD */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-400" />
          Fintech Underwriting Rationale: Why Accuracy Alone Fails in Credit Modeling
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-white block mb-1">1. Class Imbalance Trap</strong>
            In credit portfolios where defaults represent 10-15% of records, a naive model that predicts "Nobody Defaults" achieves 85-90% accuracy while failing 100% of lending risk objectives.
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-white block mb-1">2. Asymmetric Loss Economics</strong>
            A False Positive (declining a prime applicant) loses small interest margin. A False Negative (approving an applicant who defaults) loses the entire unpaid principal balance ($20k - $100k+).
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <strong className="text-white block mb-1">3. SMOTE & Composite Scoring</strong>
            We employ Synthetic Minority Over-sampling Technique (SMOTE) to rebalance training gradients and optimize the model on default recall and PR-AUC.
          </div>
        </div>
      </div>
    </div>
  );
}
