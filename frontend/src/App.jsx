import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import AssessmentPage from './pages/AssessmentPage';
import ResultPage from './pages/ResultPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import ResponsibleAiPage from './pages/ResponsibleAiPage';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#0a0e17] text-slate-100 selection:bg-blue-600 selection:text-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/assess" element={<AssessmentPage />} />
            <Route path="/result" element={<ResultPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/models" element={<ModelPerformancePage />} />
            <Route path="/responsible-ai" element={<ResponsibleAiPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
