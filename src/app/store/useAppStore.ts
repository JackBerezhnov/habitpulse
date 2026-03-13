import { create } from 'zustand';
import { supabase } from '../supabase';

export interface HabitProps {
  name: string;
  Type: string;
  UserID: string;
  documentID: string;
  Dates?: string[];
  currentStreak?: number;
}

export interface HabitDocument {
  $id: string;
  name: string;
  Type: string;
  UserID: string;
  Dates: string[];
  $createdAt?: string;
  $updatedAt?: string;
  streak?: number;
  lastCompleted?: string | null;
}

export interface User {
  $id: string;
  Name: string;
  Level: number;
  Experience: number;
  Strength: number;
  Agility: number;
  Inteligent: number;
}

type UserStat = 'Strength' | 'Agility' | 'Inteligent';

interface ProfileRow {
  id: string;
  name: string | null;
  level: number | null;
  experience: number | null;
  strength: number | null;
  agility: number | null;
  inteligent: number | null;
}

interface HabitRow {
  id: string;
  name: string;
  type: string;
  user_id: string;
  dates: string[] | null;
  created_at: string;
  updated_at: string;
}

interface AppState {
  // User state
  currentUser: User | null;
  currentUserID: string;
  userName: string;
  progressLevel: string;

  // Habits state
  habits: HabitDocument[];

  // Loading states
  isLoading: boolean;

  // Actions
  setCurrentUserID: (id: string) => void;
  setUserName: (name: string) => void;
  setCurrentUser: (user: User | null) => void;
  setHabits: (habits: HabitDocument[]) => void;
  setProgressLevel: (progress: string) => void;
  setLoading: (loading: boolean) => void;

  // Async actions
  fetchUser: () => Promise<void>;
  createUserAsPlayer: () => Promise<void>;
  getUser: () => Promise<void>;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: HabitProps) => Promise<void>;
  deleteHabit: (documentID: string) => Promise<void>;
  updateHabitDates: (habitId: string, dates: string[]) => Promise<void>;
  updateUserExperience: (newXP: number) => Promise<void>;
  updateUserLevel: (newLevel: number) => Promise<void>;
  updateUserStats: (statType: UserStat, newValue: number) => Promise<void>;
  calculateProgressToNextLevel: () => void;

  // Streak system
  calculateHabitStreak: (dates: string[]) => number;
  getStreakEmoji: (streak: number) => string;
  updateHabitStreak: (habitId: string) => Promise<void>;
}

const PROFILES_TABLE = process.env.NEXT_PUBLIC_SUPABASE_USER_TABLE ?? 'profiles';
const HABITS_TABLE = process.env.NEXT_PUBLIC_SUPABASE_HABITS_TABLE ?? 'habits';

const statColumnMap: Record<UserStat, keyof Pick<ProfileRow, 'strength' | 'agility' | 'inteligent'>> = {
  Strength: 'strength',
  Agility: 'agility',
  Inteligent: 'inteligent',
};

const calculateXP = (level: number) => {
  return 50 * Math.pow(level, 2);
};

