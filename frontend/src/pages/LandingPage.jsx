import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Cpu,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Sparkles,
  Lock,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  Scale
} from 'lucide-react';

export default function LandingPage() {
  const steps = [
    {
      num: '01',
      title: 'Applicant Intake',
      desc: 'Applicant inputs financial credentials across 5 curated stages, covering income, existing debt, credit history, and loan terms.',
      icon: SlidersHorizontal
    },
    {
      num: '02',
      title: 'Schema Validation',
      desc: 'Pydantic strict schema verification validates domain boundaries and computes derived financial ratios like DTI, LTI, and savings cushion.',
      icon: FileCheck2
    },
    {
      num: '03',
      title: 'Imbalance-Aware ML',
      desc: 'Ensemble pipeline (Logistic Regression, Random Forest, XGBoost) trained with SMOTE resampling prioritizes default recall to minimize credit losses.',
      icon: Cpu
    },
    {
      num: '04',
      title: 'SHAP Explainability',
      desc: 'Computes local Shapley additive explanations for every prediction, pinpointing the top risk-increasing and protective factors.',
      icon: Sparkles
    },
    {
      num: '05',
      title: 'Institutional Dashboard',
      desc: 'Underwriters receive calibrated risk scores, probability of default, auditable SHAP waterfall charts, and review recommendations.',
      icon: BarChart3
    }
  ];

  const highlights = [
    { title: 'Explainable AI by Default', desc: 'Every credit risk prediction is backed by SHAP feature attribution with horizontal impact visualization.' },
    { title: 'Cost-Sensitive Model Selection', desc: 'Optimized to minimize costly False Negatives (defaulting borrowers missed), not just naive raw accuracy.' },
    { title: 'Fair Lending Architecture', desc: 'Strictly excludes protected characteristics (race, religion, caste, gender) to prevent discriminatory bias.' },
    { title: 'Institutional Decision Support', desc: 'Transparent human-in-the-loop recommendations designed for modern fintech underwriting teams.' }
  ];

  return (
    <div className="space-y-24 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-cyan-400/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Credit Underwriting & Explainable ML
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Intelligent Credit Risk Assessment with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">Explainable AI</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            AI CreditGuard bridges the gap between high-precision machine learning and institutional accountability. Predict loan default risk with calibrated probabilities and transparent SHAP explanations.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/assess"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center justify-center gap-2 group transition-all transform hover:-translate-y-0.5"
            >
              Assess Loan Applicant
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/models"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Cpu className="w-4 h-4 text-blue-400" />
              Explore Model Benchmarks
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-sm">
            <div className="p-3 text-center border-r border-slate-800/80 last:border-none">
              <div className="text-2xl font-extrabold text-white font-mono">0.864</div>
              <div className="text-xs text-slate-400 mt-0.5">ROC-AUC Score</div>
            </div>
            <div className="p-3 text-center border-r border-slate-800/80 last:border-none">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">77.4%</div>
              <div className="text-xs text-slate-400 mt-0.5">Default Recall (FN Minimized)</div>
            </div>
            <div className="p-3 text-center border-r border-slate-800/80 last:border-none">
              <div className="text-2xl font-extrabold text-blue-400 font-mono">34+</div>
              <div className="text-xs text-slate-400 mt-0.5">Engineered Indicators</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-2xl font-extrabold text-indigo-400 font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">SHAP Interpretable</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">Architectural Workflow</h2>
          <h3 className="text-3xl font-extrabold text-white">End-to-End Underwriting Lifecycle</h3>
          <p className="mt-3 text-sm text-slate-400">
            A seamless transition from user inputs to machine learning inference and institutional underwriting decisioning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative hover:border-blue-500/50 transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                    {st.num}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-base font-bold text-white mb-2">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">{h.title}</h4>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Model Benchmark Teaser Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Model Verification</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Trained and Benchmarked Across 3 Competitive Algorithms
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We trained <strong>Logistic Regression</strong>, <strong>Random Forest</strong>, and <strong>XGBoost</strong> with SMOTE imbalance compensation. Check out side-by-side ROC curves, PR curves, and confusion matrices.
            </p>
          </div>
          <Link
            to="/models"
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 shrink-0 shadow-lg shadow-blue-600/25 transition-all"
          >
            View Benchmark Comparisons
          </Link>
        </div>
      </section>
    </div>
  );
}
