"use client"
import React from 'react';
import Sidenav from './Sidenav';
import { logoutUser } from '../auth';
import { useRouter } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-base-100">
      <div className="drawer lg:drawer-open">
        <input id="drawer-toggle" type="checkbox" className="drawer-toggle" />
        
        {/* Main content */}
        <div className="drawer-content flex flex-col">
          {/* Mobile header */}
          <div className="navbar bg-base-100 lg:hidden border-b border-base-300">
            <div className="navbar-start">
              <label htmlFor="drawer-toggle" className="btn btn-square btn-ghost">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </label>
            </div>
            <div className="navbar-center">
              <span className="text-xl font-bold">HabitPulse</span>
            </div>
            <div className="navbar-end">
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>

        {/* Sidebar */}
        <div className="drawer-side">
          <label htmlFor="drawer-toggle" className="drawer-overlay"></label>
          <Sidenav onLogout={handleLogout} />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
