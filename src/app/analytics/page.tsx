"use client"
import React from 'react';
import MainLayout from '../components/MainLayout';
import { useAppStore } from '../store/useAppStore';

export default function AnalyticsPage() {
  const { habits, userName, currentUser } = useAppStore();

  const completedHabitsToday = habits.filter(habit => {
    if (!habit.lastCompleted) return false;
    const today = new Date().toDateString();
    const lastCompleted = new Date(habit.lastCompleted).toDateString();
    return today === lastCompleted;
  }).length;

  const totalStreaks = habits.reduce((sum, habit) => sum + (habit.streak ?? 0), 0);
  const averageStreak = habits.length > 0 ? Math.round(totalStreaks / habits.length) : 0;

  return (
    <MainLayout>
      <div className="p-3 sm:p-6 max-w-5xl mx-auto w-full">
        <div className="pixel-panel p-4 mb-4">
          <h1 className="text-[0.85rem] text-[#e6b636]">📊 Analytics</h1>
          <p className="text-[0.5rem] text-[#524c7d] mt-1">Track your habit progress and insights</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="pixel-panel p-4 text-center">
            <span className="text-2xl mb-2 block">✅</span>
            <p className="text-[0.5rem] text-[#524c7d]">Total Habits</p>
            <p className="text-lg text-[#e6b636]">{habits.length}</p>
            <p className="text-[0.45rem] text-[#524c7d]/70">Active quests</p>
          </div>

          <div className="pixel-panel p-4 text-center">
            <span className="text-2xl mb-2 block">⚡</span>
            <p className="text-[0.5rem] text-[#524c7d]">Completed Today</p>
            <p className="text-lg text-[#3fbf3f]">{completedHabitsToday}</p>
            <p className="text-[0.45rem] text-[#524c7d]/70">Out of {habits.length} quests</p>
          </div>

          <div className="pixel-panel p-4 text-center">
            <span className="text-2xl mb-2 block">🔥</span>
            <p className="text-[0.5rem] text-[#524c7d]">Total Streaks</p>
            <p className="text-lg text-[#e6b636]">{totalStreaks}</p>
            <p className="text-[0.45rem] text-[#524c7d]/70">Combined streak days</p>
          </div>

          <div className="pixel-panel p-4 text-center">
            <span className="text-2xl mb-2 block">⚔️</span>
            <p className="text-[0.5rem] text-[#524c7d]">Current Level</p>
            <p className="text-lg text-[#3f8fcf]">{currentUser?.Level || 1}</p>
            <p className="text-[0.45rem] text-[#524c7d]/70">Keep growing!</p>
          </div>
        </div>

        {/* Habit Breakdown */}
        <div className="pixel-panel p-4">
          <h2 className="text-[0.7rem] text-[#e6b636] mb-4">Habit Breakdown</h2>
          <div className="space-y-3">
            {habits.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[0.6rem] text-[#524c7d]">No habits to analyze yet</p>
                <p className="text-[0.5rem] text-[#524c7d]/70">Create some quests to see analytics</p>
              </div>
            ) : (
              habits.map((habit) => {
                const streak = habit.streak ?? 0;

                return <div key={habit.$id} className="quest-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#e6b636] text-sm">▶</span>
                    <span className="text-[0.55rem]">{habit.name}</span>
                    <span className="pixel-btn pixel-btn-outline text-[0.4rem] py-0.5 px-2">{habit.Type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[0.55rem]">
                    <span className="text-[#524c7d]">Streak:</span>
                    <span className="text-[#e6b636]">{streak}</span>
                    {streak >= 30 && <span>🏆</span>}
                    {streak >= 14 && streak < 30 && <span>💪</span>}
                    {streak >= 7 && streak < 14 && <span>⚡</span>}
                    {streak >= 3 && streak < 7 && <span>🔥</span>}
                    {streak >= 1 && streak < 3 && <span>🌱</span>}
                  </div>
                </div>;
              })
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
