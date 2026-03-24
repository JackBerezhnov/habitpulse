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
          <h1 className="text-[0.85rem] text-yellow-400">📊 Analytics</h1>
          <p className="text-[0.5rem] text-gray-400 mt-1">Track your habit progress and insights</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="pixel-panel p-4 text-center">
            <span className="text-2xl mb-2 block">✅</span>
            <p className="text-[0.5rem] text-gray-400">Total Habits</p>
            <p className="text-lg text-yellow-400">{habits.length}</p>
            <p className="text-[0.45rem] text-gray-500">Active quests</p>
          </div>

          <div className="pixel-panel p-4 text-center">
            <span className="text-2xl mb-2 block">⚡</span>
            <p className="text-[0.5rem] text-gray-400">Completed Today</p>
            <p className="text-lg text-green-400">{completedHabitsToday}</p>
            <p className="text-[0.45rem] text-gray-500">Out of {habits.length} quests</p>
          </div>

          <div className="pixel-panel p-4 text-center">
            <span className="text-2xl mb-2 block">🔥</span>
            <p className="text-[0.5rem] text-gray-400">Total Streaks</p>
            <p className="text-lg text-orange-400">{totalStreaks}</p>
            <p className="text-[0.45rem] text-gray-500">Combined streak days</p>
          </div>

          <div className="pixel-panel p-4 text-center">
            <span className="text-2xl mb-2 block">⚔️</span>
            <p className="text-[0.5rem] text-gray-400">Current Level</p>
            <p className="text-lg text-blue-400">{currentUser?.Level || 1}</p>
            <p className="text-[0.45rem] text-gray-500">Keep growing!</p>
          </div>
        </div>

        {/* Habit Breakdown */}
        <div className="pixel-panel p-4">
          <h2 className="text-[0.7rem] text-yellow-400 mb-4">Habit Breakdown</h2>
          <div className="space-y-3">
            {habits.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[0.6rem] text-gray-400">No habits to analyze yet</p>
                <p className="text-[0.5rem] text-gray-500">Create some quests to see analytics</p>
              </div>
            ) : (
              habits.map((habit) => {
                const streak = habit.streak ?? 0;

                return <div key={habit.$id} className="quest-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400 text-sm">▶</span>
                    <span className="text-[0.55rem]">{habit.name}</span>
                    <span className="pixel-btn pixel-btn-outline text-[0.4rem] py-0.5 px-2">{habit.Type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[0.55rem]">
                    <span className="text-gray-400">Streak:</span>
                    <span className="text-yellow-400">{streak}</span>
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
