import React from 'react';
import { TrendingUp, TrendingDown, Minus, Globe, CheckCircle, Award, Target } from 'lucide-react';
import { getQualityGrade, getStatusColor, formatCurrency, formatPercentage } from '../utils/calculations';

const VendorScorecard = ({ vendor, metrics, showDetails = false, compact = false }) => {
  const qualityGrade = getQualityGrade(metrics.quality_score);
  const qualityClass = metrics.quality_score >= 90 ? 'quality-excellent' : 
                      metrics.quality_score >= 80 ? 'quality-good' : 
                      metrics.quality_score >= 70 ? 'quality-average' : 'quality-poor';
  
  const getTrendIcon = () => {
    if (metrics.quality_score > 85) return <TrendingUp className="w-4 h-4 text-success-600" />;
    if (metrics.quality_score < 75) return <TrendingDown className="w-4 h-4 text-danger-600" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const MetricRow = ({ label, value, unit, icon: Icon, color, trend }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {trend && trend}
        <span className={`text-sm font-semibold ${color}`}>
          {unit === 'currency' ? formatCurrency(value) : 
           unit === 'percentage' ? formatPercentage(value) : 
           value}
        </span>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="card hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{vendor.description}</p>
          </div>
          <div className="text-right">
            <div className={`metric-value ${qualityClass}`}>
              {metrics.quality_score}
            </div>
            <div className="flex items-center space-x-1 mt-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${qualityGrade.color}`}>
                {qualityGrade.grade}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(vendor.cost_per_record)}
            </div>
            <div className="text-xs text-gray-500">Cost/Record</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {formatPercentage(vendor.coverage_percentage)}
            </div>
            <div className="text-xs text-gray-500">Coverage</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${qualityClass}`}>
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
              <p className="text-sm text-gray-500">{vendor.description}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`metric-value ${qualityClass}`}>
            {metrics.quality_score}
          </div>
          <div className="flex items-center justify-end space-x-2 mt-2">
            {getTrendIcon()}
            <span className={`status-badge ${qualityClass}`}>
              {qualityGrade.grade}
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-1 mb-6">
        <MetricRow
          label="PII Completeness"
          value={metrics.pii_completeness}
          unit="percentage"
          icon={CheckCircle}
          color={getStatusColor(metrics.pii_completeness, { high: 90, medium: 75 })}
        />
        <MetricRow
          label="Disposition Accuracy"
          value={metrics.disposition_accuracy}
          unit="percentage"
          icon={Target}
          color={getStatusColor(metrics.disposition_accuracy, { high: 90, medium: 75 })}
        />
        <MetricRow
          label="Data Freshness"
          value={metrics.avg_freshness_days}
          unit="days"
          icon={TrendingDown}
          color={getStatusColor(100 - metrics.avg_freshness_days, { high: 85, medium: 70 })}
        />
        <MetricRow
          label="Geographic Coverage"
          value={metrics.geographic_coverage}
          unit="percentage"
          icon={Globe}
          color={getStatusColor(metrics.geographic_coverage, { high: 90, medium: 75 })}
        />
      </div>

      {/* Details Section */}
      {showDetails && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Performance Details</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {formatCurrency(vendor.cost_per_record)}
              </div>
              <div className="text-xs text-gray-500">Cost per Record</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {formatPercentage(vendor.coverage_percentage)}
              </div>
              <div className="text-xs text-gray-500">Coverage</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-primary-600">
                {(metrics.quality_score / vendor.cost_per_record).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Value Index</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-500">Total Records Processed</div>
            <div className="text-xl font-bold text-gray-900">
              {metrics.total_records.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Quality Score Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Quality Score Formula</span>
          <span>PII (40%) • Accuracy (30%) • Freshness (20%) • Coverage (10%)</span>
        </div>
      </div>
    </div>
  );
};

export default VendorScorecard;
