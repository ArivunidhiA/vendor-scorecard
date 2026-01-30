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
    if (current > previous) return <TrendingUp className="w-4 h-4 text-success-600" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-danger-600" />;
    return <div className="w-4 h-4" />;
  };

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'text-success-600';
    if (current < previous) return 'text-danger-600';
    return 'text-gray-600';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="loading-spinner w-16 h-16 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700 animate-pulse">Loading vendor details...</p>
        </motion.div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                metrics.quality_score >= 90 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                metrics.quality_score >= 80 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                metrics.quality_score >= 70 ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
                'bg-gradient-to-br from-red-500 to-red-600'
              }`}>
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
                <p className="text-sm text-gray-500">{vendor.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
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
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Quality Score</p>
                    <p className={`text-2xl font-bold ${qualityGrade.color}`}>
                      {metrics.quality_score}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              
              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cost per Record</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(vendor.cost_per_record)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-success-600" />
                </div>
              </div>
              
              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Coverage</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPercentage(vendor.coverage_percentage)}
                    </p>
                  </div>
                  <MapPin className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              
              <div className="metric-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Records</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics.total_records.toLocaleString()}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-warning-600" />
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPercentage(metrics.pii_completeness)}
                  </div>
                  <p className="text-sm text-gray-600">PII Completeness</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
                        style={{ width: `${metrics.pii_completeness}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPercentage(metrics.disposition_accuracy)}
                  </div>
                  <p className="text-sm text-gray-600">Disposition Accuracy</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-success-600 h-2 rounded-full" 
                        style={{ width: `${metrics.disposition_accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {metrics.avg_freshness_days.toFixed(1)}
                  </div>
                  <p className="text-sm text-gray-600">Avg Freshness (Days)</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-warning-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (100 - metrics.avg_freshness_days))}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPercentage(metrics.geographic_coverage)}
                  </div>
                  <p className="text-sm text-gray-600">Geographic Coverage</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${metrics.geographic_coverage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            {alerts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-warning-600" />
                        <div>
                          <p className="font-medium text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatDate(alert.triggered_at)}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.severity === 'high' ? 'bg-danger-100 text-danger-800' :
                          alert.severity === 'medium' ? 'bg-warning-100 text-warning-800' :
                          'bg-blue-100 text-blue-800'
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
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Quality Components</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">PII Completeness (40%)</span>
                      <span className={`font-medium ${getStatusColor(metrics.pii_completeness, { high: 90, medium: 75 })}`}>
                        {formatPercentage(metrics.pii_completeness)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Disposition Accuracy (30%)</span>
                      <span className={`font-medium ${getStatusColor(metrics.disposition_accuracy, { high: 90, medium: 75 })}`}>
                        {formatPercentage(metrics.disposition_accuracy)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Data Freshness (20%)</span>
                      <span className={`font-medium ${getStatusColor(100 - metrics.avg_freshness_days, { high: 85, medium: 70 })}`}>
                        {metrics.avg_freshness_days.toFixed(1)} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Geographic Coverage (10%)</span>
                      <span className={`font-medium ${getStatusColor(metrics.geographic_coverage, { high: 90, medium: 75 })}`}>
                        {formatPercentage(metrics.geographic_coverage)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Performance Indicators</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Value Index</span>
                      <span className="font-medium text-primary-600">
                        {(metrics.quality_score / vendor.cost_per_record).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Total Records Processed</span>
                      <span className="font-medium text-gray-900">
                        {metrics.total_records.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Cost Efficiency</span>
                      <span className="font-medium text-success-600">
                        {vendor.cost_per_record <= 8 ? 'High' : vendor.cost_per_record <= 10 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Quality Tier</span>
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
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Jurisdiction Performance</h2>
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
                        <td className="font-medium text-gray-900">{jur.jurisdiction}</td>
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
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quality Trends (Last 90 Days)</h2>
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
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor Alerts</h2>
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'high' ? 'text-danger-600' :
                          alert.severity === 'medium' ? 'text-warning-600' :
                          'text-blue-600'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{alert.title}</p>
                          <p className="text-sm text-gray-600">{alert.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{formatDate(alert.triggered_at)}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          alert.status === 'active' ? 'bg-danger-100 text-danger-800' :
                          alert.status === 'acknowledged' ? 'bg-warning-100 text-warning-800' :
                          'bg-success-100 text-success-800'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-success-600 mx-auto mb-4" />
                  <p className="text-gray-600">No alerts for this vendor</p>
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
