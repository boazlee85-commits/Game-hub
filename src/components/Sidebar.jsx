import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Lightbulb, Upload, Settings, Gamepad2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/ideas', label: 'Your Ideas for Games', icon: Lightbulb },
  { path: '/upload', label: 'Upload Games', icon: Upload },
];

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-10">
        <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl bg-primary/20">
            <Gamepad2 className="h-6 w-6 text-primary" />
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight text-foreground">GameHub</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-3 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex h-14 items-center gap-4 rounded-2xl px-5 text-lg font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
              }`}
            >
              <item.icon className="h-6 w-6 shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-8">
        <Link
          to="/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex h-14 items-center gap-4 rounded-2xl px-5 text-lg font-semibold transition-all duration-200 ${
            location.pathname === '/settings'
              ? 'bg-primary/15 text-primary'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
          }`}
        >
          <Settings className="h-6 w-6 shrink-0" />
          <span>Settings</span>
          {location.pathname === '/settings' && (
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-border bg-card p-2 text-foreground lg:hidden"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside className="fixed left-0 top-0 hidden h-screen w-[316px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <NavContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-screen w-[316px] max-w-[86vw] border-r border-sidebar-border bg-sidebar lg:hidden"
            >
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
