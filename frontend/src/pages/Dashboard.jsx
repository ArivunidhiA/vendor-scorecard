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

// Sample data for demo/portfolio when database is empty
const getSampleVendors = () => [
  { id: 1, name: 'Premium Data Corp', description: 'Highest quality and coverage', cost_per_record: 12.00, quality_score: 95.0, coverage_percentage: 98.0, is_active: true },
  { id: 2, name: 'Balanced Solutions', description: 'Good quality at reasonable cost', cost_per_record: 8.00, quality_score: 88.0, coverage_percentage: 92.0, is_active: true },
  { id: 3, name: 'Budget Checks', description: 'Lower cost, reduced quality', cost_per_record: 5.00, quality_score: 78.0, coverage_percentage: 85.0, is_active: true },
  { id: 4, name: 'CA Specialist', description: 'California specialist', cost_per_record: 10.00, quality_score: 92.0, coverage_percentage: 75.0, is_active: true },
];

const getSampleBenchmark = () => ({
  summary: {
    total_vendors: 4,
    avg_quality_score: 88.25,
    avg_cost_per_record: 8.75,
    avg_coverage: 87.5,
  },
  vendors: [
    { vendor_id: 1, vendor_name: 'Premium Data Corp', quality_score: 95.0, cost_per_record: 12.00, geographic_coverage: 98.0, pii_completeness: 96.5, disposition_accuracy: 97.8, avg_freshness_days: 2.1, total_records: 1250, coverage_percentage: 98.0 },
    { vendor_id: 2, vendor_name: 'Balanced Solutions', quality_score: 88.0, cost_per_record: 8.00, geographic_coverage: 92.0, pii_completeness: 89.2, disposition_accuracy: 91.5, avg_freshness_days: 3.4, total_records: 2100, coverage_percentage: 92.0 },
    { vendor_id: 3, vendor_name: 'Budget Checks', quality_score: 78.0, cost_per_record: 5.00, geographic_coverage: 85.0, pii_completeness: 82.1, disposition_accuracy: 84.3, avg_freshness_days: 5.2, total_records: 3200, coverage_percentage: 85.0 },
    { vendor_id: 4, vendor_name: 'CA Specialist', quality_score: 92.0, cost_per_record: 10.00, geographic_coverage: 75.0, pii_completeness: 94.2, disposition_accuracy: 95.1, avg_freshness_days: 2.8, total_records: 890, coverage_percentage: 75.0 },
  ]
});

