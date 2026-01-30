import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  ArrowRight,
  ArrowUpRight,
  LayoutGrid as LayoutGridIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { TubelightNavbar } from './ui/TubelightNavbar';
import { Announcement, AnnouncementTitle } from './ui/announcement';

const LandingPage = () => {
  const navigate = useNavigate();

  const landingNavItems = [
    { name: 'Features', url: '#features', icon: LayoutGridIcon },
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  ];

  const featureCards = [
    {
      id: 1,
      title: 'Quality scoring',
      tagline: 'Compare vendors in one place',
      description: 'PII completeness, disposition accuracy, freshness, and coverage — all in a single scorecard so you can compare vendors at a glance.',
      className: 'md:col-span-2',
    },
    {
      id: 2,
      title: 'What‑if analysis',
      tagline: 'Model before you switch',
      description: 'Model switching costs and ROI before you change vendors. See financial impact and risk so you can decide with data.',
      className: 'col-span-1',
    },
    {
      id: 3,
      title: 'Coverage by jurisdiction',
      tagline: 'Region and jurisdiction view',
      description: 'See how each vendor performs by region and jurisdiction. Heatmaps and breakdowns so you know where coverage is strong or weak.',
      className: 'col-span-1',
    },
    {
      id: 4,
      title: 'SLA monitoring',
      tagline: 'Alerts when it matters',
      description: 'Alerts when thresholds are breached so you can act fast. Monitor uptime, latency, and accuracy in one place.',
      className: 'md:col-span-2',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Same vertical position as Dashboard: spacer (header height) + navbar wrapper */}
      <div className="h-[72px]" aria-hidden="true" />
      <div className="mt-4 mb-0 w-full">
        <TubelightNavbar items={landingNavItems} fixed={false} />
      </div>

      {/* Hero - gap below navbar, content brought down (navbar unchanged above) */}
      <section className="relative min-h-0 flex flex-col items-center justify-start overflow-hidden pt-9 pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 w-full max-w-4xl mx-auto overflow-hidden"
        >
          <h1 className="font-heading text-white mb-3 leading-tight">
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold">Vendor Quality Scorecard</span>
            <span className="block text-lg sm:text-xl md:text-2xl lg:text-3xl font-normal text-white/90 italic mt-1">Scored and Compared</span>
          </h1>
          <p className="text-base text-white/70 mb-5 max-w-lg mx-auto leading-relaxed">
            One place to monitor quality, cost, and coverage across criminal records vendors. Make decisions with data, <span className="italic">not guesswork.</span>
          </p>
          <Link to="/dashboard">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Open scorecard
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>

          <div className="mt-4 flex justify-center">
            <Announcement className="cursor-pointer" onClick={() => navigate('/dashboard')}>
              <AnnouncementTitle>
                New: What-if analysis — model switching costs before you change vendors
                <ArrowUpRight className="w-4 h-4 shrink-0 text-white/50" />
              </AnnouncementTitle>
            </Announcement>
          </div>

          {/* Stats - tighter gap */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 max-w-2xl mx-auto">
            <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06] text-center">
              <div className="text-xl font-semibold text-green-500 font-heading tabular-nums">10K+</div>
              <p className="text-sm text-white/50 mt-0.5">Records processed daily</p>
            </div>
            <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06] text-center">
              <div className="text-xl font-semibold text-green-500 font-heading tabular-nums">99.9%</div>
              <p className="text-sm text-white/50 mt-0.5">Accuracy rate</p>
            </div>
            <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06] text-center">
              <div className="text-xl font-semibold text-green-500 font-heading tabular-nums">24/7</div>
              <p className="text-sm text-white/50 mt-0.5">SLA monitoring</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features - text-only cards */}
      <section id="features" className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl font-semibold text-white mb-2">What you get</h2>
            <p className="text-white/60 text-sm max-w-lg mx-auto">Core capabilities for evaluating and managing vendor performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featureCards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  card.className,
                  'bg-white/[0.04] rounded-2xl border border-white/[0.06] p-5'
                )}
              >
                <p className="font-heading font-bold md:text-2xl text-lg text-white">{card.title}</p>
                <p className="font-normal text-sm text-white/80 mt-1 italic">{card.tagline}</p>
                <p className="font-normal text-sm my-3 max-w-md text-white/70 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="analytics" className="py-8 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-heading text-2xl font-semibold text-white mb-2">Dashboard preview</h2>
            <p className="text-white/60 text-sm max-w-lg mx-auto"><span className="italic">Quality, cost, and coverage in one view.</span></p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/[0.04] rounded-2xl border border-white/[0.06] overflow-hidden"
          >
            <div className="bg-green-600 px-5 py-3">
              <h3 className="font-heading text-base font-semibold text-white">Scorecard overview</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                  <div className="text-xs text-white/50 mb-0.5">Vendor performance</div>
                  <div className="text-lg font-semibold text-white tabular-nums">94.2</div>
                  <div className="text-xs text-green-500 mt-0.5">↑ 2.3%</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                  <div className="text-xs text-white/50 mb-0.5">Cost per record</div>
                  <div className="text-lg font-semibold text-white tabular-nums">$8.45</div>
                  <div className="text-xs text-green-500 mt-0.5">↓ 12%</div>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04]">
                  <div className="text-xs text-white/50 mb-0.5">Coverage</div>
                  <div className="text-lg font-semibold text-white tabular-nums">87.3%</div>
                  <div className="text-xs text-white/50 mt-0.5">→ 5.1%</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
