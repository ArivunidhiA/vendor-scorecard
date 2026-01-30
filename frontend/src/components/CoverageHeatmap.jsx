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
    return 'bg-gray-200';
  };

  const getTextColor = (coverage) => {
    return coverage >= 75 ? 'text-white' : 'text-gray-900';
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Geographic Coverage Heatmap</h2>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-success-500 rounded"></div>
            <span className="text-gray-600">95%+</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-success-400 rounded"></div>
            <span className="text-gray-600">85-94%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-warning-400 rounded"></div>
            <span className="text-gray-600">75-84%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-warning-500 rounded"></div>
            <span className="text-gray-600">50-74%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-danger-400 rounded"></div>
            <span className="text-gray-600">1-49%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span className="text-gray-600">0%</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {vendors.map(vendor => {
          const vendorStats = stats[vendor.id];
          return (
            <div key={vendor.id} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{vendor.name}</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Coverage:</span>
                  <span className="font-medium">{formatPercentage(vendorStats.average)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jurisdictions:</span>
                  <span className="font-medium">{vendorStats.covered}/{vendorStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Coverage:</span>
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
              <th className="text-left p-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200">
                Vendor / Jurisdiction
              </th>
              {jurisdictions.map(jurisdiction => (
                <th 
                  key={jurisdiction.id} 
                  className="text-center p-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 min-w-[80px]"
                >
                  <div>{jurisdiction.name}</div>
                  <div className="text-gray-500">{jurisdiction.state}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendors.map(vendor => (
              <tr key={vendor.id}>
                <td className="p-2 font-medium text-gray-900 bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-primary-600" />
                    <span>{vendor.name}</span>
                  </div>
                </td>
                {jurisdictions.map(jurisdiction => {
                  const coverage = heatmapData[vendor.id]?.[jurisdiction.id] || 0;
                  return (
                    <td 
                      key={jurisdiction.id} 
                      className={`p-2 text-center border border-gray-200 ${getHeatmapColor(coverage)} ${getTextColor(coverage)} text-xs font-medium transition-colors duration-200 hover:opacity-80`}
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

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Coverage Insights</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <div>• <strong>Vendor A</strong> shows comprehensive coverage across all jurisdictions with consistently high percentages.</div>
          <div>• <strong>Vendor D</strong> demonstrates specialized coverage in California jurisdictions (LA County, Orange County).</div>
          <div>• <strong>Vendor C</strong> has the most limited coverage, particularly in major metropolitan areas.</div>
          <div>• <strong>Vendor B</strong> provides balanced coverage with moderate performance across most jurisdictions.</div>
        </div>
      </div>
    </div>
  );
};

export default CoverageHeatmap;
