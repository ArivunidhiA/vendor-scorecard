import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, Bell, Settings, Eye, X } from 'lucide-react';
import { alertAPI } from '../utils/api';
import { getRelativeTime, getStatusBadge } from '../utils/calculations';

const AlertDashboard = ({ vendorId = null, limit = 10 }) => {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    fetchAlerts();
    fetchSummary();
  }, [vendorId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = vendorId ? { vendor_id: vendorId, limit } : { limit };
      const response = await alertAPI.getAlerts(params);
      setAlerts(response.data);
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await alertAPI.getAlertSummary(30);
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching alert summary:', err);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await alertAPI.acknowledgeAlert(alertId);
      fetchAlerts(); // Refresh alerts
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await alertAPI.resolveAlert(alertId);
      fetchAlerts(); // Refresh alerts
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-danger-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'medium':
        return <Bell className="w-5 h-5 text-warning-500" />;
      case 'low':
        return <Bell className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-danger-600 bg-danger-50 border-danger-200';
      case 'high': return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'medium': return 'text-warning-500 bg-warning-50 border-warning-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'acknowledged':
        return <Clock className="w-4 h-4 text-warning-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-danger-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
          <p className="text-danger-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && !vendorId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total_alerts}</p>
              </div>
              <Bell className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-success-600">{summary.resolved_alerts}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-primary-600">
                  {summary.resolution_rate.toFixed(1)}%
                </p>
              </div>
              <Settings className="w-8 h-8 text-primary-600" />
            </div>
          </div>
          
          <div className="metric-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-danger-600">
                  {summary.by_severity.critical || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-danger-600" />
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Alerts {vendorId && `- Vendor ${vendorId}`}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Last {alerts.length} alerts
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-success-600 mx-auto mb-4" />
              <p className="text-gray-600">No alerts found</p>
              <p className="text-sm text-gray-500 mt-1">All systems are operating within normal parameters</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-gray-900">{alert.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={getStatusBadge(alert.status)}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <strong>Vendor:</strong> {alert.vendor_name}
                        </span>
                        <span className="flex items-center space-x-1">
                          <strong>Current:</strong> {alert.current_value?.toFixed(1)}
                        </span>
                        <span className="flex items-center space-x-1">
                          <strong>Threshold:</strong> {alert.threshold_value?.toFixed(1)}
                        </span>
                        <span className="flex items-center space-x-1">
                          <strong>Triggered:</strong> {getRelativeTime(alert.triggered_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="btn-secondary flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                    
                    {alert.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="btn-warning flex items-center space-x-1"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Ack</span>
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="btn-success flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Resolve</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedAlert.title}</h4>
                  <p className="text-gray-600">{selectedAlert.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Vendor</p>
                    <p className="text-gray-900">{selectedAlert.vendor_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Severity</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(selectedAlert.severity)}`}>
                      {selectedAlert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Current Value</p>
                    <p className="text-gray-900">{selectedAlert.current_value?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Threshold</p>
                    <p className="text-gray-900">{selectedAlert.threshold_value?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Triggered At</p>
                    <p className="text-gray-900">{new Date(selectedAlert.triggered_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span className={getStatusBadge(selectedAlert.status)}>
                      {selectedAlert.status}
                    </span>
                  </div>
                </div>
                
                {selectedAlert.acknowledged_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Acknowledged At</p>
                    <p className="text-gray-900">{new Date(selectedAlert.acknowledged_at).toLocaleString()}</p>
                  </div>
                )}
                
                {selectedAlert.resolved_at && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Resolved At</p>
                    <p className="text-gray-900">{new Date(selectedAlert.resolved_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="btn-secondary"
                >
                  Close
                </button>
                {selectedAlert.status === 'active' && (
                  <>
                    <button
                      onClick={() => {
                        handleAcknowledge(selectedAlert.id);
                        setSelectedAlert(null);
                      }}
                      className="btn-warning"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => {
                        handleResolve(selectedAlert.id);
                        setSelectedAlert(null);
                      }}
                      className="btn-success"
                    >
                      Resolve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertDashboard;
