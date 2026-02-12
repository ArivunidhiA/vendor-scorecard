import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { quickAPI } from '../utils/api';

const QuickUploader = ({ onUploadSuccess, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFile = async (file) => {
    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls', '.pdf'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      const err = 'Please upload a CSV, Excel, or PDF file (.csv, .xlsx, .xls, .pdf)';
      setError(err);
      onError?.(err);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const err = 'File size must be less than 5MB';
      setError(err);
      onError?.(err);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      let data;
      try {
        // Primary path: use backend upload API when available
        const response = await quickAPI.uploadCSV(formData);
        data = response.data;
      } catch (err) {
        console.error('Upload API failed, falling back to local CSV parsing:', err);

        // Fallback path: parse CSV in the browser so uploads
        // still work in demo environments without a backend.
        try {
          const text = await file.text();
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            throw new Error('File appears to be empty.');
          }

          // Split on commas that are not inside quotes
          const splitCsvLine = (line) =>
            line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((token) =>
              token.trim().replace(/^"|"$/g, '')
            );

          const headerCells = splitCsvLine(lines[0]).map((h) =>
            h.toLowerCase().trim()
          );

          const colIndex = {};
          headerCells.forEach((h, idx) => {
            colIndex[h] = idx;
          });

          if (
            colIndex['vendor_name'] == null ||
            colIndex['cost_per_record'] == null
          ) {
            throw new Error(
              'CSV must include vendor_name and cost_per_record columns.'
            );
          }

          const vendors = [];
          for (let i = 1; i < lines.length; i += 1) {
            const row = splitCsvLine(lines[i]);
            if (!row.length) continue;
            const name = row[colIndex['vendor_name']] || '';
            const costStr = row[colIndex['cost_per_record']] || '';
            const cost = parseFloat(costStr);
            if (!name || Number.isNaN(cost)) continue;

            const getNum = (col) => {
              if (colIndex[col] == null) return undefined;
              const raw = row[colIndex[col]];
              if (raw === undefined || raw === '') return undefined;
              const n = parseFloat(raw);
              return Number.isNaN(n) ? undefined : n;
            };

            const vendor = {
              name: name.trim(),
              cost_per_record: cost,
              quality_score: getNum('quality_score'),
              pii_completeness: getNum('pii_completeness'),
              disposition_accuracy: getNum('disposition_accuracy'),
              avg_freshness_days: getNum('avg_freshness_days'),
              coverage_percentage: getNum('coverage_percentage'),
              description:
                colIndex['description'] != null
                  ? row[colIndex['description']] || ''
                  : '',
            };

            vendors.push(vendor);
          }

          if (!vendors.length) {
            throw new Error('No valid vendor rows found in CSV.');
          }

          data = {
            session_id: null,
            vendors,
            columns_detected: Object.keys(colIndex),
            message: `Parsed ${vendors.length} vendors locally from CSV`,
          };
        } catch (parseErr) {
          console.error('Local CSV parsing failed:', parseErr);
          const msg =
            parseErr.message ||
            err.response?.data?.detail ||
            err.message ||
            'Upload failed';
          setError(msg);
          onError?.(msg);
          return;
        }
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadedFile({ name: file.name, size: file.size });

      // Small delay to show 100% progress
      setTimeout(() => {
        onUploadSuccess?.(data);
      }, 500);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Upload failed';
      setError(msg);
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [onUploadSuccess, onError]);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [onUploadSuccess, onError]);

  const clearUpload = () => {
    setUploadedFile(null);
    setError(null);
    setUploadProgress(0);
  };

  const downloadTemplate = () => {
    const template = `vendor_name,cost_per_record,quality_score,pii_completeness,disposition_accuracy,avg_freshness_days,coverage_percentage,description
Vendor A,12.50,85.5,92.0,88.5,3.5,85.0,Premium provider with high accuracy
Vendor B,8.00,74.2,78.0,82.0,5.2,72.0,Cost-effective for basic needs
Vendor C,15.00,91.2,95.0,92.0,2.1,91.0,High quality with fast turnaround`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vendor_comparison_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (uploadedFile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium">{uploadedFile.name}</p>
              <p className="text-white/60 text-sm">
                {(uploadedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
          <button
            onClick={clearUpload}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
          ${isDragging 
            ? 'border-green-400 bg-green-400/10' 
            : 'border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10'
          }
          ${uploading ? 'pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {uploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Upload className="w-8 h-8 text-white/60" />
              </motion.div>
            ) : (
              <Upload className="w-8 h-8 text-white/60" />
            )}
          </div>
          
          <p className="text-white font-medium mb-2">
            {uploading ? 'Uploading...' : 'Drop your vendor data here'}
          </p>
          
          <p className="text-white/60 text-sm mb-4">
            {uploading 
              ? `${uploadProgress}% complete`
              : 'or click to select a CSV or Excel file'
            }
          </p>
          
          {!uploading && (
            <span className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
              <FileText className="w-4 h-4 mr-2" />
              Select File
            </span>
          )}
        </label>

        {/* Progress bar */}
        {uploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
            <motion.div
              className="h-full bg-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-red-400 text-sm bg-red-400/10 rounded-lg p-3"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Template download */}
      <div className="flex items-center justify-center space-x-2 text-sm">
        <span className="text-white/60">Need a template?</span>
        <button
          onClick={downloadTemplate}
          className="text-green-400 hover:text-green-300 flex items-center space-x-1 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download CSV template</span>
        </button>
      </div>
    </div>
  );
};

export default QuickUploader;
