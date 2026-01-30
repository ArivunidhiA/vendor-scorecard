import React from 'react';
import { TrendingUp, TrendingDown, Minus, DollarSign, Globe, CheckCircle } from 'lucide-react';
import { getQualityGrade, getStatusColor, formatCurrency, formatPercentage } from '../utils/calculations';

const VendorScorecard = ({ vendor, metrics, showDetails = false }) => {
  const qualityGrade = getQualityGrade(metrics.quality_score);
  const trendIcon = metrics.quality_score > 85 ? TrendingUp : metrics.quality_score < 75 ? TrendingDown : Minus;
  const trendColor = metrics.quality_score > 85 ? 'text-success-600' : metrics.quality_score < 75 ? 'text-danger-600' : 'text-gray-600';

  const MetricCard = ({ title, value, unit, icon: Icon, color = 'text-gray-600' }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
        <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
      <div className="text-right">
        <span className={`text-lg font-semibold ${color}`}>
          {unit === 'currency' ? formatCurrency(value) : unit === 'percentage' ? formatPercentage(value) : value}
        </span>
        {unit && unit !== 'currency' && unit !== 'percentage' && (
          <span className="text-xs text-gray-500 ml-1">{unit}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
          <p className="text-sm text-gray-600">{vendor.description}</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${qualityGrade.color}`}>
            {metrics.quality_score}
          </div>
          <div className="flex items-center justify-end space-x-1 mt-1">
            <trendIcon className={`w-4 h-4 ${trendColor}`} />
            <span className={`text-sm font-medium ${qualityGrade.color}`}>
              {qualityGrade.grade}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricCard
          title="PII Completeness"
          value={metrics.pii_completeness}
          unit="percentage"
          icon={CheckCircle}
          color={getStatusColor(metrics.pii_completeness)}
        />
        <MetricCard
          title="Disposition Accuracy"
          value={metrics.disposition_accuracy}
          unit="percentage"
          icon={CheckCircle}
          color={getStatusColor(metrics.disposition_accuracy)}
        />
        <MetricCard
          title="Data Freshness"
          value={metrics.avg_freshness_days}
          unit="days"
          icon={TrendingDown}
          color={getStatusColor(100 - metrics.avg_freshness_days, { high: 85, medium: 70 })}
        />
        <MetricCard
          title="Geographic Coverage"
          value={metrics.geographic_coverage}
          unit="percentage"
          icon={Globe}
          color={getStatusColor(metrics.geographic_coverage)}
        />
      </div>

      {showDetails && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Cost per Record</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(vendor.cost_per_record)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Total Records</span>
            <span className="text-lg font-semibold text-gray-900">
              {metrics.total_records.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Value Index</span>
            <span className="text-lg font-semibold text-primary-600">
              {(metrics.quality_score / vendor.cost_per_record).toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Quality Score Calculation</span>
          <span>PII (40%) • Disp (30%) • Fresh (20%) • Cov (10%)</span>
        </div>
      </div>
    </div>
  );
};

export default VendorScorecard;
