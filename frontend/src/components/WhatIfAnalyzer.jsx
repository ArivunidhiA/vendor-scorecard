import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Calculator } from 'lucide-react';
import { vendorAPI, comparisonAPI } from '../utils/api';
import { formatCurrency, formatPercentage, calculateROI, calculatePaybackPeriod, getRiskLevel } from '../utils/calculations';

const WhatIfAnalyzer = () => {
  const [vendors, setVendors] = useState([]);
  const [currentVendor, setCurrentVendor] = useState('');
  const [newVendor, setNewVendor] = useState('');
  const [annualVolume, setAnnualVolume] = useState(10000);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await vendorAPI.getVendors();
      setVendors(response.data);
    } catch (err) {
      setError('Failed to fetch vendors');
      console.error('Error fetching vendors:', err);
    }
  };

  const runAnalysis = async () => {
    if (!currentVendor || !newVendor || currentVendor === newVendor) {
      setError('Please select different vendors for comparison');
      return;
    }

    if (annualVolume <= 0) {
      setError('Annual volume must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await comparisonAPI.whatIfAnalysis({
        current_vendor_id: parseInt(currentVendor),
        new_vendor_id: parseInt(newVendor),
        annual_volume: annualVolume,
        assumptions: {
          roi_period_months: 12
        }
      });
      
      setAnalysis(response.data);
    } catch (err) {
      console.error('Error running analysis:', err);
      
      // Handle different types of errors
      if (err.response?.status === 404) {
        setError('Analysis endpoint not found. Please check if the backend service is running.');
        // Provide fallback analysis
        provideFallbackAnalysis();
      } else if (err.response?.status === 500) {
        setError('Server error occurred while running analysis. Using fallback calculations.');
        // Provide fallback analysis
        provideFallbackAnalysis();
      } else if (err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the analysis service. Using fallback calculations.');
        // Provide fallback analysis
        provideFallbackAnalysis();
      } else {
        setError('Failed to run analysis. Using fallback calculations.');
        // Provide fallback analysis
        provideFallbackAnalysis();
      }
    } finally {
      setLoading(false);
    }
  };

  const provideFallbackAnalysis = () => {
    // GET /api/vendors returns { id, name, ... }; benchmark may use vendor_id. Support both.
    const vendorId = (v) => v.vendor_id != null ? v.vendor_id : v.id;
    const currentVendorData = vendors.find(v => vendorId(v) === parseInt(currentVendor, 10));
    const newVendorData = vendors.find(v => vendorId(v) === parseInt(newVendor, 10));

    if (!currentVendorData || !newVendorData) {
      setError('Vendor data not available for fallback analysis. Please ensure vendors are loaded and try again.');
      return;
    }

    const currentCost = currentVendorData.cost_per_record || 0;
    const newCost = newVendorData.cost_per_record || 0;
    const currentQuality = currentVendorData.quality_score || 0;
    const newQuality = newVendorData.quality_score || 0;
    const currentCoverage = currentVendorData.coverage_percentage ?? 0;
    const newCoverage = newVendorData.coverage_percentage ?? 0;

    const costDifference = (currentCost - newCost) * annualVolume;
    const qualityDelta = newQuality - currentQuality;
    const coverageDelta = newCoverage - currentCoverage;
    const savings = Math.abs(costDifference);
    const roi = calculateROI(savings, annualVolume * Math.max(currentCost, newCost));
    const paybackPeriod = calculatePaybackPeriod(savings, annualVolume * Math.max(currentCost, newCost));
    const riskFactors = qualityDelta < 0 ? ['Quality degradation risk'] : [];

    const fallbackAnalysis = {
      comparison: {
        cost_difference: costDifference,
        quality_improvement: qualityDelta,
        roi_percentage: roi,
        payback_period_months: paybackPeriod,
        annual_savings: savings,
        implementation_cost: annualVolume * 0.1,
        risk_factors: riskFactors,
        recommendations: qualityDelta > 0
          ? ['Switch to new vendor for better quality', 'Negotiate better rates']
          : ['Stay with current vendor', 'Request quality improvements from new vendor']
      },
      quality_impact: {
        quality_delta: qualityDelta
      },
      coverage_impact: {
        current_coverage: currentCoverage,
        new_coverage: newCoverage,
        coverage_delta: coverageDelta,
        coverage_comparison: []
      },
      roi_analysis: {
        annual_roi_percentage: roi,
        payback_period_months: paybackPeriod
      },
      risk_assessment: {
        risk_level: riskFactors.length >= 2 ? 'high' : riskFactors.length === 1 ? 'medium' : 'low',
        risk_factors: riskFactors
      },
      assumptions: {
        roi_period_months: 12,
        implementation_cost_per_record: 0.1
      }
    };

    setError(null);
    setAnalysis(fallbackAnalysis);
  };

  const getImpactIcon = (value, isPositive = true) => {
    if (value > 0) {
      return isPositive ? (
        <TrendingUp className="w-5 h-5 text-success-600" />
      ) : (
        <TrendingDown className="w-5 h-5 text-danger-600" />
      );
    } else if (value < 0) {
      return isPositive ? (
        <TrendingDown className="w-5 h-5 text-danger-600" />
      ) : (
        <TrendingUp className="w-5 h-5 text-success-600" />
      );
    }
    return <div className="w-5 h-5" />;
  };

  const getImpactColor = (value, isPositive = true) => {
    if (value > 0) {
      return isPositive ? 'text-success-600' : 'text-danger-600';
    } else if (value < 0) {
      return isPositive ? 'text-danger-600' : 'text-success-600';
    }
    return 'text-white/80';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calculator className="w-6 h-6 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">What-If Analysis</h2>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Current Vendor
            </label>
            <select
              value={currentVendor}
              onChange={(e) => setCurrentVendor(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-white/5 border border-white/20 rounded-md focus:ring-green-500 focus:border-green-500 text-white appearance-none bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}
            >
              <option value="" className="text-gray-400">Select current vendor...</option>
              {vendors.map(vendor => (
                <option key={vendor.vendor_id || vendor.id} value={vendor.vendor_id || vendor.id} className="text-white">
                  {vendor.vendor_name || vendor.name} ({formatCurrency(vendor.cost_per_record)}/record)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              New Vendor
            </label>
            <select
              value={newVendor}
              onChange={(e) => setNewVendor(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-white/5 border border-white/20 rounded-md focus:ring-green-500 focus:border-green-500 text-white appearance-none bg-[length:16px_16px] bg-[right_0.75rem_center] bg-no-repeat"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")" }}
            >
              <option value="" className="text-gray-400">Select new vendor...</option>
              {vendors.filter(v => (v.vendor_id || v.id).toString() !== currentVendor).map(vendor => (
                <option key={vendor.vendor_id || vendor.id} value={vendor.vendor_id || vendor.id} className="text-white">
                  {vendor.vendor_name || vendor.name} ({formatCurrency(vendor.cost_per_record)}/record)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Annual Volume
            </label>
            <input
              type="number"
              min="1000"
              max="10000000"
              step="1000"
              value={annualVolume}
              onChange={(e) => setAnnualVolume(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md focus:ring-green-500 focus:border-green-500 text-white"
              placeholder="10000"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={runAnalysis}
              disabled={loading || !currentVendor || !newVendor}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg card">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Financial Impact */}
          <div className="card p-6">
            <h3 className="font-heading text-2xl font-bold text-white mb-6">Financial impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">Current Annual Cost</p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(analysis.comparison?.annual_savings || 0)}
                </p>
              </div>
              <div className="text-center p-6">
                <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">Projected Savings</p>
                <p className="text-3xl font-bold text-green-400">
                  {formatCurrency(analysis.comparison?.cost_difference || 0)}
                </p>
              </div>
              <div className="text-center p-6">
                <p className="text-sm text-white/60 mb-2 uppercase tracking-wider">ROI</p>
                <p className="text-3xl font-bold text-purple-400">
                  {analysis.comparison?.roi_percentage?.toFixed(1) || 0}%
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-white/80 mb-2">Quality Delta</p>
                <div className="flex items-center justify-center space-x-2">
                  {getImpactIcon(analysis.quality_impact.quality_delta)}
                  <p className={`text-2xl font-bold ${getImpactColor(analysis.quality_impact.quality_delta)}`}>
                    {analysis.quality_impact.quality_delta > 0 ? '+' : ''}{analysis.quality_impact.quality_delta.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Impact */}
          <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Coverage Impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm font-medium text-white/80 mb-2">Current Coverage</p>
                <p className="text-2xl font-bold text-white">
                  {formatPercentage(analysis.coverage_impact.current_coverage)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-white/80 mb-2">New Coverage</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatPercentage(analysis.coverage_impact.new_coverage)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-white/80 mb-2">Coverage Delta</p>
                <div className="flex items-center justify-center space-x-2">
                  {getImpactIcon(analysis.coverage_impact.coverage_delta)}
                  <p className={`text-2xl font-bold ${getImpactColor(analysis.coverage_impact.coverage_delta)}`}>
                    {analysis.coverage_impact.coverage_delta > 0 ? '+' : ''}{formatPercentage(analysis.coverage_impact.coverage_delta)}
                  </p>
                </div>
              </div>
            </div>

            {/* Coverage Comparison Table */}
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Jurisdiction</th>
                    <th>Current Coverage</th>
                    <th>New Coverage</th>
                    <th>Delta</th>
                    <th>Turnaround Change</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.coverage_impact.coverage_comparison.map((jur, index) => (
                    <tr key={index}>
                      <td className="font-medium">{jur.jurisdiction}</td>
                      <td>{formatPercentage(jur.current_coverage)}</td>
                      <td>{formatPercentage(jur.new_coverage)}</td>
                      <td>
                        <div className="flex items-center space-x-1">
                          {getImpactIcon(jur.coverage_delta)}
                          <span className={getImpactColor(jur.coverage_delta)}>
                            {jur.coverage_delta > 0 ? '+' : ''}{formatPercentage(jur.coverage_delta)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-1">
                          {getImpactIcon(jur.turnaround_delta, false)}
                          <span className={getImpactColor(jur.turnaround_delta, false)}>
                            {jur.turnaround_delta > 0 ? '+' : ''}{jur.turnaround_delta.toFixed(1)}h
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROI Analysis */}
          <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">ROI Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/80">Annual ROI</span>
                  <span className="text-lg font-semibold text-success-600">
                    {formatPercentage(analysis.roi_analysis.annual_roi_percentage)}
                  </span>
                </div>
              </div>
              
              {analysis.roi_analysis.payback_period_months && (
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/80">Payback Period</span>
                    <span className="text-lg font-semibold text-green-400">
                      {analysis.roi_analysis.payback_period_months.toFixed(1)} months
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm font-medium text-white/80">Risk Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                getRiskLevel(analysis.risk_assessment.risk_factors).level === 'high' ? 'text-red-400 bg-red-500/20' :
                getRiskLevel(analysis.risk_assessment.risk_factors).level === 'medium' ? 'text-amber-400 bg-amber-500/20' :
                'text-green-400 bg-green-500/20'
              }`}>
                {analysis.risk_assessment.risk_level.toUpperCase()}
              </span>
            </div>

            {analysis.risk_assessment.risk_factors.length > 0 ? (
              <div className="space-y-2">
                {analysis.risk_assessment.risk_factors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-amber-500/20 border border-amber-500/30 rounded-md">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-200">{factor}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-green-500/20 border border-green-500/30 rounded-md">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-200">No significant risk factors identified</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfAnalyzer;
