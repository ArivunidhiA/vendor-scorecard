import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ArrowRight,
  ArrowUpRight,
  LayoutGrid as LayoutGridIcon,
  Upload,
  Zap,
  Target,
  DollarSign,
  CheckCircle,
  ChevronRight,
  FileText,
  Play
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TubelightNavbar } from './ui/TubelightNavbar';
import { quickAPI } from '../utils/api';
import QuickUploader from './QuickUploader';
import QuickComparisonResults from './QuickComparisonResults';

const LandingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('upload'); // upload, configure, results
  const [uploadedData, setUploadedData] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({
    mode: 'side-by-side',
    priority: 'balanced',
    annualVolume: ''
  });

  const landingNavItems = [
    { name: 'Features', url: '#features', icon: LayoutGridIcon },
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  ];

  const featureCards = [
    {
      id: 1,
      title: 'Quality scoring',
      tagline: 'Compare vendors in one place',
      description: 'PII completeness, disposition accuracy, freshness, and coverage — all in a single scorecard so you can compare vendors at a glance.',
      className: 'md:col-span-2',
    },
    {
      id: 2,
      title: 'What‑if analysis',
      tagline: 'Model before you switch',
      description: 'Model switching costs and ROI before you change vendors. See financial impact and risk so you can decide with data.',
      className: 'col-span-1',
    },
    {
      id: 3,
      title: 'Coverage by jurisdiction',
      tagline: 'Region and jurisdiction view',
      description: 'See how each vendor performs by region and jurisdiction. Heatmaps and breakdowns so you know where coverage is strong or weak.',
      className: 'col-span-1',
    },
    {
      id: 4,
      title: 'SLA monitoring',
      tagline: 'Alerts when it matters',
      description: 'Alerts when thresholds are breached so you can act fast. Monitor uptime, latency, and accuracy in one place.',
      className: 'md:col-span-2',
    },
  ];

  const handleUploadSuccess = (data) => {
    setUploadedData(data);
    setStep('configure');
    setError(null);
  };

  const handleUploadError = (err) => {
    setError(err);
  };

  const handleCompare = async () => {
    setLoading(true);
    setError(null);

    try {
      // Transform uploaded data for comparison
      const vendors = uploadedData.vendors.map(v => ({
        name: v.name,
        cost_per_record: v.cost_per_record,
        quality_score: v.quality_score,
        pii_completeness: v.pii_completeness,
        disposition_accuracy: v.disposition_accuracy,
        avg_freshness_days: v.avg_freshness_days,
        coverage_percentage: v.coverage_percentage,
        description: v.description
      }));

      const response = await quickAPI.compare({
        vendors,
        mode: config.mode,
        priority: config.priority,
        annual_volume: config.annualVolume ? parseInt(config.annualVolume) : null
      });

      setComparisonResults(response.data);
      setStep('results');
    } catch (err) {
      setError(err.response?.data?.detail || 'Comparison failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await quickAPI.getDemoData();
      setUploadedData({ vendors: response.data.vendors });
      setStep('configure');
    } catch (err) {
      setError('Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('upload');
    setUploadedData(null);
    setComparisonResults(null);
    setConfig({ mode: 'side-by-side', priority: 'balanced', annualVolume: '' });
    setError(null);
  };

  const saveToDashboard = () => {
    // Redirect to full dashboard for saving
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Same vertical position as Dashboard: spacer (header height) + navbar wrapper */}
      <div className="h-[72px]" aria-hidden="true" />
      <div className="mt-4 mb-0 w-full">
        <TubelightNavbar items={landingNavItems} fixed={false} />
      </div>

      {/* Hero Section with Quick Comparison */}
      <section className="relative min-h-0 flex flex-col items-center justify-start overflow-hidden pt-9 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 w-full max-w-5xl mx-auto overflow-hidden"
        >
          <h1 className="font-heading text-white mb-3 leading-tight">
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold">Vendor Quality Scorecard</span>
            <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-white/90 italic mt-1">Compare in seconds, decide with data</span>
          </h1>
          <p className="text-base text-white/70 mb-5 max-w-2xl mx-auto leading-relaxed">
            Upload your vendor data CSV and get instant quality scores, cost analysis, and recommendations. 
            <span className="text-white">No setup required.</span>
          </p>
          
          {/* Quick Start Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('quick-compare').scrollIntoView({ behavior: 'smooth' })}
              className="group inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Vendor Data
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadDemoData}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors border border-white/20"
            >
              <Play className="w-5 h-5" />
              {loading ? 'Loading...' : 'Try Demo'}
            </motion.button>
          </div>

          <p className="text-white/50 text-sm mb-8">
            Free to use • No account required • Results in 30 seconds
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-2xl mx-auto">
            <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06] text-center">
              <div className="text-xl font-semibold text-green-500 font-heading tabular-nums">10K+</div>
              <p className="text-sm text-white/50 mt-0.5">Records processed daily</p>
            </div>
            <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06] text-center">
              <div className="text-xl font-semibold text-green-500 font-heading tabular-nums">99.9%</div>
              <p className="text-sm text-white/50 mt-0.5">Accuracy rate</p>
            </div>
            <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06] text-center">
              <div className="text-xl font-semibold text-green-500 font-heading tabular-nums">24/7</div>
              <p className="text-sm text-white/50 mt-0.5">SLA monitoring</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Quick Comparison Section */}
      <section id="quick-compare" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-semibold text-white mb-2">
              Quick Vendor Comparison
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Upload your vendor data CSV or use demo data to see how the scorecard works.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-2">
              {['upload', 'configure', 'results'].map((s, idx) => (
                <React.Fragment key={s}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step === s ? "bg-green-500 text-white" : 
                    ['configure', 'results'].includes(step) && idx < ['upload', 'configure', 'results'].indexOf(step) ? "bg-green-500/50 text-white" :
                    "bg-white/10 text-white/50"
                  )}>
                    {idx + 1}
                  </div>
                  {idx < 2 && <ChevronRight className="w-4 h-4 text-white/30" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Main Card */}
          <motion.div layout className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 'upload' && (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                  <QuickUploader onUploadSuccess={handleUploadSuccess} onError={handleUploadError} />
                  {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
                  <div className="mt-6 p-4 bg-white/5 rounded-xl">
                    <p className="text-sm text-white/60 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      CSV should include: <span className="text-white">vendor_name</span>, <span className="text-white">cost_per_record</span>
                    </p>
                    <p className="text-xs text-white/40">Optional: quality_score, pii_completeness, disposition_accuracy, avg_freshness_days, coverage_percentage, description</p>
                  </div>
                </motion.div>
              )}

              {step === 'configure' && uploadedData && (
                <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">Configure Comparison</h3>
                      <p className="text-white/60 text-sm">{uploadedData.vendors?.length || 0} vendors ready</p>
                    </div>
                    <button onClick={() => setStep('upload')} className="text-white/60 hover:text-white text-sm">Change File</button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-3">What's most important?</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { value: 'quality', label: 'Quality', icon: Target, desc: 'Best accuracy' },
                          { value: 'cost', label: 'Cost', icon: DollarSign, desc: 'Lowest price' },
                          { value: 'value', label: 'Value', icon: Zap, desc: 'Quality per $' },
                          { value: 'balanced', label: 'Balanced', icon: CheckCircle, desc: 'All factors' },
                        ].map((option) => (
                          <button key={option.value} onClick={() => setConfig({ ...config, priority: option.value })} className={cn("p-4 rounded-xl border text-left transition-all", config.priority === option.value ? "border-green-500 bg-green-500/10" : "border-white/20 hover:border-white/40 bg-white/5")}>
                            <option.icon className={cn("w-5 h-5 mb-2", config.priority === option.value ? "text-green-400" : "text-white/60")} />
                            <p className={cn("font-medium text-sm", config.priority === option.value ? "text-white" : "text-white/80")}>{option.label}</p>
                            <p className="text-xs text-white/50">{option.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Annual Record Volume (Optional)</label>
                      <input type="number" value={config.annualVolume} onChange={(e) => setConfig({ ...config, annualVolume: e.target.value })} placeholder="e.g., 50000" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500" />
                      <p className="text-xs text-white/50 mt-2">Used to calculate total annual cost and ROI</p>
                    </div>

                    <button onClick={handleCompare} disabled={loading} className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center">
                      {loading ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />Analyzing...</> : <><BarChart3 className="w-5 h-5 mr-2" />Compare Vendors</>}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'results' && comparisonResults && (
                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
                  <QuickComparisonResults results={comparisonResults} onReset={resetFlow} onSave={saveToDashboard} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Features - text-only cards */}
      <section id="features" className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl font-semibold text-white mb-2">What you get</h2>
            <p className="text-white/60 text-sm max-w-lg mx-auto">Core capabilities for evaluating and managing vendor performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featureCards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  card.className,
                  'bg-white/[0.04] rounded-2xl border border-white/[0.06] p-5'
                )}
              >
                <p className="font-heading font-bold md:text-2xl text-lg text-white">{card.title}</p>
                <p className="font-normal text-sm text-white/80 mt-1 italic">{card.tagline}</p>
                <p className="font-normal text-sm my-3 max-w-md text-white/70 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="analytics" className="py-8 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl font-semibold text-white mb-2">Dashboard preview</h2>
            <p className="text-white/60 text-sm max-w-lg mx-auto"><span className="italic">Quality, cost, and coverage in one view.</span></p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/[0.04] rounded-2xl border border-white/[0.06] overflow-hidden"
          >
            <div className="bg-green-600 px-5 py-3">
              <h3 className="font-heading text-base font-semibold text-white">Scorecard overview</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                  <div className="text-xs text-white/50 mb-0.5">Vendor performance</div>
                  <div className="text-lg font-semibold text-white tabular-nums">94.2</div>
                  <div className="text-xs text-green-500 mt-0.5">↑ 2.3%</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                  <div className="text-xs text-white/50 mb-0.5">Cost per record</div>
                  <div className="text-lg font-semibold text-white tabular-nums">$8.45</div>
                  <div className="text-xs text-green-500 mt-0.5">↓ 12%</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                  <div className="text-xs text-white/50 mb-0.5">Coverage</div>
                  <div className="text-lg font-semibold text-white tabular-nums">87.3%</div>
                  <div className="text-xs text-white/50 mt-0.5">→ 5.1%</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
