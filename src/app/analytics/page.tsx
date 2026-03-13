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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-base-content">Analytics</h1>
          <p className="text-base-content/70 mt-2">Track your habit progress and insights</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-primary">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-title">Total Habits</div>
            <div className="stat-value text-primary">{habits.length}</div>
            <div className="stat-desc">Active habits</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-success">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="stat-title">Completed Today</div>
            <div className="stat-value text-success">{completedHabitsToday}</div>
            <div className="stat-desc">Out of {habits.length} habits</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-warning">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div className="stat-title">Total Streaks</div>
            <div className="stat-value text-warning">{totalStreaks}</div>
            <div className="stat-desc">Combined streak days</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-info">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="stat-title">Current Level</div>
            <div className="stat-value text-info">{currentUser?.Level || 1}</div>
            <div className="stat-desc">Keep growing!</div>
          </div>
        </div>

        {/* Habit Breakdown */}
        <div className="bg-base-100 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Habit Breakdown</h2>
          <div className="space-y-4">
            {habits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-base-content/70">No habits to analyze yet</p>
                <p className="text-sm text-base-content/50">Create some habits to see analytics</p>
              </div>
            ) : (
              habits.map((habit) => {
                const streak = habit.streak ?? 0;

                return <div key={habit.$id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <span className="font-medium">{habit.name}</span>
                    <span className="badge badge-outline">{habit.Type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-base-content/70">Streak:</span>
                    <span className="font-bold">{streak}</span>
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
