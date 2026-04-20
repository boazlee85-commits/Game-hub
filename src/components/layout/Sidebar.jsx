import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Swords, Home, HelpCircle, Settings, Trophy, BookOpen, Shield } from 'lucide-react';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Swords, label: 'Play', path: '/play' },
  { icon: BookOpen, label: 'Rules', path: '/rules' },
  { icon: Shield, label: 'Pieces', path: '/pieces' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-16 lg:w-56 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-3 lg:px-5 lg:py-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Swords className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="hidden lg:block font-heading font-bold text-lg text-sidebar-foreground">
            Stratego
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 lg:px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                active 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                  : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 lg:px-4 lg:py-4 border-t border-sidebar-border space-y-1">
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
            location.pathname === '/settings'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
          }`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span className="hidden lg:block">Settings</span>
        </Link>
        <div className="hidden lg:block text-[10px] text-muted-foreground px-3">
          Stratego Online
        </div>
      </div>
    </aside>
  );
}