import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Award, TrendingUp, TrendingDown, Minus, AlertTriangle, Users, RefreshCw, DollarSign, Target, Home, Info, ChevronRight } from 'lucide-react';
import { TubelightNavbar } from '../components/ui/TubelightNavbar';
import { Badge } from '../components/ui/badge';
import { vendorAPI, comparisonAPI } from '../utils/api';
import { formatCurrency, formatPercentage, getQualityGrade } from '../utils/calculations';
import { LayoutGrid } from '../components/ui/layout-grid';
import VendorScorecard from '../components/VendorScorecard';
import ComparisonTable from '../components/ComparisonTable';
import CoverageHeatmap from '../components/CoverageHeatmap';
import AlertDashboard from '../components/AlertDashboard';
import WhatIfAnalyzer from '../components/WhatIfAnalyzer';

const Dashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [coverageData, setCoverageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [vendorsRes, benchmarkRes, coverageRes] = await Promise.all([
        vendorAPI.getVendors(),
        vendorAPI.getBenchmark(),
        comparisonAPI.getCoverageHeatmap()
      ]);
      
      setVendors(vendorsRes.data);
      setBenchmarkData(benchmarkRes.data);
      setCoverageData(coverageRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSelect = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    setSelectedVendor(vendor);
    setActiveTab('vendor-detail');
  };

  const getTopVendors = () => {
    if (!benchmarkData?.vendors) return [];
    return benchmarkData.vendors.slice(0, 4);
  };

  const getSummaryStats = () => {
    if (!benchmarkData?.summary) return null;
    
    return {
      totalVendors: benchmarkData.summary.total_vendors,
      avgQualityScore: benchmarkData.summary.avg_quality_score,
      avgCostPerRecord: benchmarkData.summary.avg_cost_per_record,
      avgCoverage: benchmarkData.summary.avg_coverage
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="loading-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-white animate-pulse">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Dashboard</h2>
          <p className="text-white/80 mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboardData}
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const summaryStats = getSummaryStats();
  const topVendors = getTopVendors();

  const tabIdToLabel = {
    overview: 'Overview',
    comparison: 'Vendor Comparison',
    coverage: 'Geographic Coverage',
    alerts: 'SLA Monitoring',
    analysis: 'What-If Analysis',
  };
  const labelToTabId = Object.fromEntries(Object.entries(tabIdToLabel).map(([k, v]) => [v, k]));

  const dashboardNavItems = [
    { name: 'Overview', url: '#', icon: Award, onClick: () => setActiveTab('overview') },
    { name: 'Vendor Comparison', url: '#', icon: TrendingUp, onClick: () => setActiveTab('comparison') },
    { name: 'Geographic Coverage', url: '#', icon: Users, onClick: () => setActiveTab('coverage') },
    { name: 'SLA Monitoring', url: '#', icon: AlertTriangle, onClick: () => setActiveTab('alerts') },
    { name: 'What-If Analysis', url: '#', icon: Target, onClick: () => setActiveTab('analysis') },
  ];

  return (
    <div className="min-h-screen">
      {/* Header only: truly fixed at top, never scrolls */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-[#07070c]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold font-heading text-white">Vendor Quality Scorecard</h1>
              <p className="text-xs text-white/50 mt-0.5 italic">Quality, cost, and coverage in one view</p>
            </div>
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={loading}
              className="btn-ghost flex items-center gap-2 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Spacer so content starts below fixed header (~72px) */}
      <div className="h-[72px]" aria-hidden="true" />

      {/* Nav bar: in document flow only, scrolls with the page */}
      <div className="mt-4 mb-2 w-full">
        <TubelightNavbar
          items={dashboardNavItems}
          visible={true}
          fixed={false}
          activeTab={tabIdToLabel[activeTab]}
          onTabChange={(name) => setActiveTab(labelToTabId[name] ?? activeTab)}
          rightContent={
            <Link
              to="/"
              className="flex items-center justify-center w-10 h-10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Home"
            >
              <Home className="w-5 h-5" />
            </Link>
          }
        />
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 sm:pb-20">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-12"
          >
            {/* Summary Cards */}
            {summaryStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <motion.div
                  className="metric-card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Active Vendors</p>
                      <p className="metric-value">{summaryStats.totalVendors}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-10 h-10 bg-green-600/80 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Live</Badge>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  className="metric-card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Avg Quality Score</p>
                      <p className="metric-value">{summaryStats.avgQualityScore.toFixed(1)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-10 h-10 bg-green-600/80 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <span className="inline-block h-5" aria-hidden />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  className="metric-card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Avg Cost/Record</p>
                      <p className="metric-value">{formatCurrency(summaryStats.avgCostPerRecord)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-10 h-10 bg-green-600/80 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <span className="inline-block h-5" aria-hidden />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  className="metric-card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Avg Coverage</p>
                      <p className="metric-value">{formatPercentage(summaryStats.avgCoverage)}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-10 h-10 bg-green-600/80 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <span className="inline-block h-5" aria-hidden />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Top Vendors - LayoutGrid with View more info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-semibold font-heading text-white">Top Performing Vendors</h2>
                  <p className="text-sm text-white/50 mt-0.5 italic">Quality leaders and performance metrics</p>
                </div>
              </div>
              {(() => {
                const qualityClass = (score) =>
                  score >= 90 ? 'text-green-400' : score >= 80 ? 'text-green-400' : score >= 70 ? 'text-amber-400' : 'text-red-400';
                const vendorCards = topVendors.map((vendor, index) => {
                  const name = vendor.vendor_name || vendor.name || `Vendor ${index + 1}`;
                  const qualityScore = vendor.quality_score ?? 0;
                  const grade = getQualityGrade(qualityScore);
                  const cost = vendor.cost_per_record ?? 0;
                  const coverage = vendor.geographic_coverage ?? vendor.coverage_percentage ?? 0;
                  const TrendIcon = qualityScore > 85 ? TrendingUp : qualityScore < 75 ? TrendingDown : Minus;
                  return {
                    id: vendor.vendor_id ?? vendor.id ?? index,
                    className: 'col-span-1',
                    faceContent: (
                      <div className="h-full flex flex-col p-6">
                        <div className="h-7 mb-2 flex items-center shrink-0">
                          {index === 0 && <Badge variant="default">Top performer</Badge>}
                        </div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{name}</h3>
                            <p className="text-sm text-white/80 mt-0.5">Leading vendor in quality performance</p>
                          </div>
                          <div className="text-center shrink-0">
                            <div className={`text-3xl font-bold ${qualityClass(qualityScore)} mb-0.5`}>
                              {qualityScore.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center gap-1">
                              <TrendIcon className="w-4 h-4 text-white/70" />
                              <span className={`text-sm font-medium ${grade.color || 'text-white/80'}`}>
                                {grade.grade}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                          <div className="text-center">
                            <div className="text-xl font-bold text-white">{formatCurrency(cost)}</div>
                            <div className="text-sm text-white/80">Cost/Record</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-400">{formatPercentage(coverage)}</div>
                            <div className="text-sm text-white/80">Coverage</div>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/[0.06]">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
                            <Info className="w-3.5 h-3.5" />
                            View more info
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ),
                    content: (
                      <div className="space-y-3">
                        <h3 className="font-heading font-bold text-lg text-white">{name}</h3>
                        <p className="text-sm text-white/70">Additional performance details</p>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <dt className="text-white/50">PII Completeness</dt>
                          <dd className="text-white font-medium">{formatPercentage(vendor.pii_completeness ?? 0)}</dd>
                          <dt className="text-white/50">Disposition Accuracy</dt>
                          <dd className="text-white font-medium">{formatPercentage(vendor.disposition_accuracy ?? 0)}</dd>
                          <dt className="text-white/50">Avg freshness (days)</dt>
                          <dd className="text-white font-medium">{vendor.avg_freshness_days ?? '—'}</dd>
                          <dt className="text-white/50">Geographic coverage</dt>
                          <dd className="text-white font-medium">{formatPercentage(vendor.geographic_coverage ?? vendor.coverage_percentage ?? 0)}</dd>
                          <dt className="text-white/50">Total records</dt>
                          <dd className="text-white font-medium">{(vendor.total_records ?? 0).toLocaleString()}</dd>
                        </dl>
                      </div>
                    ),
                  };
                });
                return <LayoutGrid cards={vendorCards} columns={2} />;
              })()}
            </motion.div>

            {/* Recent Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-semibold font-heading text-white">Recent SLA Alerts</h2>
                  <p className="text-sm text-white/50 mt-0.5 italic">System monitoring and threshold breaches</p>
                </div>
              </div>
              <AlertDashboard limit={5} />
            </motion.div>
          </motion.div>
        )}

        {/* Other tabs with similar motion enhancements */}
        {activeTab === 'comparison' && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h2 className="text-xl font-semibold font-heading text-white mb-0.5">Vendor Comparison Analysis</h2>
              <p className="text-sm text-white/50 italic">Compare vendors across quality, cost, and coverage metrics</p>
            </div>
            <ComparisonTable
              vendors={benchmarkData?.vendors || []}
              onVendorSelect={handleVendorSelect}
              showFilters={true}
            />
          </motion.div>
        )}

        {activeTab === 'coverage' && coverageData && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h2 className="text-xl font-semibold font-heading text-white mb-0.5">Geographic Coverage Analysis</h2>
              <p className="text-sm text-white/50 italic">Vendor performance by jurisdiction and region</p>
            </div>
            <CoverageHeatmap
              data={coverageData.heatmap_data}
              vendors={coverageData.vendors}
              jurisdictions={coverageData.jurisdictions}
            />
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h2 className="text-xl font-semibold font-heading text-white mb-0.5">SLA Monitoring Dashboard</h2>
              <p className="text-sm text-white/50 italic">Real-time alerts and threshold management</p>
            </div>
            <AlertDashboard />
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-8">
              <h2 className="text-xl font-semibold font-heading text-white mb-0.5">Contract Negotiation Analysis</h2>
              <p className="text-sm text-white/50 italic">ROI calculations and vendor switching scenarios</p>
            </div>
            <WhatIfAnalyzer />
          </motion.div>
        )}

        {/* Vendor Detail Modal */}
        {selectedVendor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white/[0.04] rounded-2xl border border-white/[0.06] max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {selectedVendor.name} - Detailed Analysis
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedVendor(null)}
                    className="btn-ghost"
                  >
                    ×
                  </motion.button>
                </div>
              </div>
              
              <div className="p-6">
                <VendorScorecard
                  vendor={selectedVendor}
                  metrics={{
                    quality_score: selectedVendor.quality_score,
                    pii_completeness: selectedVendor.pii_completeness || 0,
                    disposition_accuracy: selectedVendor.disposition_accuracy || 0,
                    avg_freshness_days: selectedVendor.avg_freshness_days || 0,
                    geographic_coverage: selectedVendor.geographic_coverage || 0,
                    total_records: selectedVendor.total_records || 0
                  }}
                  showDetails={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
