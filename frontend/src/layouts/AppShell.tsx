import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarContent } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen h-screen w-full max-w-full bg-slate-950/92 backdrop-blur-md text-slate-100 flex overflow-hidden font-sans relative">
      {/* Subtle Ambient Glow */}
      <div className="bg-ambient pointer-events-none" />

      {/* Desktop Sidebar (In standard flex layout flow - Zero overlap possible!) */}
      <aside
        className={`hidden md:flex flex-col shrink-0 h-full border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </aside>

      {/* Mobile Drawer (Only visible when toggled via mobile hamburger on < md) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-800 p-0 flex flex-col z-50 shadow-2xl">
            <SidebarContent
              isCollapsed={false}
              onMobileClose={() => setIsMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main Content Workspace (flex-1 dynamically fills all remaining width) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        <Topbar onMobileMenuToggle={() => setIsMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full pb-10">
            <Outlet />
          </div>

          <footer className="py-6 border-t border-slate-800/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
            <span>© 2026 Aura Assignments • Academic Management Portal</span>
            <span>Secure Role-Based Access Control</span>
          </footer>
        </main>
      </div>
    </div>
  );
};
export default AppShell;
