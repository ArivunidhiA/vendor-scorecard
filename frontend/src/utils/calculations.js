// Client-side calculations for vendor quality scoring

export const calculateQualityScore = (metrics) => {
  const {
    pii_completeness = 0,
    disposition_accuracy = 0,
    avg_freshness_days = 0,
    geographic_coverage = 0
  } = metrics;

  const freshness_score = Math.max(0, 100 - avg_freshness_days);
  
  const quality_score = (
    (pii_completeness * 0.4) +
    (disposition_accuracy * 0.3) +
    (freshness_score * 0.2) +
    (geographic_coverage * 0.1)
  );

  return Math.round(quality_score * 100) / 100;
};

export const calculateValueIndex = (qualityScore, costPerRecord) => {
  if (costPerRecord <= 0) return 0;
  return Math.round((qualityScore / costPerRecord) * 100) / 100;
};

export const getQualityGrade = (score) => {
  if (score >= 95) return { grade: 'A+', color: 'text-success-600' };
  if (score >= 90) return { grade: 'A', color: 'text-success-600' };
  if (score >= 85) return { grade: 'B+', color: 'text-primary-600' };
  if (score >= 80) return { grade: 'B', color: 'text-primary-600' };
  if (score >= 75) return { grade: 'C+', color: 'text-warning-600' };
  if (score >= 70) return { grade: 'C', color: 'text-warning-600' };
  return { grade: 'D', color: 'text-danger-600' };
};

export const getStatusColor = (value, thresholds) => {
  const { high = 90, medium = 75 } = thresholds;
  
  if (value >= high) return 'text-success-600';
  if (value >= medium) return 'text-warning-600';
  return 'text-danger-600';
};

export const getStatusBadge = (value, thresholds) => {
  const { high = 90, medium = 75 } = thresholds;
  
  if (value >= high) return 'status-success';
  if (value >= medium) return 'status-warning';
  return 'status-danger';
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (number, decimals = 1) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

export const formatPercentage = (value, decimals = 1) => {
  return `${formatNumber(value, decimals)}%`;
};

export const calculateROI = (savings, investment) => {
  if (investment <= 0) return 0;
  return Math.round((savings / investment) * 10000) / 100;
};

export const calculatePaybackPeriod = (savings, investment) => {
  if (savings <= 0) return null;
  return Math.round((investment / savings) * 100) / 100;
};

export const getRiskLevel = (riskFactors) => {
  const riskCount = riskFactors.length;
  if (riskCount >= 2) return { level: 'high', color: 'text-danger-600' };
  if (riskCount === 1) return { level: 'medium', color: 'text-warning-600' };
  return { level: 'low', color: 'text-success-600' };
};

export const sortVendors = (vendors, sortBy = 'quality_score', direction = 'desc') => {
  const sorted = [...vendors].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    // Handle nested objects
    if (sortBy.includes('.')) {
      const keys = sortBy.split('.');
      aVal = keys.reduce((obj, key) => obj?.[key], a);
      bVal = keys.reduce((obj, key) => obj?.[key], b);
    }
    
    if (typeof aVal === 'string') {
      return direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return direction === 'asc' 
      ? aVal - bVal
      : bVal - aVal;
  });
  
  return sorted;
};

export const filterVendors = (vendors, filters) => {
  return vendors.filter(vendor => {
    if (filters.minQuality && vendor.quality_score < filters.minQuality) return false;
    if (filters.maxCost && vendor.cost_per_record > filters.maxCost) return false;
    if (filters.minCoverage && vendor.coverage_percentage < filters.minCoverage) return false;
    if (filters.jurisdictions && filters.jurisdictions.length > 0) {
      const vendorJurisdictions = vendor.jurisdiction_performance || [];
      const hasRequiredJurisdiction = filters.jurisdictions.some(reqJur =>
        vendorJurisdictions.some(vj => vj.jurisdiction === reqJur)
      );
      if (!hasRequiredJurisdiction) return false;
    }
    return true;
  });
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return formatDate(dateString);
};
