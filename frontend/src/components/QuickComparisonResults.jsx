import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Download, 
  Share2, 
  RotateCcw,
  CheckCircle,
  Target,
  Zap,
  Link as LinkIcon,
  Copy,
  Check
} from 'lucide-react';
import { quickAPI } from '../utils/api';

const QuickComparisonResults = ({ results, onReset, onSave }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [shareUrl, setShareUrl] = useState(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  if (!results || !results.vendors || results.vendors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No comparison data available</p>
      </div>
    );
  }

  const { vendors, rankings, recommendations } = results;
  const topPick = rankings[0];
  const bestValue = vendors.reduce((best, v) => 
    v.value_index > best.value_index ? v : best, vendors[0]
  );
  const cheapest = vendors.reduce((cheap, v) => 
    v.cost_per_record < cheap.cost_per_record ? v : cheap, vendors[0]
  );
  const highestQuality = vendors.reduce((high, v) => 
    v.quality_score > high.quality_score ? v : high, vendors[0]
  );

  const exportResults = (format) => {
    if (format === 'json') {
      const dataStr = JSON.stringify(results, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vendor-comparison-results.json';
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = ['Rank,Name,Cost Per Record,Quality Score,Value Index'];
      const rows = rankings.map(r => 
        `${r.rank},${r.name},${r.cost_per_record},${r.quality_score},${r.value_index}`
      );
      const csv = [...headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vendor-comparison-results.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGradeBg = (score) => {
    if (score >= 90) return 'bg-green-400/20';
    if (score >= 80) return 'bg-blue-400/20';
    if (score >= 70) return 'bg-yellow-400/20';
    return 'bg-red-400/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-white">Comparison Results</h2>
          <p className="text-white/60">
            {vendors.length} vendors analyzed
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportResults('csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Comparison</span>
          </button>
        </div>
      </motion.div>

      {/* Winner Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-400/30 rounded-2xl flex items-center justify-center">
              <Award className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 font-medium mb-1">Top Recommendation</p>
              <h3 className="text-3xl font-bold text-white">{topPick.name}</h3>
              <p className="text-white/80 mt-1">
                Quality Score: {topPick.quality_score} | 
                Cost: ${topPick.cost_per_record}/record |
                Value Index: {topPick.value_index}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full ${getGradeBg(topPick.quality_score)}`}>
            <span className={`text-lg font-bold ${getGradeColor(topPick.quality_score)}`}>
              {topPick.quality_score >= 90 ? 'A+' : topPick.quality_score >= 80 ? 'A' : 'B'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-white/60 text-sm">Most Affordable</p>
          </div>
          <p className="text-xl font-bold text-white">{cheapest.name}</p>
          <p className="text-blue-400">${cheapest.cost_per_record}/record</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-white/60 text-sm">Best Value</p>
          </div>
          <p className="text-xl font-bold text-white">{bestValue.name}</p>
          <p className="text-purple-400">Value Index: {bestValue.value_index}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-green-400/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-white/60 text-sm">Highest Quality</p>
          </div>
          <p className="text-xl font-bold text-white">{highestQuality.name}</p>
          <p className="text-green-400">Score: {highestQuality.quality_score}</p>
        </div>
      </motion.div>

      {/* Rankings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden"
      >
        <div className="p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">Full Rankings</h3>
        </div>
        <div className="divide-y divide-white/10">
          {rankings.map((vendor) => (
            <div 
              key={vendor.name}
              className={`p-4 flex items-center justify-between ${
                vendor.rank === 1 ? 'bg-green-400/10' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${vendor.rank === 1 ? 'bg-green-400 text-white' : 'bg-white/20 text-white/60'}
                `}>
                  {vendor.rank}
                </div>
                <div>
                  <p className="font-medium text-white">{vendor.name}</p>
                  <p className="text-sm text-white/60">${vendor.cost_per_record}/record</p>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-right">
                <div>
                  <p className="text-sm text-white/60">Quality</p>
                  <p className={`font-medium ${getGradeColor(vendor.quality_score)}`}>
                    {vendor.quality_score}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Value Index</p>
                  <p className="font-medium text-white">{vendor.value_index}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cost Analysis (if annual volume provided) */}
      {recommendations && recommendations.cost_comparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Annual Cost Analysis ({recommendations.annual_volume.toLocaleString()} records/year)
          </h3>
          <div className="space-y-3">
            {recommendations.cost_comparison.map((vendor, idx) => (
              <div key={vendor.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-white/60 w-6">{idx + 1}</span>
                  <span className="text-white font-medium">{vendor.name}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <span className="text-white/60">Quality: {vendor.quality_score}</span>
                  <span className="text-green-400 font-semibold">
                    ${vendor.annual_cost.toLocaleString()}/year
                  </span>
                </div>
              </div>
            ))}
          </div>
          {recommendations.best_value && (
            <div className="mt-4 p-4 bg-green-400/10 rounded-lg border border-green-400/30">
              <p className="text-green-400 font-medium">
                💡 Best Value Choice: {recommendations.best_value}
              </p>
              <p className="text-white/80 text-sm mt-1">
                Based on your priority settings, this vendor offers the optimal balance of quality and cost.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center space-x-4"
      >
        <button
          onClick={onSave}
          className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Save to Dashboard</span>
        </button>
        <button
          onClick={() => exportResults('json')}
          className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Export JSON</span>
        </button>
      </motion.div>
    </div>
  );
};

export default QuickComparisonResults;
