import React from 'react';
import { TrendingUp, TrendingDown, Minus, Globe, CheckCircle, Award, Target } from 'lucide-react';
import { getQualityGrade, getStatusColor, formatCurrency, formatPercentage } from '../utils/calculations';

const VendorScorecard = ({ vendor, metrics, showDetails = false, compact = false }) => {
  const qualityGrade = getQualityGrade(metrics.quality_score);
  const qualityClass = metrics.quality_score >= 90 ? 'quality-excellent' : 
                      metrics.quality_score >= 80 ? 'quality-good' : 
                      metrics.quality_score >= 70 ? 'quality-average' : 'quality-poor';
  
  const getTrendIcon = () => {
    if (metrics.quality_score > 85) return <TrendingUp className="w-4 h-4 text-success-400" />;
    if (metrics.quality_score < 75) return <TrendingDown className="w-4 h-4 text-danger-400" />;
    return <Minus className="w-4 h-4 text-white/60" />;
  };

  const MetricRow = ({ label, value, unit, icon: Icon, color, trend }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.06] last:border-0">
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="w-4 h-4 text-white/60" />}
        <span className="text-sm font-medium text-white/80">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {trend && trend}
        <span className={`text-lg font-bold ${color}`}>{unit === 'currency' ? formatCurrency(value) : unit === 'percentage' ? formatPercentage(value) : value}</span>
        {color && (
          <span className={`text-xs ${color}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''}
          </span>
        )}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="bg-white/[0.04] rounded-2xl p-6 sm:p-7 border border-white/[0.06] hover:border-white/[0.08] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{vendor.vendor_name || vendor.name}</h3>
            <p className="text-sm text-white/80 mt-1">{vendor.description || 'Leading vendor in quality performance'}</p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${qualityClass} mb-1`}>
              {metrics.quality_score}
            </div>
            <div className="flex items-center justify-center space-x-1">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${qualityGrade.color}`}>
                {qualityGrade.grade}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {formatCurrency(vendor.cost_per_record)}
            </div>
            <div className="text-sm text-white/80">Cost/Record</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatPercentage(vendor.coverage_percentage)}
            </div>
            <div className="text-sm text-white/80">Coverage</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] hover:border-white/[0.08] transition-colors p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${qualityClass}`}>
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{vendor.name}</h3>
              <p className="text-sm text-white/80">{vendor.description}</p>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className={`text-3xl font-bold ${qualityClass} mb-1`}>
            {metrics.quality_score}
          </div>
          <div className="flex items-center justify-center space-x-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${qualityGrade.color}`}>
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
        <div className="border-t border-white/[0.06] pt-6">
          <h4 className="text-sm font-semibold text-white mb-4">Performance Details</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <div className="text-lg font-bold text-white">
                {formatCurrency(vendor.cost_per_record)}
              </div>
              <div className="text-xs text-white/60">Cost per Record</div>
            </div>
            <div className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <div className="text-lg font-bold text-white">
                {formatPercentage(vendor.coverage_percentage)}
              </div>
              <div className="text-xs text-white/60">Coverage</div>
            </div>
            <div className="text-center p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <div className="text-lg font-bold text-green-400">
                {(metrics.quality_score / vendor.cost_per_record).toFixed(2)}
              </div>
              <div className="text-xs text-white/60">Value Index</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm text-white/60">Total Records Processed</div>
            <div className="text-xl font-bold text-white">
              {metrics.total_records.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Quality Score Breakdown */}
      <div className="mt-6 pt-6 border-t border-white/[0.06]">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Quality Score Formula</span>
          <span>PII (40%) • Accuracy (30%) • Freshness (20%) • Coverage (10%)</span>
        </div>
      </div>
    </div>
  );
};

export default VendorScorecard;