const getSampleCoverage = () => ({
  vendors: [
    { id: 1, name: 'Premium Data Corp' },
    { id: 2, name: 'Balanced Solutions' },
    { id: 3, name: 'Budget Checks' },
    { id: 4, name: 'CA Specialist' },
  ],
  jurisdictions: [
    { id: 1, name: 'Cook County', state: 'IL' },
    { id: 2, name: 'Los Angeles', state: 'CA' },
    { id: 3, name: 'New York', state: 'NY' },
    { id: 4, name: 'Miami', state: 'FL' },
    { id: 5, name: 'Houston', state: 'TX' },
    { id: 6, name: 'Phoenix', state: 'AZ' },
    { id: 7, name: 'Seattle', state: 'WA' },
    { id: 8, name: 'Orange County', state: 'CA' },
  ],
  heatmap_data: [
    // Premium Data Corp - High coverage everywhere
    { vendor_id: 1, jurisdiction_id: 1, coverage_percentage: 98, turnaround_hours: 24 },
    { vendor_id: 1, jurisdiction_id: 2, coverage_percentage: 97, turnaround_hours: 28 },
    { vendor_id: 1, jurisdiction_id: 3, coverage_percentage: 99, turnaround_hours: 22 },
    { vendor_id: 1, jurisdiction_id: 4, coverage_percentage: 96, turnaround_hours: 30 },
    { vendor_id: 1, jurisdiction_id: 5, coverage_percentage: 98, turnaround_hours: 26 },
    { vendor_id: 1, jurisdiction_id: 6, coverage_percentage: 97, turnaround_hours: 27 },
    { vendor_id: 1, jurisdiction_id: 7, coverage_percentage: 99, turnaround_hours: 25 },
    { vendor_id: 1, jurisdiction_id: 8, coverage_percentage: 98, turnaround_hours: 26 },
    // Balanced Solutions - Good coverage
    { vendor_id: 2, jurisdiction_id: 1, coverage_percentage: 92, turnaround_hours: 36 },
    { vendor_id: 2, jurisdiction_id: 2, coverage_percentage: 90, turnaround_hours: 38 },
    { vendor_id: 2, jurisdiction_id: 3, coverage_percentage: 94, turnaround_hours: 34 },
    { vendor_id: 2, jurisdiction_id: 4, coverage_percentage: 88, turnaround_hours: 40 },
    { vendor_id: 2, jurisdiction_id: 5, coverage_percentage: 91, turnaround_hours: 37 },
    { vendor_id: 2, jurisdiction_id: 6, coverage_percentage: 89, turnaround_hours: 39 },
    { vendor_id: 2, jurisdiction_id: 7, coverage_percentage: 93, turnaround_hours: 35 },
    { vendor_id: 2, jurisdiction_id: 8, coverage_percentage: 90, turnaround_hours: 38 },
    // Budget Checks - Lower coverage
    { vendor_id: 3, jurisdiction_id: 1, coverage_percentage: 85, turnaround_hours: 48 },
    { vendor_id: 3, jurisdiction_id: 2, coverage_percentage: 82, turnaround_hours: 52 },
    { vendor_id: 3, jurisdiction_id: 3, coverage_percentage: 87, turnaround_hours: 46 },
    { vendor_id: 3, jurisdiction_id: 4, coverage_percentage: 80, turnaround_hours: 54 },
    { vendor_id: 3, jurisdiction_id: 5, coverage_percentage: 83, turnaround_hours: 50 },
    { vendor_id: 3, jurisdiction_id: 6, coverage_percentage: 81, turnaround_hours: 53 },
    { vendor_id: 3, jurisdiction_id: 7, coverage_percentage: 86, turnaround_hours: 47 },
    { vendor_id: 3, jurisdiction_id: 8, coverage_percentage: 84, turnaround_hours: 49 },
    // CA Specialist - Only CA coverage
    { vendor_id: 4, jurisdiction_id: 2, coverage_percentage: 98, turnaround_hours: 26 },
    { vendor_id: 4, jurisdiction_id: 8, coverage_percentage: 95, turnaround_hours: 24 },
  ]
});

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
      setError(null);

      const [vendorsRes, benchmarkRes, coverageRes] = await Promise.all([
        vendorAPI.getVendors(),
        vendorAPI.getBenchmark(),
        comparisonAPI.getCoverageHeatmap(),
      ]);

      // Treat "all zeros" or missing metrics as empty so demo data
      // is always used for portfolio / Vercel deployments.
      const apiVendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : [];
      const hasRealVendorMetrics = apiVendors.some(
        (v) =>
          (typeof v.quality_score === 'number' && v.quality_score > 0) ||
          (typeof v.coverage_percentage === 'number' && v.coverage_percentage > 0) ||
          (typeof v.cost_per_record === 'number' && v.cost_per_record > 0)
      );
      const vendorsData = hasRealVendorMetrics ? apiVendors : getSampleVendors();

      const apiBenchmark = benchmarkRes.data || {};
      const apiBenchmarkVendors = Array.isArray(apiBenchmark.vendors)
        ? apiBenchmark.vendors
        : [];
      const hasRealBenchmarkMetrics = apiBenchmarkVendors.some(
        (v) =>
          (typeof v.quality_score === 'number' && v.quality_score > 0) ||
          (typeof v.geographic_coverage === 'number' && v.geographic_coverage > 0) ||
          (typeof v.coverage_percentage === 'number' && v.coverage_percentage > 0)
      );
      const benchmarkData = hasRealBenchmarkMetrics ? apiBenchmark : getSampleBenchmark();

      const apiCoverage = coverageRes.data || {};
      const apiHeatmap = Array.isArray(apiCoverage.heatmap_data)
        ? apiCoverage.heatmap_data
        : [];
      const hasRealCoverage = apiHeatmap.some(
        (d) => typeof d.coverage_percentage === 'number' && d.coverage_percentage > 0
      );
      const hasCoverageShape =
        Array.isArray(apiCoverage.vendors) &&
        apiCoverage.vendors.length > 0 &&
        Array.isArray(apiCoverage.jurisdictions) &&
        apiCoverage.jurisdictions.length > 0;

      const coverageData =
        hasRealCoverage && hasCoverageShape ? apiCoverage : getSampleCoverage();

      setVendors(vendorsData);
      setBenchmarkData(benchmarkData);
      setCoverageData(coverageData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Use sample data when API fails (for demo/portfolio)
      setVendors(getSampleVendors());
      setBenchmarkData(getSampleBenchmark());
      setCoverageData(getSampleCoverage());
    } finally {
      setLoading(false);
    }
  };

  const handleVendorSelect = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      setSelectedVendor(vendor);
      // Keep the current tab (usually "Vendor Comparison") visible behind the modal
      // so closing the modal never leaves a blank screen.
    }
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
      <div className="min-h-screen">
        {/* Skeleton Header */}
        <header className="fixed top-0 left-0 right-0 z-40 w-full bg-[#07070c]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-64 bg-white/5 rounded animate-pulse mt-2" />
              </div>
              <div className="h-9 w-20 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
        </header>
        <div className="h-[72px]" aria-hidden="true" />

        {/* Skeleton Nav */}
        <div className="mt-4 mb-2 w-full flex justify-center">
          <div className="flex gap-3 px-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-9 w-28 bg-white/[0.06] rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        {/* Skeleton Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
                    <div className="h-7 w-16 bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="w-10 h-10 bg-white/[0.06] rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Top Vendors Skeleton */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-64 bg-white/5 rounded animate-pulse mt-2" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6 h-52">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                        <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                      </div>
                      <div className="h-10 w-14 bg-white/[0.06] rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4">
                      <div className="text-center space-y-2">
                        <div className="h-6 w-16 bg-white/10 rounded animate-pulse mx-auto" />
                        <div className="h-3 w-20 bg-white/5 rounded animate-pulse mx-auto" />
                      </div>
                      <div className="text-center space-y-2">
                        <div className="h-6 w-16 bg-white/10 rounded animate-pulse mx-auto" />
                        <div className="h-3 w-20 bg-white/5 rounded animate-pulse mx-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts Skeleton */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-56 bg-white/5 rounded animate-pulse mt-2" />
              </div>
            </div>
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white/[0.04] rounded-xl border border-white/[0.06] p-4 flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/[0.06] rounded-full animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-72 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-white/[0.06] rounded-full animate-pulse shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </main>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-[#050509] rounded-2xl border border-white/[0.08] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
                    pii_completeness:
                      selectedVendor.pii_completeness ??
                      selectedVendor.metrics_breakdown?.pii_completeness ??
                      0,
                    disposition_accuracy:
                      selectedVendor.disposition_accuracy ??
                      selectedVendor.metrics_breakdown?.disposition_accuracy ??
                      0,
                    avg_freshness_days:
                      selectedVendor.avg_freshness_days ??
                      selectedVendor.metrics_breakdown?.avg_freshness_days ??
                      0,
                    geographic_coverage:
                      selectedVendor.geographic_coverage ??
                      selectedVendor.coverage_percentage ??
                      0,
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
