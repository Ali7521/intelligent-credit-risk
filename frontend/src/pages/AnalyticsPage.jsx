import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  TrendingDown,
  Percent,
  Layers,
  HelpCircle
} from 'lucide-react';
import { getDashboardAnalytics } from '../services/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error('Error fetching dashboard analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Aggregating portfolio risk metrics...</p>
      </div>
    );
  }

  const {
    total_applications,
    low_risk_count,
    medium_risk_count,
    high_risk_count,
    avg_risk_score,
    avg_default_probability,
    category_distribution = [],
    default_prob_distribution = [],
    credit_score_vs_risk = [],
    income_vs_risk = [],
    dti_vs_risk = [],
    feature_importance = []
  } = data;

  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs text-white">
          <p className="font-semibold text-slate-300 mb-1">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-mono text-blue-400">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 mb-2">
          <BarChart3 className="w-3.5 h-3.5" />
          Portfolio Risk Intelligence
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Credit Risk Analytics Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">
          Macro portfolio distributions, risk factor sensitivity, and correlation curves across loan applicants.
        </p>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Applications */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Assessed</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {total_applications.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Portfolio Applications</span>
        </div>

        {/* Low-Risk Count */}
        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-4 bg-emerald-950/10">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] uppercase font-semibold">Low Risk</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
            {low_risk_count.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400/70 mt-0.5 block">
            {total_applications ? Math.round((low_risk_count / total_applications) * 100) : 0}% of portfolio
          </span>
        </div>

        {/* Medium-Risk Count */}
        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 bg-amber-950/10">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] uppercase font-semibold">Medium Risk</span>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
            {medium_risk_count.toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-400/70 mt-0.5 block">
            {total_applications ? Math.round((medium_risk_count / total_applications) * 100) : 0}% of portfolio
          </span>
        </div>

        {/* High-Risk Count */}
        <div className="bg-slate-900/80 border border-red-500/20 rounded-2xl p-4 bg-red-950/10">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[10px] uppercase font-semibold">High Risk</span>
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-extrabold text-red-400 font-mono mt-1">
            {high_risk_count.toLocaleString()}
          </div>
          <span className="text-[10px] text-red-400/70 mt-0.5 block">
            {total_applications ? Math.round((high_risk_count / total_applications) * 100) : 0}% of portfolio
          </span>
        </div>

        {/* Average Risk Score */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Risk Score</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {avg_risk_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Portfolio Credit Health</span>
        </div>

        {/* Average Default Probability */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Default Prob</span>
          <div className="text-2xl font-extrabold text-blue-400 font-mono mt-1">
            {avg_default_probability}%
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Weighted Expected Loss</span>
        </div>
      </div>

      {/* ROW 1 CHARTS: Risk Category Distribution (Donut) & Default Probability Distribution (Histogram) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Risk Category Distribution Donut */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-1">Risk Category Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Proportion of applicants categorized across risk tiers</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {category_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  formatter={(value, entry) => (
                    <span className="text-xs text-slate-300 font-medium">
                      {value} ({entry.payload.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Default Probability Distribution Histogram */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-1">Default Probability Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Count of applicants clustered by estimated default probability</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={default_prob_distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="bucket" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="count" name="Applicants" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 2 CHARTS: Credit Score vs Risk & Income vs Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Credit Score vs Risk */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-1">Credit Score vs Default Probability</h3>
          <p className="text-xs text-slate-400 mb-4">Empirical correlation between bureau score and default probability</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="credit_score"
                  name="Credit Score"
                  domain={[300, 850]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="default_probability"
                  name="Default Probability %"
                  domain={[0, 100]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  unit="%"
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomChartTooltip />} />
                <Scatter name="Borrowers" data={credit_score_vs_risk} fill="#06b6d4" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Monthly Income vs Risk Score */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-1">Monthly Income vs Risk Score</h3>
          <p className="text-xs text-slate-400 mb-4">Relationship between stated income and calibrated safety index</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={income_vs_risk} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="monthly_income"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                />
                <YAxis
                  dataKey="risk_score"
                  domain={[0, 100]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="risk_score"
                  name="Risk Score"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3 CHARTS: Debt-to-Income vs Risk & Global Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 5: Debt-to-Income vs Risk Curve */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-1">Debt-to-Income (DTI) vs Default Probability</h3>
          <p className="text-xs text-slate-400 mb-4">Risk escalation as debt service commitments approach monthly cashflow</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dti_vs_risk} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="dti"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  unit="%"
                />
                <YAxis
                  dataKey="default_probability"
                  domain={[0, 100]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  unit="%"
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="default_probability"
                  name="Default Probability %"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#ef4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Global Feature Importance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-1">Global Feature Importance (Champion Model)</h3>
          <p className="text-xs text-slate-400 mb-4">Most influential predictive features across the training population</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={feature_importance.slice(0, 7)}
                margin={{ top: 10, right: 20, left: 80, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  stroke="#64748b"
                  tick={{ fill: '#cbd5e1', fontSize: 10 }}
                  tickFormatter={(val) => val.replace(/_/g, ' ').slice(0, 18)}
                  width={90}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="importance" name="Model Weight" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
