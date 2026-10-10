import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Eye,
  RefreshCw,
  PlusCircle,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  Printer
} from 'lucide-react';
import { getApplications } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import RiskScoreGauge from '../components/RiskScoreGauge';
import ShapFeatureImpactChart from '../charts/ShapFeatureImpactChart';

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await getApplications({
        category: categoryFilter || undefined,
        search: search || undefined,
        limit: 100
      });
      setApplications(data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApps();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Underwriting Ledger
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Credit Applications Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and audit all machine learning assessed loan applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchApps}
            className="p-2.5 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/assess"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            New Assessment
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, purpose, employment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </form>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Filter:</span>
          {[
            { label: 'All Tiers', val: '' },
            { label: 'Low Risk', val: 'LOW RISK' },
            { label: 'Medium Risk', val: 'MEDIUM RISK' },
            { label: 'High Risk', val: 'HIGH RISK' }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setCategoryFilter(item.val)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                categoryFilter === item.val
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Applicant ID</th>
                <th className="px-4 py-3.5">Profile</th>
                <th className="px-4 py-3.5">Requested Loan</th>
                <th className="px-4 py-3.5">Credit Score</th>
                <th className="px-4 py-3.5">Default Prob</th>
                <th className="px-4 py-3.5">Risk Score</th>
                <th className="px-4 py-3.5">Risk Tier</th>
                <th className="px-5 py-3.5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Fetching records...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    No credit applications match the criteria.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="px-5 py-3.5 font-mono text-blue-400 font-semibold">
                      {app.applicant_id}
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">
                      <div className="font-medium text-white">{app.employment_type}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        ${app.monthly_income?.toLocaleString()}/mo • Age {app.age}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white font-mono">
                        ${app.requested_loan_amount?.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {app.loan_purpose} ({app.loan_tenure}m)
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      <span className={`font-semibold ${
                        app.credit_score >= 720 ? 'text-emerald-400' : app.credit_score >= 620 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {app.credit_score}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      <span className={`font-semibold ${
                        app.default_probability < 0.25 ? 'text-emerald-400' : app.default_probability < 0.55 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {(app.default_probability * 100).toFixed(1)}%
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-white">
                      {app.risk_score} / 100
                    </td>

                    <td className="px-4 py-3.5">
                      <RiskBadge category={app.risk_category} size="sm" />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                        title="View Full Underwriting Dossier"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL AUDIT MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <RiskBadge category={selectedApp.risk_category} size="md" />
              <span className="font-mono text-sm text-blue-400 font-bold">{selectedApp.applicant_id}</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">Underwriting Detail Dossier</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="space-y-2">
                <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Evaluation Tier</span>
                <div className={`text-3xl font-extrabold ${
                  selectedApp.risk_category === 'LOW RISK' ? 'text-emerald-400' : selectedApp.risk_category === 'MEDIUM RISK' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {selectedApp.risk_category}
                </div>
                <p className="text-xs text-slate-400">{selectedApp.review_action}</p>
              </div>

              <div className="flex justify-center">
                <RiskScoreGauge
                  score={selectedApp.risk_score}
                  defaultProb={selectedApp.default_probability}
                  category={selectedApp.risk_category}
                />
              </div>

              <div className="space-y-3">
                <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Review Guidance</span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                  {selectedApp.review_recommendation}
                </p>
              </div>
            </div>

            {/* Granular applicant profile parameters */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Applicant Data Metrics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase">Income</span>
                  <div className="font-mono font-bold text-white">${selectedApp.monthly_income?.toLocaleString()}/mo</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase">Requested Facility</span>
                  <div className="font-mono font-bold text-white">${selectedApp.requested_loan_amount?.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase">Credit Score</span>
                  <div className="font-mono font-bold text-white">{selectedApp.credit_score}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase">Credit Utilization</span>
                  <div className="font-mono font-bold text-white">{selectedApp.credit_utilization}%</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase">Existing Debt</span>
                  <div className="font-mono font-bold text-white">${selectedApp.existing_debt?.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase">Liquid Savings</span>
                  <div className="font-mono font-bold text-white">${selectedApp.savings_amount?.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase">Prior Defaults</span>
                  <div className="font-mono font-bold text-white">{selectedApp.number_of_previous_defaults}</div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase">Late Payments</span>
                  <div className="font-mono font-bold text-white">{selectedApp.number_of_late_payments}</div>
                </div>
              </div>
            </div>

            {/* SHAP Chart */}
            <div className="mb-6">
              <ShapFeatureImpactChart impacts={selectedApp.feature_impacts || []} />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
