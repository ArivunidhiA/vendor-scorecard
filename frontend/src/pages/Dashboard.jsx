import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Users, RefreshCw } from 'lucide-react';
import { vendorAPI, comparisonAPI, alertAPI } from '../utils/api';
import { formatCurrency, formatPercentage, calculateValueIndex } from '../utils/calculations';
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
      
      // Fetch all needed data in parallel
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
          <p className="text-danger-600">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn-primary mt-4 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const summaryStats = getSummaryStats();
  const topVendors = getTopVendors();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900">Vendor Quality Scorecard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="btn-secondary flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'comparison', label: 'Comparison', icon: TrendingUp },
              { id: 'coverage', label: 'Coverage', icon: Users },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { id: 'analysis', label: 'What-If Analysis', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            {summaryStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="metric-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                      <p className="text-3xl font-bold text-gray-900">{summaryStats.totalVendors}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {summaryStats.avgQualityScore.toFixed(1)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success-600" />
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Cost/Record</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatCurrency(summaryStats.avgCostPerRecord)}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-warning-600" />
                  </div>
                </div>
                
                <div className="metric-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Coverage</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatPercentage(summaryStats.avgCoverage)}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-primary-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Top Vendors */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Vendors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topVendors.map((vendor) => (
                  <VendorScorecard
                    key={vendor.vendor_id}
                    vendor={vendor}
                    metrics={{
                      quality_score: vendor.quality_score,
                      pii_completeness: vendor.pii_completeness || 0,
                      disposition_accuracy: vendor.disposition_accuracy || 0,
                      avg_freshness_days: vendor.avg_freshness_days || 0,
                      geographic_coverage: vendor.geographic_coverage || 0,
                      total_records: vendor.total_records || 0
                    }}
                    showDetails={true}
                  />
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
              <AlertDashboard limit={5} />
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="space-y-8">
            <ComparisonTable
              vendors={benchmarkData?.vendors || []}
              onVendorSelect={handleVendorSelect}
              showFilters={true}
            />
          </div>
        )}

        {/* Coverage Tab */}
        {activeTab === 'coverage' && coverageData && (
          <div className="space-y-8">
            <CoverageHeatmap
              data={coverageData.heatmap_data}
              vendors={coverageData.vendors}
              jurisdictions={coverageData.jurisdictions}
            />
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-8">
            <AlertDashboard />
          </div>
        )}

        {/* What-If Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-8">
            <WhatIfAnalyzer />
          </div>
        )}

        {/* Vendor Detail Modal */}
        {selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedVendor.name} - Details
                  </h3>
                  <button
                    onClick={() => setSelectedVendor(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
