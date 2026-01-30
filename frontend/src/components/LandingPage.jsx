import React from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Shield, 
  TrendingUp, 
  Users, 
  BarChart3, 
  CheckCircle, 
  Globe, 
  ArrowRight, 
  Star,
  Zap,
  Target,
  Activity,
  Award,
  Menu,
  X,
  Twitter,
  LinkedIn,
  Github
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const scrollY = useScroll();
  
  // Parallax effects for hero section
  const heroY = useTransform(scrollY, [0, 300], (value) => value * 0.5);
  const mountainY = useTransform(scrollY, [0, 200], (value) => value * 0.3);
  const sunY = useTransform(scrollY, [0, 100], (value) => value * 0.2);
  
  // Floating animation for metrics
  const floatY = useSpring({
    from: 0,
    to: [-10, 10],
    config: { duration: 3, repeat: Infinity, repeatType: "reverse" }
  });
  
  const floatY2 = useSpring({
    from: 0,
    to: [-8, 8],
    config: { duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }
  });
  
  const floatY3 = useSpring({
    from: 0,
    to: [-6, 6],
    config: { duration: 2, repeat: Infinity, repeatType: "reverse", delay: 1 }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">VendorScore</span>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
                <a href="#analytics" className="text-gray-600 hover:text-gray-900 transition-colors">Analytics</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden md:block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Parallax Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Sky Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-300 via-blue-100 to-white" />
          
          {/* Sun */}
          <motion.div
            style={{ y: sunY }}
            className="absolute top-20 right-20 w-24 h-24 bg-yellow-300 rounded-full shadow-2xl"
          />
          
          {/* Mountains */}
          <svg
            className="absolute bottom-0 w-full h-64"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            style={{ y: mountainY }}
          >
            <path
              d="M0,320 L480,160 L960,200 L1440,240 L1440,320 Z"
              fill="url(#mountainGradient)"
            />
            <defs>
              <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0e7ff" />
                <stop offset="100%" stopColor="#c7d2fe" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hero Content */}
        <motion.div 
          style={{ y: heroY }}
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-semibold text-purple-600 mb-6"
          >
            <Zap className="w-4 h-4 mr-2" />
            Enterprise-Grade Analytics
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
          >
            Transform Vendor Management
            <br />
            <span className="text-transparent bg-clip-text text-gradient-to-r from-blue-600 to-purple-600">
              with Data-Driven Insights
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Monitor, compare, and optimize vendor performance with our comprehensive quality scoring system. 
            Make data-driven decisions that impact your bottom line.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto"
          >
            <motion.div
              style={{ y: floatY }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg"
            >
              <div className="text-3xl font-bold text-gray-900">
                <span className="text-transparent bg-clip-text text-gradient-to-r from-blue-600 to-purple-600">
                  10K+
                </span>
              </div>
              <p className="text-gray-600 mt-2">Records Processed Daily</p>
            </motion.div>
            
            <motion.div
              style={{ y: floatY2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg"
            >
              <div className="text-3xl font-bold text-gray-900">
                <span className="text-transparent bg-clip-text text-gradient-to-r from-green-600 to-emerald-600">
                  99.9%
                </span>
              </div>
              <p className="text-gray-600 mt-2">Accuracy Rate</p>
            </motion.div>
            
            <motion.div
              style={{ y: floatY3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg"
            >
              <div className="text-3xl font-bold text-gray-900">
                <span className="text-transparent bg-clip-text text-gradient-to-r from-orange-600 to-red-600">
                  24/7
                </span>
              </div>
              <p className="text-gray-600 mt-2">SLA Monitoring</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage vendor relationships effectively
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Monitor vendor performance with live dashboards and instant alerts when metrics fall below thresholds.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: TrendingUp,
                title: "Quality Scoring",
                description: "Our proprietary algorithm evaluates vendors across 4 key metrics with weighted scoring.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: Shield,
                title: "SLA Monitoring",
                description: "Automated alerts and notifications when vendors breach service level agreements.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: Users,
                title: "Vendor Comparison",
                description: "Side-by-side analysis with advanced filtering and export capabilities.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: Target,
                title: "What-If Analysis",
                description: "ROI calculations and scenario planning for vendor switching decisions.",
                color: "from-pink-500 to-pink-600"
              },
              {
                icon: Activity,
                title: "Change Tracking",
                description: "Monitor schema changes and their impact on data quality over time.",
                color: "from-indigo-500 to-indigo-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section id="analytics" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See Your Data Come Alive
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Interactive dashboards that make complex data simple to understand
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Live Dashboard Preview</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">Live Data</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Vendor Performance</div>
                  <div className="text-2xl font-bold text-gray-900">94.2</div>
                  <div className="text-xs text-green-600 mt-1">↑ 2.3%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Cost Efficiency</div>
                  <div className="text-2xl font-bold text-gray-900">$8.45</div>
                  <div className="text-xs text-green-600 mt-1">↓ 12%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Coverage Rate</div>
                  <div className="text-2xl font-bold text-gray-900">87.3%</div>
                  <div className="text-xs text-yellow-600 mt-1">→ 5.1%</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Vendor Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of companies already using VendorScore to optimize their vendor relationships and reduce costs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all duration-200"
              >
                Start Free Trial
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-200"
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
                <span className="text-lg font-semibold text-white">VendorScore</span>
              </div>
              <p className="text-gray-400 text-sm">
                Enterprise vendor management and analytics platform
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 VendorScore. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <LinkedIn className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <GitHub className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 bg-white md:hidden"
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">VendorScore</span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="px-4 py-2">
            <a href="#features" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#analytics" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">Analytics</a>
            <a href="#pricing" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#contact" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
          </nav>
        </motion.div>
      )}
    </div>
  );
};

export default LandingPage;
