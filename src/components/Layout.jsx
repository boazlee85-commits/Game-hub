import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="lg:pl-[316px]">
        <div className="px-5 py-8 sm:px-8 lg:px-[30px]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
