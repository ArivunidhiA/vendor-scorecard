import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, Download, Eye } from 'lucide-react';
import { formatCurrency, formatPercentage, calculateValueIndex, getQualityGrade, sortVendors, filterVendors, exportToCSV } from '../utils/calculations';

const ComparisonTable = ({ vendors, onVendorSelect, showFilters = true }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'quality_score', direction: 'desc' });
  const [filters, setFilters] = useState({
    minQuality: '',
    maxCost: '',
    minCoverage: '',
    jurisdictions: []
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const availableJurisdictions = useMemo(() => {
    const jurSet = new Set();
    vendors.forEach(vendor => {
      if (vendor.jurisdiction_performance) {
        vendor.jurisdiction_performance.forEach(jur => {
          jurSet.add(jur.jurisdiction);
        });
      }
    });
    return Array.from(jurSet).sort();
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    return filterVendors(vendors, filters);
  }, [vendors, filters]);

  const sortedVendors = useMemo(() => {
    return sortVendors(filteredVendors, sortConfig.key, sortConfig.direction);
  }, [filteredVendors, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleJurisdictionToggle = (jurisdiction) => {
    setFilters(prev => ({
      ...prev,
      jurisdictions: prev.jurisdictions.includes(jurisdiction)
        ? prev.jurisdictions.filter(j => j !== jurisdiction)
        : [...prev.jurisdictions, jurisdiction]
    }));
  };

  const clearFilters = () => {
    setFilters({
      minQuality: '',
      maxCost: '',
      minCoverage: '',
      jurisdictions: []
    });
  };

  const exportData = () => {
    const exportData = sortedVendors.map(vendor => ({
      'Vendor Name': vendor.vendor_name,
      'Quality Score': vendor.quality_score,
      'Cost per Record': vendor.cost_per_record,
      'Coverage %': vendor.coverage_percentage,
      'Value Index': calculateValueIndex(vendor.quality_score, vendor.cost_per_record),
      'PII Completeness': vendor.metrics_breakdown?.pii_completeness || 0,
      'Disposition Accuracy': vendor.metrics_breakdown?.disposition_accuracy || 0,
      'Avg Freshness Days': vendor.metrics_breakdown?.avg_freshness_days || 0,
      'Total Records': vendor.total_records || 0
    }));
    
    exportToCSV(exportData, 'vendor-comparison.csv');
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-green-500" />
      : <ArrowDown className="w-4 h-4 text-green-500" />;
  };

  const getQualityColor = (score) => {
    const grade = getQualityGrade(score);
    return grade.color;
  };

  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Vendor Comparison</h2>
            <p className="text-sm text-white/80">
              Showing {sortedVendors.length} of {vendors.length} vendors
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {showFilters && (
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {Object.values(filters).some(v => v && (typeof v === 'number' ? v > 0 : v.length > 0)) && (
                  <span className="bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                    {Object.values(filters).filter(v => v && (typeof v === 'number' ? v > 0 : v.length > 0)).length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={exportData}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && showFilterPanel && (
        <div className="px-6 py-4 bg-white/[0.03] border-b border-white/[0.06]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Min Quality Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minQuality}
                onChange={(e) => handleFilterChange('minQuality', parseFloat(e.target.value) || '')}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:ring-green-500 focus:border-green-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Max Cost per Record
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.maxCost}
                onChange={(e) => handleFilterChange('maxCost', parseFloat(e.target.value) || '')}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Min Coverage %
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minCoverage}
                onChange={(e) => handleFilterChange('minCoverage', parseFloat(e.target.value) || '')}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:ring-green-500 focus:border-green-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Jurisdictions
              </label>
              <select
                multiple
                value={filters.jurisdictions}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setFilters(prev => ({ ...prev, jurisdictions: selected }));
                }}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:ring-green-500 focus:border-green-500"
                size={3}
              >
                {availableJurisdictions.map(jur => (
                  <option key={jur} value={jur}>{jur}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="cursor-pointer hover:bg-white/10"
                onClick={() => handleSort('vendor_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Vendor</span>
                  {getSortIcon('vendor_name')}
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-white/10"
                onClick={() => handleSort('quality_score')}
              >
                <div className="flex items-center space-x-1">
                  <span>Quality Score</span>
                  {getSortIcon('quality_score')}
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-white/10"
                onClick={() => handleSort('cost_per_record')}
              >
                <div className="flex items-center space-x-1">
                  <span>Cost/Record</span>
                  {getSortIcon('cost_per_record')}
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-white/10"
                onClick={() => handleSort('coverage_percentage')}
              >
                <div className="flex items-center space-x-1">
                  <span>Coverage %</span>
                  {getSortIcon('coverage_percentage')}
                </div>
              </th>
              <th 
                className="cursor-pointer hover:bg-white/10"
                onClick={() => handleSort('value_index')}
              >
                <div className="flex items-center space-x-1">
                  <span>Value Index</span>
                  {getSortIcon('value_index')}
                </div>
              </th>
              <th>PII Completeness</th>
              <th>Disposition Accuracy</th>
              <th>Total Records</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedVendors.map((vendor) => (
              <tr key={vendor.vendor_id} className="hover:bg-white/5">
                <td className="font-medium text-white">
                  <div>
                    <div>{vendor.vendor_name}</div>
                    <div className="text-xs text-white/60">{vendor.description}</div>
                  </div>
                </td>
                <td>
                  <div className={`font-semibold ${getQualityColor(vendor.quality_score)}`}>
                    {vendor.quality_score || 'N/A'}
                  </div>
                  <div className={`text-xs ${getQualityColor(vendor.quality_score)}`}>
                    {vendor.quality_score ? getQualityGrade(vendor.quality_score).grade : 'N/A'}
                  </div>
                </td>
                <td className="font-medium text-white">
                  {vendor.cost_per_record ? formatCurrency(vendor.cost_per_record) : 'N/A'}
                </td>
                <td>
                  <div className="font-medium text-white">
                    {vendor.coverage_percentage ? formatPercentage(vendor.coverage_percentage) : 'N/A'}
                  </div>
                </td>
                <td>
                  <div className="font-medium text-white">
                    {vendor.quality_score && vendor.cost_per_record ? calculateValueIndex(vendor.quality_score, vendor.cost_per_record) : 'N/A'}
                  </div>
                </td>
                <td>
                  <div className="font-medium text-white">
                    {vendor.metrics_breakdown?.pii_completeness ? formatPercentage(vendor.metrics_breakdown.pii_completeness) : 'N/A'}
                  </div>
                </td>
                <td>
                  <div className="font-medium text-white">
                    {vendor.metrics_breakdown?.disposition_accuracy ? formatPercentage(vendor.metrics_breakdown.disposition_accuracy) : 'N/A'}
                  </div>
                </td>
                <td className="text-white">
                  {vendor.total_records ? vendor.total_records.toLocaleString() : 'N/A'}
                </td>
                <td>
                  <button
                    onClick={() => onVendorSelect && onVendorSelect(vendor.vendor_id)}
                    className="btn-primary flex items-center space-x-2 px-4 py-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedVendors.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/80">No vendors match the current filters.</p>
          <button
            onClick={clearFilters}
            className="btn-primary mt-2"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;
