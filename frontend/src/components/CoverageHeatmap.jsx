import React, { useMemo } from 'react';
import { MapPin, Activity } from 'lucide-react';
import { formatPercentage } from '../utils/calculations';

const CoverageHeatmap = ({ data, vendors, jurisdictions }) => {
  const heatmapData = useMemo(() => {
    const matrix = {};
    
    vendors.forEach(vendor => {
      matrix[vendor.id] = {};
      jurisdictions.forEach(jurisdiction => {
        const coverage = data.find(
          d => d.vendor_id === vendor.id && d.jurisdiction_id === jurisdiction.id
        );
        matrix[vendor.id][jurisdiction.id] = coverage?.coverage_percentage || 0;
      });
    });
    
    return matrix;
  }, [data, vendors, jurisdictions]);

  const getHeatmapColor = (coverage) => {
    if (coverage >= 95) return 'bg-success-500';
    if (coverage >= 85) return 'bg-success-400';
    if (coverage >= 75) return 'bg-warning-400';
    if (coverage >= 50) return 'bg-warning-500';
    if (coverage > 0) return 'bg-danger-400';
    return 'bg-white/10';
  };

  const getTextColor = (coverage) => {
    return coverage >= 75 ? 'text-white' : 'text-white';
  };

  const getCoverageStats = () => {
    const stats = {};
    
    vendors.forEach(vendor => {
      const coverages = Object.values(heatmapData[vendor.id] || {});
      const validCoverages = coverages.filter(c => c > 0);
      
      stats[vendor.id] = {
        average: validCoverages.length > 0 ? validCoverages.reduce((a, b) => a + b, 0) / validCoverages.length : 0,
        max: Math.max(...validCoverages, 0),
        min: Math.min(...validCoverages, 0),
        covered: validCoverages.length,
        total: coverages.length
      };
    });
    
    return stats;
  };

  const stats = getCoverageStats();

  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold text-white">Geographic Coverage Heatmap</h2>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-success-500 rounded"></div>
            <span className="text-white/80">95%+</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-success-400 rounded"></div>
            <span className="text-white/80">85-94%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-warning-400 rounded"></div>
            <span className="text-white/80">75-84%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-warning-500 rounded"></div>
            <span className="text-white/80">50-74%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-danger-400 rounded"></div>
            <span className="text-white/80">1-49%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white/10 rounded"></div>
            <span className="text-white/80">0%</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {vendors.map(vendor => {
          const vendorStats = stats[vendor.id];
          return (
            <div key={vendor.id} className="bg-white/5 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">{vendor.name}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/80">Avg Coverage:</span>
                  <span className="font-medium">{formatPercentage(vendorStats.average)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Jurisdictions:</span>
                  <span className="font-medium">{vendorStats.covered}/{vendorStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Max Coverage:</span>
                  <span className="font-medium">{formatPercentage(vendorStats.max)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 text-sm font-medium text-white/80 bg-white/5 border border-white/20">
                Vendor / Jurisdiction
              </th>
              {jurisdictions.map(jurisdiction => (
                <th 
                  key={jurisdiction.id} 
                  className="text-center p-2 text-xs font-medium text-white/80 bg-white/5 border border-white/20 min-w-[80px]"
                >
                  <div>{jurisdiction.name}</div>
                  <div className="text-white/60">{jurisdiction.state}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors.map(vendor => (
              <tr key={vendor.id}>
                <td className="p-2 font-medium text-white bg-white/5 border border-white/20">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span>{vendor.name}</span>
                  </div>
                </td>
                {jurisdictions.map(jurisdiction => {
                  const coverage = heatmapData[vendor.id]?.[jurisdiction.id] || 0;
                  return (
                    <td 
                      key={jurisdiction.id} 
                      className={`p-2 text-center border border-white/[0.06] ${getHeatmapColor(coverage)} ${getTextColor(coverage)} text-xs font-medium transition-colors duration-200 hover:opacity-80`}
                      title={`${vendor.name} - ${jurisdiction.name}: ${formatPercentage(coverage)}`}
                    >
                      {coverage > 0 ? formatPercentage(coverage) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights - dynamic from vendors when available */}
      {vendors.length > 0 && (
        <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <h3 className="font-heading font-medium text-white mb-2">Coverage insights</h3>
          <div className="text-sm text-white/70 space-y-1">
            {vendors.slice(0, 4).map((v) => {
              const s = stats[v.id];
              const avg = s ? formatPercentage(s.average) : '—';
              return (
                <div key={v.id}>• <strong className="text-white/90">{v.name}</strong> — average coverage {avg} across {s?.covered ?? 0} jurisdictions.</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverageHeatmap;
