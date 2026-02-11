import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  ArrowLeft, 
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { quickAPI } from '../utils/api';
import { TubelightNavbar } from './ui/TubelightNavbar';
import QuickComparisonResults from './QuickComparisonResults';

const ShareView = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navItems = [
    { name: 'Home', url: '/', icon: ArrowLeft },
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  ];

  useEffect(() => {
    loadSharedResults();
  }, [shareId]);

  const loadSharedResults = async () => {
    try {
      setLoading(true);
      const response = await quickAPI.getSharedResults(shareId);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load shared results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="h-[72px]" aria-hidden="true" />
        <div className="mt-4 mb-0 w-full">
          <TubelightNavbar items={navItems} fixed={false} />
        </div>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full mx-auto mb-4"
          />
          <p className="text-white/60">Loading shared results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <div className="h-[72px]" aria-hidden="true" />
        <div className="mt-4 mb-0 w-full">
          <TubelightNavbar items={navItems} fixed={false} />
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Link Expired or Invalid</h2>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <div className="h-[72px]" aria-hidden="true" />
      <div className="mt-4 mb-0 w-full">
        <TubelightNavbar items={navItems} fixed={false} />
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Shared Banner */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-5 h-5 text-blue-400" />
                <span className="text-white/80 text-sm">Viewing shared comparison results</span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Create your own
              </button>
            </div>
          </motion.div>

          <QuickComparisonResults 
            results={results} 
            onReset={() => navigate('/')}
            onSave={() => navigate('/dashboard')}
          />
        </div>
      </div>
    </div>
  );
};

export default ShareView;
