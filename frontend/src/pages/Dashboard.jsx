import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, TrendingUp, AlertTriangle, Users, RefreshCw, Activity, DollarSign, ArrowRight, Target } from 'lucide-react';
import { vendorAPI, comparisonAPI } from '../utils/api';
import { formatCurrency, formatPercentage } from '../utils/calculations';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="loading-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700 animate-pulse">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboardData}
            className="btn-primary flex items-center space-x-2 mx-auto"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Vendor Quality Scorecard</h1>
                  <p className="text-sm text-gray-500">Enterprise Analytics Platform</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchDashboardData}
                className="btn-ghost flex items-center space-x-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/"
                className="btn-secondary flex items-center space-x-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Home</span>
              </motion.a>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="nav-tabs">
            {[
              { id: 'overview', label: 'Overview', icon: Award },
              { id: 'comparison', label: 'Vendor Comparison', icon: TrendingUp },
              { id: 'coverage', label: 'Geographic Coverage', icon: Users },
              { id: 'alerts', label: 'SLA Monitoring', icon: AlertTriangle },
              { id: 'analysis', label: 'What-If Analysis', icon: Target }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-tab flex items-center space-x-2 ${activeTab === tab.id ? 'active' : ''}`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Summary Cards */}
            {summaryStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="metric-card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Active Vendors</p>
                      <p className="metric-value">{summaryStats.totalVendors}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="metric-card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Avg Quality Score</p>
                      <p className="metric-value">{summaryStats.avgQualityScore.toFixed(1)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="metric-card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Avg Cost/Record</p>
                      <p className="metric-value">{formatCurrency(summaryStats.avgCostPerRecord)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="metric-card"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="metric-label">Avg Coverage</p>
                      <p className="metric-value">{formatPercentage(summaryStats.avgCoverage)}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Top Vendors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Top Performing Vendors</h2>
                  <p className="text-sm text-gray-500">Quality leaders and performance metrics</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topVendors.map((vendor, index) => (
                  <motion.div
                    key={vendor.vendor_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <VendorScorecard
                      vendor={vendor}
                      metrics={{
                        quality_score: vendor.quality_score,
                        pii_completeness: vendor.pii_completeness || 0,
                        disposition_accuracy: vendor.disposition_accuracy || 0,
                        avg_freshness_days: vendor.avg_freshness_days || 0,
                        geographic_coverage: vendor.geographic_coverage || 0,
                        total_records: vendor.total_records || 0
                      }}
                      compact={true}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recent SLA Alerts</h2>
                  <p className="text-sm text-gray-500">System monitoring and threshold breaches</p>
                </div>
              </div>
              <AlertDashboard limit={5} />
            </motion.div>
          </motion.div>
        )}

        {/* Other tabs with similar motion enhancements */}
        {activeTab === 'comparison' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Comparison Analysis</h2>
              <p className="text-sm text-gray-500">Compare vendors across quality, cost, and coverage metrics</p>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Geographic Coverage Analysis</h2>
              <p className="text-sm text-gray-500">Vendor performance by jurisdiction and region</p>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">SLA Monitoring Dashboard</h2>
              <p className="text-sm text-gray-500">Real-time alerts and threshold management</p>
            </div>
            <AlertDashboard />
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contract Negotiation Analysis</h2>
              <p className="text-sm text-gray-500">ROI calculations and vendor switching scenarios</p>
            </div>
            <WhatIfAnalyzer />
          </motion.div>
        )}

        {/* Vendor Detail Modal */}
        {selectedVendor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
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