const sortDatesDescending = (dates: string[]) => {
  return [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
};

const createDefaultUser = (id: string, name: string): User => ({
  $id: id,
  Name: name,
  Level: 1,
  Experience: 0,
  Strength: 0,
  Agility: 0,
  Inteligent: 0,
});

const mapProfileToUser = (profile: ProfileRow, fallbackName: string): User => ({
  $id: profile.id,
  Name: profile.name ?? fallbackName,
  Level: profile.level ?? 1,
  Experience: profile.experience ?? 0,
  Strength: profile.strength ?? 0,
  Agility: profile.agility ?? 0,
  Inteligent: profile.inteligent ?? 0,
});

const mapHabitRowToDocument = (
  habit: HabitRow,
  calculateHabitStreak: (dates: string[]) => number,
): HabitDocument => {
  const dates = habit.dates ?? [];
  const sortedDates = sortDatesDescending(dates);

  return {
    $id: habit.id,
    name: habit.name,
    Type: habit.type,
    UserID: habit.user_id,
    Dates: dates,
    $createdAt: habit.created_at,
    $updatedAt: habit.updated_at,
    lastCompleted: sortedDates[0] ?? null,
    streak: calculateHabitStreak(dates),
  };
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentUser: null,
  currentUserID: '',
  userName: '',
  progressLevel: '0',
  habits: [],
  isLoading: false,

  // Simple setters
  setCurrentUserID: (id) => set({ currentUserID: id }),
  setUserName: (name) => set({ userName: name }),
  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      get().calculateProgressToNextLevel();
    }
  },
  setHabits: (habits) => set({ habits }),
  setProgressLevel: (progress) => set({ progressLevel: progress }),
  setLoading: (loading) => set({ isLoading: loading }),

  // Async actions
  fetchUser: async () => {
    set({ isLoading: true });

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }

      const authUser = data.user;
      if (!authUser) {
        set({ currentUserID: '', userName: '', currentUser: null, isLoading: false });
        return;
      }

      const metadata = (authUser.user_metadata ?? {}) as { full_name?: string; name?: string };
      const displayName =
        metadata.full_name ??
        metadata.name ??
        authUser.email?.split('@')[0] ??
        'Player';

      set({ currentUserID: authUser.id, userName: displayName, isLoading: false });
    } catch (error) {
      console.error('Session check failed:', error);
      set({ currentUserID: '', userName: '', currentUser: null, isLoading: false });
    }
  },

  createUserAsPlayer: async () => {
    const { currentUserID, userName } = get();
    if (!currentUserID) return;

    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from(PROFILES_TABLE)
        .select('id')
        .eq('id', currentUserID)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (existingProfile) {
        return;
      }

      const { error: insertError } = await supabase.from(PROFILES_TABLE).insert({
        id: currentUserID,
        name: userName || 'Player',
        level: 1,
        experience: 0,
        strength: 0,
        agility: 0,
        inteligent: 0,
      });

      if (insertError) {
        throw insertError;
      }
    } catch (error) {
      console.log('User creation failed', error);
    }
  },

  getUser: async () => {
    const { currentUserID, userName } = get();
    if (!currentUserID) return;

    const fallbackName = userName || 'Player';

    // Internal retry helper function
    const fetchUserWithRetry = async (retryCount = 0): Promise<void> => {
      try {
        const { data: profile, error } = await supabase
          .from(PROFILES_TABLE)
          .select('id,name,level,experience,strength,agility,inteligent')
          .eq('id', currentUserID)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!profile) {
          if (retryCount < 3) {
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 500));
            return fetchUserWithRetry(retryCount + 1);
          }

          set({ currentUser: createDefaultUser(currentUserID, fallbackName) });
          get().calculateProgressToNextLevel();
          return;
        }

        set({ currentUser: mapProfileToUser(profile as ProfileRow, fallbackName) });
        get().calculateProgressToNextLevel();
      } catch (error) {
        if (retryCount < 3) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 500));
          return fetchUserWithRetry(retryCount + 1);
        }

        set({ currentUser: createDefaultUser(currentUserID, fallbackName) });
        get().calculateProgressToNextLevel();
      }
    };

    await fetchUserWithRetry();
  },

  fetchHabits: async () => {
    const { currentUserID } = get();
    if (!currentUserID) return;

    try {
      const { data, error } = await supabase
        .from(HABITS_TABLE)
        .select('id,name,type,user_id,dates,created_at,updated_at')
        .eq('user_id', currentUserID)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      const mappedHabits = (data ?? []).map((habit) =>
        mapHabitRowToDocument(habit as HabitRow, get().calculateHabitStreak),
      );

      set({ habits: mappedHabits });
    } catch (error) {
      console.error('Habit fetch failed', error);
    }
  },

  addHabit: async (newHabit: HabitProps) => {
    const { habits } = get();

    const optimisticHabit: HabitDocument = {
      $id: newHabit.documentID,
      name: newHabit.name,
      Type: newHabit.Type,
      UserID: newHabit.UserID,
      Dates: newHabit.Dates ?? [],
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      streak: 0,
      lastCompleted: null,
    };

    set({ habits: [...habits, optimisticHabit] });

    try {
      const { error } = await supabase.from(HABITS_TABLE).insert({
        id: newHabit.documentID,
        name: newHabit.name,
        type: newHabit.Type,
        user_id: newHabit.UserID,
        dates: newHabit.Dates ?? [],
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Habit creation failed', error);
      set({ habits: habits.filter((habit) => habit.$id !== newHabit.documentID) });
      await get().fetchHabits();
    }
  },

  deleteHabit: async (documentID: string) => {
    const { habits, currentUserID } = get();
    const habitToDelete = habits.find((habit) => habit.$id === documentID);

    set({ habits: habits.filter((habit) => habit.$id !== documentID) });

    try {
      let request = supabase.from(HABITS_TABLE).delete().eq('id', documentID);

      if (currentUserID) {
        request = request.eq('user_id', currentUserID);
      }

      const { error } = await request;

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Habit deletion failed', error);
      if (habitToDelete) {
        const { habits: latestHabits } = get();
        set({ habits: [...latestHabits, habitToDelete] });
      }
      await get().fetchHabits();
    }
  },

  updateHabitDates: async (habitId: string, dates: string[]) => {
    const { habits } = get();
    const sortedDates = sortDatesDescending(dates);

    const optimisticHabits = habits.map((habit) =>
      habit.$id === habitId
        ? {
            ...habit,
            Dates: dates,
            $updatedAt: new Date().toISOString(),
            streak: get().calculateHabitStreak(dates),
            lastCompleted: sortedDates[0] ?? null,
          }
        : habit,
    );

    set({ habits: optimisticHabits });

    try {
      const { error } = await supabase
        .from(HABITS_TABLE)
        .update({ dates })
        .eq('id', habitId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Habit date update failed', error);
      set({ habits });
      await get().fetchHabits();
    }
  },

  updateUserExperience: async (newXP: number) => {
    const { currentUserID, currentUser } = get();
    if (!currentUserID || !currentUser) return;

    const oldXP = currentUser.Experience;
    set({ currentUser: { ...currentUser, Experience: newXP } });
    get().calculateProgressToNextLevel();

    try {
      const { error } = await supabase
        .from(PROFILES_TABLE)
        .update({ experience: newXP })
        .eq('id', currentUserID);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Experience update failed', error);
      const restoredUser = { ...get().currentUser!, Experience: oldXP };
      set({ currentUser: restoredUser });
      get().calculateProgressToNextLevel();
    }
  },

  updateUserLevel: async (newLevel: number) => {
    const { currentUserID, currentUser } = get();
    if (!currentUserID || !currentUser) return;

    const oldLevel = currentUser.Level;
    set({ currentUser: { ...currentUser, Level: newLevel } });
    get().calculateProgressToNextLevel();

    try {
      const { error } = await supabase
        .from(PROFILES_TABLE)
        .update({ level: newLevel })
        .eq('id', currentUserID);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Level update failed', error);
      const restoredUser = { ...get().currentUser!, Level: oldLevel };
      set({ currentUser: restoredUser });
      get().calculateProgressToNextLevel();
    }
  },

  updateUserStats: async (statType: UserStat, newValue: number) => {
    const { currentUserID, currentUser } = get();
    if (!currentUserID || !currentUser) return;

    const column = statColumnMap[statType];
    const oldValue = currentUser[statType];

    set({ currentUser: { ...currentUser, [statType]: newValue } });

    try {
      const payload: Record<string, number> = { [column]: newValue };

      const { error } = await supabase
        .from(PROFILES_TABLE)
        .update(payload)
        .eq('id', currentUserID);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Stat update failed', error);
      set({ currentUser: { ...get().currentUser!, [statType]: oldValue } });
    }
  },

  calculateProgressToNextLevel: () => {
    const { currentUser } = get();
    if (!currentUser) return;

    const currentXP = currentUser.Experience;
    // For level 1, start from 0 XP instead of 50 XP
    const currentLevelXP = currentUser.Level === 1 ? 0 : calculateXP(currentUser.Level);
    const nextLevelXP = calculateXP(currentUser.Level + 1);
    const progressInPercentage = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

    // Ensure progress is never negative and cap at 100%
    const clampedProgress = Math.max(0, Math.min(100, progressInPercentage));

    set({ progressLevel: clampedProgress.toFixed(2) });
  },

  // Streak system implementation
  calculateHabitStreak: (dates: string[]) => {
    if (!dates || dates.length === 0) return 0;

    // Helper function to normalize date to local midnight
    const normalizeToLocalMidnight = (dateStr: string) => {
      const date = new Date(dateStr);
      // Create a new date using local timezone components
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    // Sort dates in descending order (most recent first) and normalize to local midnight
    const sortedDates = dates
      .map((dateStr) => normalizeToLocalMidnight(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());

    // Get today at local midnight
    const today = new Date();
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let streak = 0;
    let currentDate = new Date(todayNormalized);

    // Check if the most recent completion was today or yesterday
    const mostRecentDate = sortedDates[0];
    const daysDiff = Math.floor((todayNormalized.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));

    // If last completion was more than 1 day ago, streak is broken
    if (daysDiff > 1) return 0;

    // Count consecutive days
    for (const completionDate of sortedDates) {
      if (completionDate.getTime() === currentDate.getTime()) {
        streak += 1;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  },

  getStreakEmoji: (streak: number) => {
    if (streak === 0) return '💤'; // No streak
    if (streak === 1) return '🌱'; // Just started
    if (streak <= 3) return '🔥'; // Getting warmed up
    if (streak <= 7) return '⚡'; // One week!
    if (streak <= 14) return '💪'; // Two weeks strong
    if (streak <= 30) return '🏆'; // Monthly champion
    if (streak <= 60) return '👑'; // Royalty level
    if (streak <= 100) return '🚀'; // Sky high
    return '🌟'; // Legendary status
  },

  updateHabitStreak: async (_habitId: string) => {
    // Since streaks are calculated dynamically, we don't need to store them in DB.
    // This function remains to keep the component API stable.
  },
}));
