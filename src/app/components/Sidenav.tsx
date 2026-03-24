"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../store/useAppStore';

interface SidenavProps {
  onLogout: () => void;
}

const Sidenav: React.FC<SidenavProps> = ({ onLogout }) => {
  const pathname = usePathname();
  const { userName, currentUser } = useAppStore();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="h-full pixel-panel flex flex-col p-3 gap-3 overflow-y-auto">
      {/* Character Portrait */}
      <div className="flex flex-col items-center gap-2 pt-3 pb-2">
        <div className="pixel-panel-light w-20 h-20 flex items-center justify-center text-4xl">
          🧙
        </div>
        <div className="text-center">
          <p className="text-[0.6rem] text-[#e6b636] truncate max-w-[160px]">
            {userName || 'Player'}
          </p>
          <p className="text-[0.5rem] text-[#524c7d] mt-1">
            Level {currentUser?.Level || 1}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        <Link href="/">
          <div className={`pixel-btn w-full ${isActive('/') ? 'pixel-btn-green' : 'pixel-btn-outline'}`}>
            <span className="flex items-center justify-center gap-2">
              <span>🎮</span>
              <span className="text-[0.55rem]">Dashboard</span>
            </span>
          </div>
        </Link>
        <Link href="/analytics">
          <div className={`pixel-btn w-full ${isActive('/analytics') ? 'pixel-btn-green' : 'pixel-btn-outline'}`}>
            <span className="flex items-center justify-center gap-2">
              <span>📊</span>
              <span className="text-[0.55rem]">Analytics</span>
            </span>
          </div>
        </Link>
      </nav>

      <div className="flex-1" />

      {/* Logout */}
      <button
        onClick={onLogout}
        className="pixel-btn pixel-btn-red w-full text-[0.55rem]"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidenav;
