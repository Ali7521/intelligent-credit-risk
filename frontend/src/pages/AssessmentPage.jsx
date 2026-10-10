import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  Wallet,
  History,
  Coins,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Calculator,
  ShieldAlert
} from 'lucide-react';
import { submitApplication } from '../services/api';

const DEMO_PRESETS = {
  prime: {
    label: 'Prime (Low Risk)',
    color: 'emerald',
    data: {
      age: 38,
      loan_purpose: 'Home Improvement',
      monthly_income: 8500,
      employment_type: 'Salaried',
      years_of_employment: 8.0,
      monthly_expenses: 3200,
      existing_debt: 12000,
      existing_emi: 420,
      savings_amount: 28000,
      credit_score: 780,
      credit_history_length: 12.0,
      number_of_previous_loans: 3,
      number_of_previous_defaults: 0,
      number_of_late_payments: 0,
      credit_utilization: 16.5,
      number_of_active_loans: 1,
      requested_loan_amount: 30000,
      loan_tenure: 36
    }
  },
  moderate: {
    label: 'Near-Prime (Medium Risk)',
    color: 'amber',
    data: {
      age: 32,
      loan_purpose: 'Debt Consolidation',
      monthly_income: 4800,
      employment_type: 'Self-Employed',
      years_of_employment: 3.5,
      monthly_expenses: 2800,
      existing_debt: 22000,
      existing_emi: 750,
      savings_amount: 4500,
      credit_score: 645,
      credit_history_length: 6.0,
      number_of_previous_loans: 3,
      number_of_previous_defaults: 0,
      number_of_late_payments: 2,
      credit_utilization: 58.0,
      number_of_active_loans: 2,
      requested_loan_amount: 25000,
      loan_tenure: 36
    }
  },
  subprime: {
    label: 'Subprime (High Risk)',
    color: 'red',
    data: {
      age: 27,
      loan_purpose: 'Debt Consolidation',
      monthly_income: 2400,
      employment_type: 'Freelancer',
      years_of_employment: 1.0,
      monthly_expenses: 2100,
      existing_debt: 34000,
      existing_emi: 880,
      savings_amount: 600,
      credit_score: 520,
      credit_history_length: 3.0,
      number_of_previous_loans: 5,
      number_of_previous_defaults: 2,
      number_of_late_payments: 5,
      credit_utilization: 89.0,
      number_of_active_loans: 4,
      requested_loan_amount: 28000,
      loan_tenure: 24
    }
  }
};

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    age: 32,
    loan_purpose: 'Debt Consolidation',

    // Step 2: Employment & Income
    monthly_income: 6500,
    employment_type: 'Salaried',
    years_of_employment: 5.0,

    // Step 3: Debt & Expenses
    monthly_expenses: 3000,
    existing_debt: 14000,
    existing_emi: 500,
    savings_amount: 12000,

    // Step 4: Credit History
    credit_score: 720,
    credit_history_length: 7.5,
    number_of_previous_loans: 2,
    number_of_previous_defaults: 0,
    number_of_late_payments: 0,
    credit_utilization: 28.0,
    number_of_active_loans: 1,

    // Step 5: Loan Information
    requested_loan_amount: 25000,
    loan_tenure: 36
  });

  const steps = [
    { id: 1, name: 'Personal Info', icon: User },
    { id: 2, name: 'Employment & Income', icon: Briefcase },
    { id: 3, name: 'Debt & Expenses', icon: Wallet },
    { id: 4, name: 'Credit History', icon: History },
    { id: 5, name: 'Loan Request', icon: Coins },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberChange = (field, value) => {
    const num = parseFloat(value);
    setFormData(prev => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num
    }));
  };

  const loadPreset = (presetKey) => {
    if (DEMO_PRESETS[presetKey]) {
      setFormData(DEMO_PRESETS[presetKey].data);
    }
  };

  // Real-time calculated indicators
  const estimatedNewEmi = formData.loan_tenure > 0
    ? Math.round(formData.requested_loan_amount / formData.loan_tenure)
    : 0;
  const estimatedDti = formData.monthly_income > 0
    ? Math.round(((formData.existing_emi + estimatedNewEmi) / formData.monthly_income) * 100)
    : 0;

  // Validation per step
  const validateStep = (step) => {
    if (step === 1) {
      if (formData.age < 18 || formData.age > 95) return 'Age must be between 18 and 95.';
      if (!formData.loan_purpose) return 'Please select a loan purpose.';
    }
    if (step === 2) {
      if (formData.monthly_income <= 0) return 'Monthly income must be greater than 0.';
      if (formData.years_of_employment < 0) return 'Years of employment cannot be negative.';
    }
    if (step === 3) {
      if (formData.monthly_expenses < 0) return 'Monthly expenses cannot be negative.';
      if (formData.existing_debt < 0) return 'Existing debt cannot be negative.';
      if (formData.existing_emi < 0) return 'Existing EMI cannot be negative.';
      if (formData.savings_amount < 0) return 'Savings cannot be negative.';
    }
    if (step === 4) {
      if (formData.credit_score < 300 || formData.credit_score > 850) {
        return 'Credit score must be between 300 and 850.';
      }
      if (formData.credit_utilization < 0 || formData.credit_utilization > 100) {
        return 'Credit utilization must be between 0% and 100%.';
      }
    }
    if (step === 5) {
      if (formData.requested_loan_amount <= 0) return 'Loan amount must be greater than 0.';
      if (formData.loan_tenure <= 0) return 'Tenure must be greater than 0.';
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      setApiError(error);
      return;
    }
    setApiError(null);
    setCurrentStep(prev => Math.min(steps.length, prev + 1));
  };

  const handleBack = () => {
    setApiError(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateStep(5);
    if (error) {
      setApiError(error);
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      const response = await submitApplication(formData);
      // Navigate to result page passing assessment state
      navigate('/result', { state: { application: response } });
    } catch (err) {
      console.error('Submission error:', err);
      const detail = err.response?.data?.detail || err.message || 'Error executing ML risk assessment.';
      setApiError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header and Preset Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            Underwriting Assessment Pipeline
          </div>
          <h1 className="text-3xl font-extrabold text-white">Credit Risk Evaluation Form</h1>
          <p className="text-sm text-slate-400 mt-1">
            Fill in borrower parameters to run real-time ML inference & SHAP explainability.
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Load Demo Profile:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadPreset('prime')}
              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all font-medium"
            >
              Prime (Low)
            </button>
            <button
              type="button"
              onClick={() => loadPreset('moderate')}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all font-medium"
            >
              Near-Prime
            </button>
            <button
              type="button"
              onClick={() => loadPreset('subprime')}
              className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all font-medium"
            >
              Subprime (High)
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar & Steps Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-8">
        <div className="grid grid-cols-5 gap-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = s.id < currentStep;
            const isCurrent = s.id === currentStep;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (s.id < currentStep) setCurrentStep(s.id);
                }}
                className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400'
                    : isCompleted
                    ? 'text-emerald-400 hover:bg-slate-800/60'
                    : 'text-slate-500 opacity-60'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 text-xs font-bold ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className="text-[11px] font-medium hidden sm:block">{s.name}</span>
                <span className="text-[10px] sm:hidden">Step {s.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Banner */}
      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <div>
            <strong className="font-semibold">Validation Notice:</strong> {apiError}
          </div>
        </div>
      )}

      {/* Multi-Step Form Card */}
      <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* STEP 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Step 1: Personal Information
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Baseline demographic and borrow intent (Strictly excluding protected characteristics).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Applicant Age (Years) *
                </label>
                <input
                  type="number"
                  min="18"
                  max="95"
                  value={formData.age}
                  onChange={(e) => handleNumberChange('age', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Valid range: 18 - 95 years</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Stated Loan Purpose *
                </label>
                <select
                  value={formData.loan_purpose}
                  onChange={(e) => handleChange('loan_purpose', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="Debt Consolidation">Debt Consolidation</option>
                  <option value="Home Improvement">Home Improvement</option>
                  <option value="Business Venture">Business Venture</option>
                  <option value="Education">Education</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Auto Purchase">Auto Purchase</option>
                  <option value="Personal">Personal</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">Loan objective category</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Employment & Income */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" />
                Step 2: Employment & Income
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Income streams, employment tenure, and stability profile.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Gross Monthly Income ($ USD) *
                </label>
                <input
                  type="number"
                  min="500"
                  max="500000"
                  step="50"
                  value={formData.monthly_income}
                  onChange={(e) => handleNumberChange('monthly_income', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Verified monthly gross earnings</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Employment Type *
                </label>
                <select
                  value={formData.employment_type}
                  onChange={(e) => handleChange('employment_type', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="Salaried">Salaried (Corporate / Public)</option>
                  <option value="Self-Employed">Self-Employed Professional</option>
                  <option value="Business Owner">Business Owner</option>
                  <option value="Freelancer">Freelancer / Gig Economy</option>
                  <option value="Contract">Contract / Temp Worker</option>
                  <option value="Unemployed">Currently Unemployed</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">Primary revenue arrangement</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Years of Current Employment Tenure *
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={formData.years_of_employment}
                  onChange={(e) => handleNumberChange('years_of_employment', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Duration with current employer / enterprise</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Debt & Expenses */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                Step 3: Debt & Expenses
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Existing fixed liabilities, monthly expenditures, and cash reserves.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Monthly Living Expenses ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={formData.monthly_expenses}
                  onChange={(e) => handleNumberChange('monthly_expenses', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Rent, utilities, food, subsistence</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Existing Total Debt ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.existing_debt}
                  onChange={(e) => handleNumberChange('existing_debt', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Total outstanding loan & card balances</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Existing Monthly EMI / Debt Service ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="25"
                  value={formData.existing_emi}
                  onChange={(e) => handleNumberChange('existing_emi', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Monthly debt payment obligations</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Liquid Savings Cushion ($) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.savings_amount}
                  onChange={(e) => handleNumberChange('savings_amount', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Verified bank cash & emergency reserves</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Credit History */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" />
                Step 4: Credit History Profile
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Credit bureau record, past repayment discipline, and delinquency history.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Credit Score (FICO/CIBIL 300-850) *
                </label>
                <input
                  type="number"
                  min="300"
                  max="850"
                  value={formData.credit_score}
                  onChange={(e) => handleNumberChange('credit_score', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Bureau credit score index</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Credit History Length (Years) *
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="45"
                  step="0.5"
                  value={formData.credit_history_length}
                  onChange={(e) => handleNumberChange('credit_history_length', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Age of oldest active trade line</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Credit Utilization (%) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.credit_utilization}
                  onChange={(e) => handleNumberChange('credit_utilization', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Percentage of revolving credit used</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Historical Late Payments Count *
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.number_of_late_payments}
                  onChange={(e) => handleNumberChange('number_of_late_payments', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">30+ days past due occurrences</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Previous Defaults / Charge-Offs *
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.number_of_previous_defaults}
                  onChange={(e) => handleNumberChange('number_of_previous_defaults', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Severe default or write-off events</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Active Open Credit Lines *
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.number_of_active_loans}
                  onChange={(e) => handleNumberChange('number_of_active_loans', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Currently servicing loan accounts</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Loan Information & Live Preview */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-blue-400" />
                Step 5: Requested Loan Facility
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Requested principal amount and amortization period.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Requested Principal Loan Amount ($) *
                </label>
                <input
                  type="number"
                  min="1000"
                  max="500000"
                  step="500"
                  value={formData.requested_loan_amount}
                  onChange={(e) => handleNumberChange('requested_loan_amount', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Applied loan amount</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Loan Tenure (Months) *
                </label>
                <select
                  value={formData.loan_tenure}
                  onChange={(e) => handleNumberChange('loan_tenure', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
                >
                  <option value={12}>12 Months (1 Year)</option>
                  <option value={24}>24 Months (2 Years)</option>
                  <option value={36}>36 Months (3 Years)</option>
                  <option value={48}>48 Months (4 Years)</option>
                  <option value={60}>60 Months (5 Years)</option>
                  <option value={84}>84 Months (7 Years)</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">Repayment duration</span>
              </div>
            </div>

            {/* Derived Financial Metrics Live Box */}
            <div className="mt-8 p-5 bg-slate-950 border border-slate-800/80 rounded-2xl">
              <div className="flex items-center gap-2 mb-3 text-slate-300 text-xs font-semibold uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-blue-400" />
                Real-Time Estimated Underwriting Metrics
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Estimated New EMI</span>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    ${estimatedNewEmi.toLocaleString()}/mo
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Projected DTI Ratio</span>
                  <div className={`text-base font-bold font-mono mt-0.5 ${estimatedDti > 50 ? 'text-red-400' : estimatedDti > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {estimatedDti}%
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Savings Cushion</span>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    {formData.requested_loan_amount > 0 ? (formData.savings_amount / formData.requested_loan_amount).toFixed(2) : 0}x
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase">Bureau Score</span>
                  <div className={`text-base font-bold font-mono mt-0.5 ${formData.credit_score >= 720 ? 'text-emerald-400' : formData.credit_score >= 620 ? 'text-amber-400' : 'text-red-400'}`}>
                    {formData.credit_score}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Step
            </button>
          ) : <div />}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              Continue to Step {currentStep + 1}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-xl shadow-blue-600/40 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Running ML Inference & SHAP...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Credit Risk
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
