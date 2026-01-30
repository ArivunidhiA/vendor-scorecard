import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, MapPin, Clock, CheckCircle, AlertTriangle, Shield, Target, Globe, BarChart3, Home, Award } from 'lucide-react';
import { vendorAPI, alertAPI } from '../utils/api';
import { formatCurrency, formatPercentage, formatDate, getQualityGrade, getStatusColor } from '../utils/calculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [trends, setTrends] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchVendorData();
    }
  }, [id]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      
      const [vendorRes, metricsRes, historyRes, jurRes, trendsRes, alertsRes] = await Promise.all([
        vendorAPI.getVendor(id),
        vendorAPI.getVendorScore(id),
        vendorAPI.getVendorHistory(id, 90),
        vendorAPI.getVendorJurisdictions(id),
        vendorAPI.getVendorHistory(id, 30), // Using history for trends
        alertAPI.getVendorAlerts(id, 10)
      ]);
      
      setVendor(vendorRes.data.vendor);
      setMetrics(vendorRes.data.metrics);
      setHistory(historyRes.data.history);
      setJurisdictions(jurRes.data.jurisdictions);
      setTrends(trendsRes.data.history);
      setAlerts(alertsRes.data.alerts);
    } catch (err) {
      setError('Failed to load vendor details');
      console.error('Error fetching vendor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <div className="w-4 h-4" />;
  };

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'text-green-400';
    if (current < previous) return 'text-red-400';
    return 'text-white/60';
  };

  const formatChartData = (data) => {
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      quality_score: item.quality_score,
      pii_completeness: item.pii_completeness,
      disposition_accuracy: item.disposition_accuracy,
      avg_freshness_days: item.avg_freshness_days
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="loading-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-white/80 animate-pulse">Loading vendor details...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary mt-4"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!vendor || !metrics) {
    return null;
  }

  const qualityGrade = getQualityGrade(metrics.quality_score);
  const chartData = formatChartData(history);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#0a0a0d]/90 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                metrics.quality_score >= 90 ? 'bg-green-600/80' :
                metrics.quality_score >= 80 ? 'bg-green-600/70' :
                metrics.quality_score >= 70 ? 'bg-amber-500/80' :
                'bg-red-500/80'
              }`}>
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading text-white">{vendor.name}</h1>
                <p className="text-sm text-white/60">{vendor.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-white/70 hover:text-white text-sm font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
              <div className="text-right">
                <div className={`text-2xl font-bold ${qualityGrade.color}`}>
                  {metrics.quality_score}
                </div>
                <div className={`text-sm font-medium ${qualityGrade.color}`}>
                  {qualityGrade.grade}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#0a0a0d]/50 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'metrics', label: 'Metrics' },
              { id: 'jurisdictions', label: 'Jurisdictions' },
              { id: 'trends', label: 'Trends' },
              { id: 'alerts', label: 'Alerts' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-white/60 hover:text-white hover:border-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content - more vertical space */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Quality Score</p>
                    <p className={`text-2xl font-bold ${qualityGrade.color}`}>
                      {metrics.quality_score}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Cost per Record</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(vendor.cost_per_record)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Coverage</p>
                    <p className="text-2xl font-bold text-white">
                      {formatPercentage(vendor.coverage_percentage)}
                    </p>
                  </div>
                  <MapPin className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/70">Total Records</p>
                    <p className="text-2xl font-bold text-white">
                      {metrics.total_records.toLocaleString()}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
              <h2 className="font-heading text-lg font-semibold text-white mb-4">Quality Metrics Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatPercentage(metrics.pii_completeness)}
                  </div>
                  <p className="text-sm text-white/70">PII Completeness</p>
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${metrics.pii_completeness}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatPercentage(metrics.disposition_accuracy)}
                  </div>
                  <p className="text-sm text-white/70">Disposition Accuracy</p>
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${metrics.disposition_accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {metrics.avg_freshness_days.toFixed(1)}
                  </div>
                  <p className="text-sm text-white/70">Avg Freshness (Days)</p>
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (100 - metrics.avg_freshness_days))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {formatPercentage(metrics.geographic_coverage)}
                  </div>
                  <p className="text-sm text-white/70">Geographic Coverage</p>
                  <div className="mt-2">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${metrics.geographic_coverage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            {alerts.length > 0 && (
              <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Alerts</h2>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="font-medium text-white">{alert.title}</p>
                          <p className="text-sm text-white/70">{alert.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/60">{formatDate(alert.triggered_at)}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                          alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <div className="space-y-12">
            <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Detailed Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-white mb-4">Quality Components</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">PII Completeness (40%)</span>
                      <span className={`font-medium ${getStatusColor(metrics.pii_completeness, { high: 90, medium: 75 })}`}>
                        {formatPercentage(metrics.pii_completeness)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Disposition Accuracy (30%)</span>
                      <span className={`font-medium ${getStatusColor(metrics.disposition_accuracy, { high: 90, medium: 75 })}`}>
                        {formatPercentage(metrics.disposition_accuracy)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Data Freshness (20%)</span>
                      <span className={`font-medium ${getStatusColor(100 - metrics.avg_freshness_days, { high: 85, medium: 70 })}`}>
                        {metrics.avg_freshness_days.toFixed(1)} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Geographic Coverage (10%)</span>
                      <span className={`font-medium ${getStatusColor(metrics.geographic_coverage, { high: 90, medium: 75 })}`}>
                        {formatPercentage(metrics.geographic_coverage)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-white mb-4">Performance Indicators</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Value Index</span>
                      <span className="font-medium text-green-400">
                        {(metrics.quality_score / vendor.cost_per_record).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Total Records Processed</span>
                      <span className="font-medium text-white">
                        {metrics.total_records.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Cost Efficiency</span>
                      <span className="font-medium text-green-400">
                        {vendor.cost_per_record <= 8 ? 'High' : vendor.cost_per_record <= 10 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Quality Tier</span>
                      <span className={`font-medium ${qualityGrade.color}`}>
                        {qualityGrade.grade}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jurisdictions Tab */}
        {activeTab === 'jurisdictions' && (
          <div className="space-y-12">
            <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Jurisdiction Performance</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Jurisdiction</th>
                      <th>State</th>
                      <th>Coverage %</th>
                      <th>Avg Turnaround</th>
                      <th>Records</th>
                      <th>PII Completeness</th>
                      <th>Disposition Accuracy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jurisdictions.map((jur, index) => (
                      <tr key={index}>
                        <td className="font-medium text-white">{jur.jurisdiction}</td>
                        <td>{jur.state}</td>
                        <td>
                          <span className={`font-medium ${getStatusColor(jur.coverage_percentage, { high: 90, medium: 75 })}`}>
                            {formatPercentage(jur.coverage_percentage)}
                          </span>
                        </td>
                        <td>{jur.avg_turnaround_hours.toFixed(1)}h</td>
                        <td>{jur.record_count.toLocaleString()}</td>
                        <td>
                          <span className={`font-medium ${getStatusColor(jur.pii_completeness_rate, { high: 90, medium: 75 })}`}>
                            {formatPercentage(jur.pii_completeness_rate)}
                          </span>
                        </td>
                        <td>
                          <span className={`font-medium ${getStatusColor(jur.disposition_accuracy_rate, { high: 90, medium: 75 })}`}>
                            {formatPercentage(jur.disposition_accuracy_rate)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && chartData.length > 0 && (
          <div className="space-y-12">
            <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quality Trends (Last 90 Days)</h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="quality_score" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Quality Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pii_completeness" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="PII Completeness"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="disposition_accuracy" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Disposition Accuracy"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-12">
            <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Vendor Alerts</h2>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'high' ? 'text-red-400' :
                          alert.severity === 'medium' ? 'text-amber-400' :
                          'text-blue-400'
                        }`} />
                        <div>
                          <p className="font-medium text-white">{alert.title}</p>
                          <p className="text-sm text-white/70">{alert.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/60">{formatDate(alert.triggered_at)}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.status === 'active' ? 'bg-red-500/20 text-red-300' :
                          alert.status === 'acknowledged' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-green-500/20 text-green-300'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <p className="text-white/70">No alerts for this vendor</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetail;
