"use client";
import React from 'react';
import { useRouter } from "next/navigation";
import Footer from "../footer/Footer";
import { loginWithGoogle } from '../auth';


const LoginPage: React.FC = () => {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  return (
    <div className="space-bg min-h-screen flex flex-col">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <div className="pixel-panel p-4 flex items-center gap-3">
          <span className="text-2xl">⚔️</span>
          <span className="text-[0.8rem] text-yellow-400">HabitPulse</span>
        </div>

        {/* Hero */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 max-w-5xl w-full">
            {/* Left - Features */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="text-5xl">🚀</div>
              <h1 className="text-[1rem] sm:text-[1.2rem] text-yellow-400 leading-relaxed">
                Level Up Your Life
              </h1>
              <p className="text-[0.6rem] text-gray-300 leading-relaxed">
                Transform your daily habits into an epic RPG adventure. Gain XP, level up, and build the life you&apos;ve always wanted.
              </p>

              <div className="space-y-3">
                <div className="quest-card p-3 flex items-center gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h3 className="text-[0.55rem] text-green-400">Build Streaks</h3>
                    <p className="text-[0.45rem] text-gray-400">Maintain consistency and watch your streaks grow</p>
                  </div>
                </div>
                <div className="quest-card p-3 flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  <div>
                    <h3 className="text-[0.55rem] text-yellow-400">Gain Experience</h3>
                    <p className="text-[0.45rem] text-gray-400">Every completed habit earns you XP and levels</p>
                  </div>
                </div>
                <div className="quest-card p-3 flex items-center gap-3">
                  <span className="text-xl">📊</span>
                  <div>
                    <h3 className="text-[0.55rem] text-blue-400">Track Progress</h3>
                    <p className="text-[0.45rem] text-gray-400">Visualize your growth with analytics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Login Card */}
            <div className="w-full max-w-sm">
              <div className="pixel-panel p-6">
                <div className="text-center mb-6">
                  <span className="text-4xl block mb-3">✨</span>
                  <h2 className="text-[0.8rem] text-yellow-400 mb-2">Welcome Back!</h2>
                  <p className="text-[0.5rem] text-gray-400">Ready to continue your journey?</p>
                </div>

                <button
                  type="button"
                  id="btn-siwg"
                  className="pixel-btn pixel-btn-yellow w-full py-3 text-[0.6rem]"
                  onClick={handleLogin}
                >
                  Continue with Google
                </button>

                <div className="text-center mt-4">
                  <span className="text-[0.45rem] text-gray-500">Quick &amp; Secure 🔒</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default LoginPage;