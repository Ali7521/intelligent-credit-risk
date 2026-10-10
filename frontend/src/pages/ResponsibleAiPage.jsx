import React from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Eye,
  Lock,
  Users,
  FileCheck2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function ResponsibleAiPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-2">
          <HeartHandshake className="w-3.5 h-3.5" />
          Ethical AI & Compliance Framework
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Responsible AI, Fairness & Governance</h1>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
          How AI CreditGuard enforces algorithmic transparency, excludes protected demographic characteristics, safeguards data privacy, and preserves human oversight in credit risk evaluation.
        </p>
      </div>

      {/* MANDATORY EDUCATIONAL PROTOTYPE DISCLAIMER */}
      <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 flex items-start gap-4">
        <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h2 className="text-base font-bold text-amber-300 uppercase tracking-wider">
            Mandatory Institutional Notice
          </h2>
          <blockquote className="text-base sm:text-lg font-bold text-white italic leading-relaxed border-l-2 border-amber-400 pl-4 py-1">
            "This application is an educational AI prototype. Its predictions should not be used as the sole basis for real-world lending or financial decisions."
          </blockquote>
          <p className="text-xs text-amber-200/80 leading-relaxed pt-1">
            Real-world lending requires compliance with consumer credit regulations such as the Equal Credit Opportunity Act (ECOA), the Fair Credit Reporting Act (FCRA), and the General Data Protection Regulation (GDPR). This platform is designed for research, portfolio demonstration, and academic benchmarking.
          </p>
        </div>
      </div>

      {/* CORE ETHICAL PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Exclusion of Protected Characteristics */}
        <div id="fairness" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">1. Strict Exclusion of Protected Characteristics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The dataset and feature engineering pipeline strictly exclude protected demographic attributes, including:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">Race & Ethnicity</span>
            <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">Religion</span>
            <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">Caste & Tribe</span>
            <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">Gender & Sex</span>
            <span className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">Marital Status</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pt-2">
            Predictions rely solely on verifiable financial metrics: debt-to-income, credit score, historical delinquency, savings cushion, and verified cash flows.
          </p>
        </div>

        {/* Pillar 2: Explainability with SHAP */}
        <div id="explainability" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">2. Transparent Explainability with SHAP</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Black-box credit scoring creates distrust and regulatory violations. We leverage <strong>Shapley Additive Explanations (SHAP)</strong> to compute mathematically sound, game-theoretic local attribution for every prediction.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Highlights top risk-increasing factors (positive SHAP).
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Highlights top protective mitigating factors (negative SHAP).
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              Includes visual horizontal impact charts for adverse action transparency.
            </li>
          </ul>
        </div>

        {/* Pillar 3: Human-in-the-Loop Governance */}
        <div id="human" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">3. Human-in-the-Loop Underwriting</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The system prohibits fully automated final decisions ("Loan Approved" or "Loan Rejected").
          </p>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <strong>Institutional Protocol:</strong> Predictions generate risk classification tiers and underwriting review actions ("High predicted default risk — requires further human/institutional review"). A qualified loan officer or credit committee retains ultimate decision-making authority.
          </p>
        </div>

        {/* Pillar 4: Model Limitations & Data Drift */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">4. Model Limitations & Bias Awareness</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Machine learning models reflect the statistical patterns present in their training data. We acknowledge key boundaries:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
              <span><strong>Macroeconomic Shift:</strong> Sudden recessions or inflation surges alter real-world default rates beyond historical training sets.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
              <span><strong>Proxy Bias:</strong> Financial features like postal code or historical credit age may inadvertently correlate with systemic socio-economic disparities.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
              <span><strong>Regular Audits:</strong> Models should undergo continuous statistical monitoring (PSI, CSI, KS tests) to detect concept drift.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* DATA PRIVACY & SECURITY MEASURES */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Data Privacy & Security Protocols</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          AI CreditGuard implements security best practices to protect sensitive financial records:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-white block">No PII Logging</strong>
            <p className="text-slate-400">
              Application server logs sanitize applicant names, addresses, and account numbers to prevent accidental log leakage.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-white block">Strict Input Boundaries</strong>
            <p className="text-slate-400">
              Pydantic strictly enforces typing, boundary ranges (e.g. credit score 300-850), and eliminates malicious injection payloads.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-white block">Auditable Traceability</strong>
            <p className="text-slate-400">
              Every inference outputs an immutable snapshot of feature values and SHAP coefficients for regulatory auditing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
