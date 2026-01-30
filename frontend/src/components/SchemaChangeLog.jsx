import React, { useState, useEffect } from 'react';
import { GitBranch, AlertTriangle, Calendar, FileText, Filter, Search } from 'lucide-react';
import { analysisAPI } from '../utils/api';
import { formatDate, getRelativeTime } from '../utils/calculations';

const SchemaChangeLog = ({ vendorId = null }) => {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    vendorId: vendorId || '',
    days: 90,
    search: ''
  });
  const [selectedChange, setSelectedChange] = useState(null);
  const [impactData, setImpactData] = useState(null);

  useEffect(() => {
    fetchChanges();
  }, [filters.vendorId, filters.days]);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      const params = {
        days: filters.days
      };
      
      if (filters.vendorId) {
        params.vendor_id = filters.vendorId;
      }
      
      const response = await analysisAPI.getSchemaChanges(params);
      setChanges(response.data.changes);
    } catch (err) {
      setError('Failed to fetch schema changes');
      console.error('Error fetching schema changes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChangeImpact = async (changeId) => {
    try {
      const response = await analysisAPI.getChangeImpact(changeId);
      setImpactData(response.data);
    } catch (err) {
      console.error('Error fetching change impact:', err);
    }
  };

  const handleViewImpact = (change) => {
    setSelectedChange(change);
    fetchChangeImpact(change.id);
  };

  const getChangeTypeColor = (field) => {
    const colors = {
      'disposition_type': 'text-purple-600 bg-purple-50 border-purple-200',
      'pii_fields': 'text-blue-600 bg-blue-50 border-blue-200',
      'filing_date': 'text-green-600 bg-green-50 border-green-200',
      'default': 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[field] || colors.default;
  };

  const getImpactLevel = (recordsAffected) => {
    if (recordsAffected >= 500) return { level: 'High', color: 'text-danger-600 bg-danger-50 border-danger-200' };
    if (recordsAffected >= 100) return { level: 'Medium', color: 'text-warning-600 bg-warning-50 border-warning-200' };
    return { level: 'Low', color: 'text-success-600 bg-success-50 border-success-200' };
  };

  const filteredChanges = changes.filter(change => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        change.vendor_name.toLowerCase().includes(searchLower) ||
        change.change_description.toLowerCase().includes(searchLower) ||
        change.field_affected.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

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
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Schema Change Log</h2>
          </div>
          <div className="text-sm text-gray-600">
            {filteredChanges.length} changes found
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={filters.days}
              onChange={(e) => setFilters(prev => ({ ...prev, days: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 6 months</option>
              <option value={365}>Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search changes..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="md:col-span-2 flex items-end">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Filtering by: {filters.days} days{filters.search && ` • "${filters.search}"`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Changes List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Field Affected</th>
                <th>Change Description</th>
                <th>Records Affected</th>
                <th>Impact Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChanges.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No schema changes found</p>
                    <p className="text-sm text-gray-500 mt-1">No vendor schema changes detected in the selected period</p>
                  </td>
                </tr>
              ) : (
                filteredChanges.map((change) => {
                  const impact = getImpactLevel(change.records_affected);
                  return (
                    <tr key={change.id} className="hover:bg-gray-50">
                      <td>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {formatDate(change.change_date)}
                          </div>
                          <div className="text-gray-500">
                            {getRelativeTime(change.change_date)}
                          </div>
                        </div>
                      </td>
                      <td className="font-medium text-gray-900">
                        {change.vendor_name}
                      </td>
                      <td>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getChangeTypeColor(change.field_affected)}`}>
                          {change.field_affected.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="max-w-md">
                        <div className="text-sm text-gray-900">
                          {change.change_description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {change.old_value} → {change.new_value}
                        </div>
                      </td>
                      <td>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">
                            {change.records_affected.toLocaleString()}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${impact.color}`}>
                          {impact.level}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewImpact(change)}
                          className="btn-primary text-sm"
                        >
                          View Impact
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Details Modal */}
      {selectedChange && impactData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Change Impact Assessment</h3>
                <button
                  onClick={() => {
                    setSelectedChange(null);
                    setImpactData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Change Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Change Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Vendor:</span>
                    <span className="ml-2 text-gray-900">{impactData.schema_change.vendor_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <span className="ml-2 text-gray-900">{formatDate(impactData.schema_change.change_date)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Field:</span>
                    <span className="ml-2 text-gray-900">{impactData.schema_change.field_affected}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Records Affected:</span>
                    <span className="ml-2 text-gray-900">{impactData.schema_change.records_affected.toLocaleString()}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="mt-1 text-gray-900">{impactData.schema_change.change_description}</p>
                </div>
                <div className="mt-3">
                  <span className="font-medium text-gray-700">Change:</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-200 rounded text-sm">{impactData.schema_change.old_value}</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm">{impactData.schema_change.new_value}</span>
                  </div>
                </div>
              </div>

              {/* Impact Assessment */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-3">Impact Assessment</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Total Records Affected:</span>
                    <span className="ml-2 text-blue-900">{impactData.impact_assessment.total_records_affected.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Sample Records Analyzed:</span>
                    <span className="ml-2 text-blue-900">{impactData.impact_assessment.sample_records_analyzed}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-700">Data Quality Impact:</span>
                    <span className="ml-2 text-blue-900 capitalize">{impactData.impact_assessment.data_quality_impact}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-yellow-900 mb-3">Recommended Actions</h4>
                <ul className="space-y-2 text-sm text-yellow-800">
                  {impactData.impact_assessment.recommended_actions.map((action, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-yellow-600 mt-1">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Affected Records Sample */}
              {impactData.affected_records_sample.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Affected Records Sample</h4>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Case Number</th>
                          <th>Defendant</th>
                          <th>Disposition</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {impactData.affected_records_sample.map((record, index) => (
                          <tr key={index}>
                            <td className="font-medium">{record.case_number}</td>
                            <td>{record.defendant_name}</td>
                            <td>
                              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                {record.disposition_type || 'N/A'}
                              </span>
                            </td>
                            <td className="text-sm text-gray-600">
                              {formatDate(record.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedChange(null);
                    setImpactData(null);
                  }}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemaChangeLog;
