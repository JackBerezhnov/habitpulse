import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase before importing the store
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}));

import { useAppStore } from '../store/useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useAppStore.setState({
      currentUser: null,
      currentUserID: '',
      userName: '',
      progressLevel: '0',
      habits: [],
      isLoading: true,
    });
  });

  describe('simple setters', () => {
    it('setCurrentUserID updates the user ID', () => {
      useAppStore.getState().setCurrentUserID('user-123');
      expect(useAppStore.getState().currentUserID).toBe('user-123');
    });

    it('setUserName updates the user name', () => {
      useAppStore.getState().setUserName('Alice');
      expect(useAppStore.getState().userName).toBe('Alice');
    });

    it('setLoading updates the loading state', () => {
      useAppStore.getState().setLoading(false);
      expect(useAppStore.getState().isLoading).toBe(false);
    });

    it('setHabits replaces the habits array', () => {
      const habits = [
        {
          $id: 'h1',
          name: 'Exercise',
          Type: 'Strength',
          UserID: 'u1',
          Dates: [],
          streak: 0,
          lastCompleted: null,
        },
      ];
      useAppStore.getState().setHabits(habits);
      expect(useAppStore.getState().habits).toEqual(habits);
    });

    it('setProgressLevel updates progress', () => {
      useAppStore.getState().setProgressLevel('42.50');
      expect(useAppStore.getState().progressLevel).toBe('42.50');
    });

    it('setCurrentUser sets user and calculates progress', () => {
      const user = {
        $id: 'u1',
        Name: 'Alice',
        Level: 2,
        Experience: 100,
        Strength: 5,
        Agility: 3,
        Inteligent: 2,
      };
      useAppStore.getState().setCurrentUser(user);
      expect(useAppStore.getState().currentUser).toEqual(user);
      // Progress should have been calculated (not the initial '0')
      expect(useAppStore.getState().progressLevel).not.toBe('0');
    });
  });

  describe('calculateHabitStreak', () => {
    const { calculateHabitStreak } = useAppStore.getState();

    // Format a Date as a local-time string that survives new Date() → local normalization.
    // Using T12:00:00 (no Z) ensures local noon → correct local date in any timezone.
    const toLocalDateStr = (d: Date): string => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}T12:00:00`;
    };

    it('returns 0 for empty dates', () => {
      expect(calculateHabitStreak([])).toBe(0);
    });

    it('returns 0 for null/undefined dates', () => {
      expect(calculateHabitStreak(null as unknown as string[])).toBe(0);
    });

    it('returns 1 when only today is completed', () => {
      const today = new Date();
      expect(calculateHabitStreak([toLocalDateStr(today)])).toBe(1);
    });

    it('returns correct streak for consecutive days ending today', () => {
      const dates: string[] = [];
      const today = new Date();
      for (let i = 0; i < 5; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(toLocalDateStr(d));
      }
      expect(calculateHabitStreak(dates)).toBe(5);
    });

    it('returns 0 for consecutive days ending yesterday (today not completed)', () => {
      // Note: the current implementation only counts streaks starting from today.
      // If today is not completed, the streak is 0 even if yesterday was.
      const dates: string[] = [];
      const today = new Date();
      for (let i = 1; i <= 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dates.push(toLocalDateStr(d));
      }
      expect(calculateHabitStreak(dates)).toBe(0);
    });

    it('returns 0 when last completion was more than 1 day ago', () => {
      const today = new Date();
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      expect(calculateHabitStreak([toLocalDateStr(threeDaysAgo)])).toBe(0);
    });

    it('breaks streak on non-consecutive days', () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const dates = [
        toLocalDateStr(today),
        // skip yesterday
        toLocalDateStr(twoDaysAgo),
        toLocalDateStr(threeDaysAgo),
      ];
      expect(calculateHabitStreak(dates)).toBe(1);
    });
  });

  describe('getStreakEmoji', () => {
    const { getStreakEmoji } = useAppStore.getState();

    it('returns sleeping emoji for 0', () => {
      expect(getStreakEmoji(0)).toBe('💤');
    });

    it('returns seedling for 1', () => {
      expect(getStreakEmoji(1)).toBe('🌱');
    });

    it('returns fire for 2-3', () => {
      expect(getStreakEmoji(2)).toBe('🔥');
      expect(getStreakEmoji(3)).toBe('🔥');
    });

    it('returns lightning for 4-7', () => {
      expect(getStreakEmoji(4)).toBe('⚡');
      expect(getStreakEmoji(7)).toBe('⚡');
    });

    it('returns muscle for 8-14', () => {
      expect(getStreakEmoji(8)).toBe('💪');
      expect(getStreakEmoji(14)).toBe('💪');
    });

    it('returns trophy for 15-30', () => {
      expect(getStreakEmoji(15)).toBe('🏆');
      expect(getStreakEmoji(30)).toBe('🏆');
    });

    it('returns crown for 31-60', () => {
      expect(getStreakEmoji(31)).toBe('👑');
      expect(getStreakEmoji(60)).toBe('👑');
    });

    it('returns rocket for 61-100', () => {
      expect(getStreakEmoji(61)).toBe('🚀');
      expect(getStreakEmoji(100)).toBe('🚀');
    });

    it('returns star for 101+', () => {
      expect(getStreakEmoji(101)).toBe('🌟');
      expect(getStreakEmoji(500)).toBe('🌟');
    });
  });

  describe('calculateProgressToNextLevel', () => {
    it('calculates progress for level 1 user', () => {
      useAppStore.setState({
        currentUser: {
          $id: 'u1',
          Name: 'Alice',
          Level: 1,
          Experience: 100,
          Strength: 0,
          Agility: 0,
          Inteligent: 0,
        },
      });

      useAppStore.getState().calculateProgressToNextLevel();

      const progress = parseFloat(useAppStore.getState().progressLevel);
      // Level 1 starts at 0 XP, next level (2) requires 50 * 2^2 = 200 XP
      // Progress = (100 - 0) / (200 - 0) * 100 = 50%
      expect(progress).toBeCloseTo(50, 1);
    });

    it('calculates progress for higher-level user', () => {
      useAppStore.setState({
        currentUser: {
          $id: 'u1',
          Name: 'Bob',
          Level: 3,
          Experience: 500,
          Strength: 0,
          Agility: 0,
          Inteligent: 0,
        },
      });

      useAppStore.getState().calculateProgressToNextLevel();

      const progress = parseFloat(useAppStore.getState().progressLevel);
      // Level 3 XP: 50 * 9 = 450, Level 4 XP: 50 * 16 = 800
      // Progress = (500 - 450) / (800 - 450) * 100 ≈ 14.28%
      expect(progress).toBeCloseTo(14.29, 0);
    });

    it('clamps progress to 0-100%', () => {
      useAppStore.setState({
        currentUser: {
          $id: 'u1',
          Name: 'Charlie',
          Level: 2,
          Experience: 0,
          Strength: 0,
          Agility: 0,
          Inteligent: 0,
        },
      });

      useAppStore.getState().calculateProgressToNextLevel();

      const progress = parseFloat(useAppStore.getState().progressLevel);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('does nothing when currentUser is null', () => {
      useAppStore.setState({ currentUser: null, progressLevel: '0' });
      useAppStore.getState().calculateProgressToNextLevel();
      expect(useAppStore.getState().progressLevel).toBe('0');
    });
  });
});
