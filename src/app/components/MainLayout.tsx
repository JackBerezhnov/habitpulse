"use client"
import React, { useState } from 'react';
import Sidenav from './Sidenav';
import { logoutUser } from '../auth';
import { useRouter } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  return (
    <div className="space-bg min-h-screen">
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar - desktop always visible */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="fixed inset-y-0 left-0 w-52 z-40">
            <Sidenav onLogout={handleLogout} />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/60 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-40 w-52 lg:hidden">
              <Sidenav onLogout={handleLogout} />
            </aside>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile header */}
          <div className="lg:hidden pixel-panel flex items-center justify-between p-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="pixel-btn pixel-btn-outline text-[0.6rem] py-2 px-3"
            >
              ☰
            </button>
            <span className="text-[0.7rem] text-yellow-400">HabitPulse</span>
            <button
              onClick={handleLogout}
              className="pixel-btn pixel-btn-outline text-[0.6rem] py-2 px-3"
            >
              ⬅
            </button>
          </div>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
