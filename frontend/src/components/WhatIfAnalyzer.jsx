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
      setError('Failed to run analysis');
      console.error('Error running analysis:', err);
    } finally {
      setLoading(false);
    }
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
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calculator className="w-6 h-6 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">What-If Analysis</h2>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Vendor
            </label>
            <select
              value={currentVendor}
              onChange={(e) => setCurrentVendor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select current vendor...</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} ({formatCurrency(vendor.cost_per_record)}/record)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Vendor
            </label>
            <select
              value={newVendor}
              onChange={(e) => setNewVendor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select new vendor...</option>
              {vendors.filter(v => v.id.toString() !== currentVendor).map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} ({formatCurrency(vendor.cost_per_record)}/record)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Volume
            </label>
            <input
              type="number"
              min="1"
              value={annualVolume}
              onChange={(e) => setAnnualVolume(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="10,000"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={runAnalysis}
              disabled={loading || !currentVendor || !newVendor}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="loading-spinner w-4 h-4"></div>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-danger-600" />
              <span className="text-danger-800">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Financial Impact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Current Annual Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analysis.financial_impact.current_annual_cost)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">New Annual Cost</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(analysis.financial_impact.new_annual_cost)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Annual Savings</p>
                <div className="flex items-center justify-center space-x-2">
                  {getImpactIcon(analysis.financial_impact.annual_savings)}
                  <p className={`text-2xl font-bold ${getImpactColor(analysis.financial_impact.annual_savings)}`}>
                    {formatCurrency(Math.abs(analysis.financial_impact.annual_savings))}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Monthly Savings</span>
                  <span className="text-lg font-semibold text-success-600">
                    {formatCurrency(analysis.financial_impact.monthly_savings)}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Savings Percentage</span>
                  <span className="text-lg font-semibold text-success-600">
                    {formatPercentage(analysis.financial_impact.savings_percentage)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Impact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Current Quality Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analysis.quality_impact.current_quality_score}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">New Quality Score</p>
                <p className="text-2xl font-bold text-primary-600">
                  {analysis.quality_impact.new_quality_score}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Quality Delta</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Coverage Impact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Current Coverage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(analysis.coverage_impact.current_coverage)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">New Coverage</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatPercentage(analysis.coverage_impact.new_coverage)}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-2">Coverage Delta</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ROI Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Annual ROI</span>
                  <span className="text-lg font-semibold text-success-600">
                    {formatPercentage(analysis.roi_analysis.annual_roi_percentage)}
                  </span>
                </div>
              </div>
              
              {analysis.roi_analysis.payback_period_months && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Payback Period</span>
                    <span className="text-lg font-semibold text-primary-600">
                      {analysis.roi_analysis.payback_period_months.toFixed(1)} months
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm font-medium text-gray-700">Risk Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevel(analysis.risk_assessment.risk_factors).color} bg-opacity-10`}>
                {analysis.risk_assessment.risk_level.toUpperCase()}
              </span>
            </div>

            {analysis.risk_assessment.risk_factors.length > 0 ? (
              <div className="space-y-2">
                {analysis.risk_assessment.risk_factors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-warning-50 border border-warning-200 rounded-md">
                    <AlertTriangle className="w-5 h-5 text-warning-600" />
                    <span className="text-warning-800">{factor}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-2 p-3 bg-success-50 border border-success-200 rounded-md">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <span className="text-success-800">No significant risk factors identified</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatIfAnalyzer;
