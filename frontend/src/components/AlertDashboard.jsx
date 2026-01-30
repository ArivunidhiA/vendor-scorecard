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
        return <Bell className="w-5 h-5 text-white/60" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'medium': return 'text-amber-300 bg-amber-500/15 border-amber-500/20';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-white/80 bg-white/5 border-white/20';
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
      <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-8 h-8"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-danger-600 mx-auto mb-4" />
          <p className="text-danger-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      {summary && !vendorId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70 mb-1.5">Total Alerts</p>
                <p className="text-2xl font-semibold text-white tabular-nums">{summary.total_alerts}</p>
              </div>
              <div className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-white/70" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70 mb-1.5">Resolved</p>
                <p className="text-2xl font-semibold text-green-500 tabular-nums">{summary.resolved_alerts}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70 mb-1.5">Resolution Rate</p>
                <p className="text-2xl font-semibold text-green-500 tabular-nums">
                  {summary.resolution_rate.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white/70" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70 mb-1.5">Critical Alerts</p>
                <p className="text-2xl font-semibold text-red-400 tabular-nums">
                  {summary.by_severity.critical || 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Recent Alerts {vendorId && `- Vendor ${vendorId}`}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-white/80">
                Last {alerts.length} alerts
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-lg font-medium text-white mb-2">No alerts found</p>
              <p className="text-sm text-white/80">All systems are operating within normal parameters</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className="p-6 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="mt-2">
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadge(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-white/80 mb-4 text-base">{alert.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-white/80">
                        <span className="flex items-center space-x-2">
                          <strong>Vendor:</strong> {alert.vendor_name}
                        </span>
                        <span className="flex items-center space-x-2">
                          <strong>Current:</strong> {alert.current_value?.toFixed(1)}
                        </span>
                        <span className="flex items-center space-x-2">
                          <strong>Threshold:</strong> {alert.threshold_value?.toFixed(1)}
                        </span>
                        <span className="flex items-center space-x-2">
                          <strong>Triggered:</strong> {getRelativeTime(alert.triggered_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 ml-6">
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="btn-secondary flex items-center space-x-2 px-4 py-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>
                    
                    {alert.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="btn-warning flex items-center space-x-2 px-4 py-2"
                        >
                          <Clock className="w-4 h-4" />
                          <span>Ack</span>
                        </button>
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="btn-success flex items-center space-x-2 px-4 py-2"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={() => setSelectedAlert(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Alert details"
        >
          <div
            className="bg-black rounded-2xl border border-white/[0.12] max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Alert Details</h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-white mb-2">{selectedAlert.title}</h4>
                  <p className="text-white/80">{selectedAlert.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-white/80">Vendor</p>
                    <p className="text-white">{selectedAlert.vendor_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Severity</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(selectedAlert.severity)}`}>
                      {selectedAlert.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Current Value</p>
                    <p className="text-white">{selectedAlert.current_value?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Threshold</p>
                    <p className="text-white">{selectedAlert.threshold_value?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Triggered At</p>
                    <p className="text-white">{new Date(selectedAlert.triggered_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">Status</p>
                    <span className={getStatusBadge(selectedAlert.status)}>
                      {selectedAlert.status}
                    </span>
                  </div>
                </div>
                
                {selectedAlert.acknowledged_at && (
                  <div>
                    <p className="text-sm font-medium text-white/80">Acknowledged At</p>
                    <p className="text-white">{new Date(selectedAlert.acknowledged_at).toLocaleString()}</p>
                  </div>
                )}
                
                {selectedAlert.resolved_at && (
                  <div>
                    <p className="text-sm font-medium text-white/80">Resolved At</p>
                    <p className="text-white">{new Date(selectedAlert.resolved_at).toLocaleString()}</p>
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
