import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

/**
 * Tubelight-style pill navbar. Full-width so labels stay on one line. Optional right content (e.g. Home link).
 * @param {Object} props
 * @param {{ name: string, url: string, icon: React.ComponentType, onClick?: () => void }[]} props.items
 * @param {React.ReactNode} [props.rightContent] - Rendered to the right of the nav pill (e.g. Home link)
 * @param {boolean} [props.visible] - When false, navbar is hidden (e.g. until scroll past header). Omit for always visible (landing).
 * @param {boolean} [props.fixed] - When false, navbar is in document flow (e.g. under a sticky header). Default true.
 * @param {string} [props.className]
 * @param {string} [props.activeTab] - Controlled active tab name
 * @param {(name: string) => void} [props.onTabChange] - Called when tab is clicked (for controlled mode)
 */
export function TubelightNavbar({ items, rightContent, visible = true, fixed = true, className, activeTab: controlledActiveTab, onTabChange }) {
  const location = useLocation();
  const [internalActiveTab, setInternalActiveTab] = useState(items[0]?.name ?? '');
  const [isMobile, setIsMobile] = useState(false);

  const isControlled = controlledActiveTab != null && typeof onTabChange === 'function';
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync internal state with route when not controlled
  useEffect(() => {
    if (isControlled) return;
    const path = location.pathname + location.hash;
    const match = items.find((item) => {
      if (item.url.startsWith('#')) return path.endsWith(item.url) || location.hash === item.url;
      return location.pathname === item.url || path === item.url;
    });
    if (match) setInternalActiveTab(match.name);
  }, [location.pathname, location.hash, items, isControlled]);

  const handleClick = (item) => (e) => {
    e.preventDefault();
    const scrollY = window.scrollY;
    if (item.onClick) item.onClick();
    if (isControlled && onTabChange) onTabChange(item.name);
    else setInternalActiveTab(item.name);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
      e.currentTarget?.blur();
    });
  };

  return (
    <div
      className={cn(
        fixed
          ? 'fixed bottom-0 sm:top-0 left-0 right-0 z-50 mb-6 sm:pt-6 px-4 sm:px-6 pointer-events-none'
          : 'relative z-40 pb-4 px-4 sm:px-6',
        'transition-all duration-300 ease-out',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full sm:translate-y-0 sm:-translate-y-full',
        !fixed && (visible ? 'pointer-events-auto' : 'pointer-events-none'),
        className
      )}
      style={fixed ? undefined : { position: 'relative' }}
    >
      <div className="w-fit max-w-full mx-auto flex items-center justify-center gap-3 px-2 pointer-events-auto">
        <div className="flex items-center gap-1 sm:gap-2 bg-white/[0.05] border border-white/10 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg flex-nowrap overflow-x-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            const isHash = item.url.startsWith('#');
            const isInternal = !isHash && item.url.startsWith('/');

            const content = (
              <>
                <span className="hidden md:inline whitespace-nowrap">{item.name}</span>
                <span className="md:hidden shrink-0">
                  <Icon size={18} strokeWidth={2.5} />
                </span>
              {isActive && (
                <motion.div
                  layoutId="tubelight-lamp"
                  className="absolute inset-0 w-full bg-green-500/10 rounded-full -z-10"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-green-500 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-green-500/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-green-500/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-green-500/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </>
          );

          const linkClass = cn(
            'relative cursor-pointer text-sm font-semibold px-3 sm:px-4 py-2 rounded-full transition-colors shrink-0',
            'text-white/80 hover:text-green-400',
            isActive && 'bg-white/10 text-green-400'
          );

          if (item.onClick) {
            return (
              <button
                key={item.name}
                type="button"
                onClick={handleClick(item)}
                className={linkClass}
              >
                {content}
              </button>
            );
          }

          if (isHash) {
            return (
              <a
                key={item.name}
                href={item.url}
                onClick={() => !isControlled && setInternalActiveTab(item.name)}
                className={linkClass}
              >
                {content}
              </a>
            );
          }

          if (isInternal) {
            return (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => !isControlled && setInternalActiveTab(item.name)}
                className={linkClass}
              >
                {content}
              </Link>
            );
          }

          return (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => !isControlled && setInternalActiveTab(item.name)}
              className={linkClass}
            >
              {content}
            </a>
          );
        })}
        </div>
        {rightContent != null ? <div className="shrink-0 flex items-center">{rightContent}</div> : null}
      </div>
    </div>
  );
}

export default TubelightNavbar;
