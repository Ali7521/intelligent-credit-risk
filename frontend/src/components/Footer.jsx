import React from 'react';
import { Shield, Sparkles, Terminal, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#090d15] border-t border-slate-800/80 mt-20 text-slate-400 text-xs">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Disclaimer:</strong> This application is an educational AI prototype. Its predictions should not be used as the sole basis for real-world lending or financial decisions.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <Shield className="w-5 h-5 text-blue-500" />
              <span>AI CreditGuard</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Intelligent Credit Risk Assessment System built for transparent, machine learning-driven credit underwriting. Powered by XGBoost, Random Forest, Logistic Regression with SMOTE imbalance handling, and local SHAP explainability.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">FastAPI</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">Scikit-learn</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">XGBoost</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">SHAP</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">React + Vite</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">PostgreSQL</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Application Pages</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">System Overview</Link></li>
              <li><Link to="/assess" className="hover:text-blue-400 transition-colors">Credit Risk Assessment</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-400 transition-colors">Applications Ledger</Link></li>
              <li><Link to="/analytics" className="hover:text-blue-400 transition-colors">Portfolio Analytics</Link></li>
              <li><Link to="/models" className="hover:text-blue-400 transition-colors">Model Benchmark Suite</Link></li>
            </ul>
          </div>

          {/* Responsible AI & Compliance */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Governance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/responsible-ai" className="hover:text-blue-400 transition-colors">Responsible AI & Ethics</Link></li>
              <li><Link to="/responsible-ai#fairness" className="hover:text-blue-400 transition-colors">Protected Attributes Policy</Link></li>
              <li><Link to="/responsible-ai#explainability" className="hover:text-blue-400 transition-colors">SHAP Interpretability</Link></li>
              <li><Link to="/responsible-ai#human" className="hover:text-blue-400 transition-colors">Human-in-the-Loop Review</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} AI CreditGuard – BTech AI/ML Capstone & Hackathon Demonstration.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ML Engine Live & Calibrated
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
