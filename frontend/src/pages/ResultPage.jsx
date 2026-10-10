import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Printer,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Share2,
  Clock,
  Layers,
  HelpCircle,
  Building2,
  UserCheck
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import RiskScoreGauge from '../components/RiskScoreGauge';
import ShapFeatureImpactChart from '../charts/ShapFeatureImpactChart';
import { getApplications } from '../services/api';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [application, setApplication] = useState(location.state?.application || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If navigated directly without state, load the most recent application from backend
    if (!application) {
      setLoading(true);
      getApplications({ limit: 1 })
        .then((apps) => {
          if (apps && apps.length > 0) {
            setApplication(apps[0]);
          }
        })
        .catch((err) => console.error('Failed to load application:', err))
        .finally(() => setLoading(false));
    }
  }, [application]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Loading assessment dossier...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Active Assessment Found</h2>
        <p className="text-sm text-slate-400 mb-6">
          Submit an applicant profile through the credit assessment engine to generate real-time ML risk predictions and SHAP explainability.
        </p>
        <Link
          to="/assess"
          className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors inline-block"
        >
          Launch New Assessment
        </Link>
      </div>
    );
  }

  const {
    applicant_id,
    risk_score,
    default_probability,
    risk_category,
    review_recommendation,
    review_action,
    risk_factors = [],
    positive_factors = [],
    feature_impacts = [],
    financial_ratios = {},
    monthly_income,
    requested_loan_amount,
    loan_tenure,
    credit_score,
    loan_purpose,
    employment_type,
    existing_debt
  } = application;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header & Breadcrumb Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/assess')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Assessment Form
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Underwriting Risk Dossier</h1>
            <RiskBadge category={risk_category} size="md" />
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Applicant ID: <span className="text-blue-400 font-semibold">{applicant_id || 'CG-NEW-ASSESSMENT'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Print Dossier
          </button>
          <Link
            to="/assess"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            New Assessment
          </Link>
        </div>
      </div>

      {/* LARGE CREDIT RISK CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        {/* Glow indicator based on category */}
        <div
          className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[100px] pointer-events-none opacity-20 ${
            risk_category === 'LOW RISK'
              ? 'bg-emerald-500'
              : risk_category === 'MEDIUM RISK'
              ? 'bg-amber-500'
              : 'bg-red-500'
          }`}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Column 1: Header and Risk Title */}
          <div className="space-y-4">
            <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">
              CREDIT RISK ASSESSMENT
            </span>

            <div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
                <span
                  className={
                    risk_category === 'LOW RISK'
                      ? 'text-emerald-400'
                      : risk_category === 'MEDIUM RISK'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }
                >
                  {risk_category}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Machine learning underwriting tier calibrated on historical credit repayment data.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-1">
              <span className="text-xs text-slate-400">Recommended Review Protocol:</span>
              <span className="text-sm font-semibold text-white px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 inline-block">
                {review_action || 'Manual Underwriting Audit'}
              </span>
            </div>
          </div>

          {/* Column 2: Circular Animated Gauge */}
          <div className="flex justify-center">
            <RiskScoreGauge
              score={risk_score}
              defaultProb={default_probability}
              category={risk_category}
            />
          </div>

          {/* Column 3: Institutional Review Warning / Guidance */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-blue-400" />
              Underwriting Committee Guidance
            </div>

            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed font-medium ${
                risk_category === 'HIGH RISK'
                  ? 'bg-red-950/30 border-red-500/30 text-red-200'
                  : risk_category === 'MEDIUM RISK'
                  ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                  : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              }`}
            >
              {review_recommendation}
            </div>

            <p className="text-[11px] text-slate-400">
              <strong>Human-in-the-Loop Principle:</strong> Automated algorithms assist rather than dictate credit approvals. Final commitment requires formal institutional review.
            </p>
          </div>
        </div>
      </div>

      {/* WHY IS THIS APPLICANT RISKY? (Risk Increasing vs Positive Mitigating Factors) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Increasing Factors */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Risk Increasing Factors</span>
            </div>
            <span className="text-[11px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
              Escalates Default Probability
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Primary drivers derived from SHAP attribution that elevate applicant default likelihood:
          </p>

          <ul className="space-y-2.5">
            {risk_factors && risk_factors.length > 0 ? (
              risk_factors.map((factor, idx) => (
                <li
                  key={idx}
                  className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs text-red-200 flex items-start gap-2.5"
                >
                  <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic">No acute risk escalation factors identified.</li>
            )}
          </ul>
        </div>

        {/* Positive Mitigating Factors */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
              <TrendingDown className="w-4 h-4" />
              <span>Risk Mitigating / Positive Factors</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Buffers Creditworthiness
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-4">
            Positive compensatory strengths identified in the applicant profile that buffer against default:
          </p>

          <ul className="space-y-2.5">
            {positive_factors && positive_factors.length > 0 ? (
              positive_factors.map((factor, idx) => (
                <li
                  key={idx}
                  className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs text-emerald-200 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{factor}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic">No strong offsetting protective factors observed.</li>
            )}
          </ul>
        </div>
      </div>

      {/* HORIZONTAL SHAP FEATURE IMPACT CHART */}
      <ShapFeatureImpactChart impacts={feature_impacts} />

      {/* CREDIT PROFILE SUMMARY & RATIOS */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-1">Financial Ratios & Profile Summary</h3>
        <p className="text-xs text-slate-400 mb-6">
          Fundamental underwriting benchmarks computed from applicant inputs
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Debt-to-Income (DTI)</span>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {financial_ratios.debt_to_income ? `${(financial_ratios.debt_to_income * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Standard limit: &lt;45%</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Expense Ratio</span>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {financial_ratios.expense_to_income ? `${(financial_ratios.expense_to_income * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Living cost burden</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Loan-to-Annual-Income</span>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {financial_ratios.loan_to_income ? `${financial_ratios.loan_to_income.toFixed(2)}x` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Leverage multiplier</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Savings Cushion</span>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {financial_ratios.savings_to_loan ? `${financial_ratios.savings_to_loan.toFixed(2)}x` : 'N/A'}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Liquidity coverage</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Bureau Score</span>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {credit_score || 'N/A'}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">FICO / CIBIL</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Applied Loan</span>
            <div className="text-lg font-bold text-white font-mono mt-1">
              ${(requested_loan_amount || 0).toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{loan_tenure} Mo. Tenure</span>
          </div>
        </div>
      </div>

      {/* RECOMMENDED NEXT STEPS FOR UNDERWRITERS */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-400" />
          Recommended Next Steps for Institutional Review
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Underwriting protocol recommended for loan officers based on this assessment outcome:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-white">1. Document Verification</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Verify 3-month payroll stubs, tax returns (W2 / Form 16), and bank balance statements for stated liquid assets.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-white">2. Debt Obligation Audit</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cross-reference credit bureau trade lines to ensure all active EMIs and revolving cards match declared debt obligations.
            </p>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-white">3. Collateral / Tenor Restructuring</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {risk_category === 'HIGH RISK'
                ? 'Consider requesting a co-borrower, reducing requested principal, or requiring secured collateral.'
                : 'Standard facility structuring applicable subject to institutional credit authority approval.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← View All Stored Applications in Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/analytics"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
          >
            Portfolio Risk Analytics
          </Link>
          <Link
            to="/assess"
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/20"
          >
            Assess Another Applicant
          </Link>
        </div>
      </div>
    </div>
  );
}
