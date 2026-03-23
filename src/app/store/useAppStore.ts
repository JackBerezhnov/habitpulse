import { create } from 'zustand';
import { supabase } from '../supabase';

export interface HabitProps {
  name: string;
  Type: string;
  UserID: string;
  id: string;
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
  user_id?: string | null;
  name: string | null;
  level: number | null;
  experience: number | null;
  strength: number | null;
  agility: number | null;
  inteligent: number | null;
}

interface HabitRow {
  id?: string;
  document_id?: string;
  documentID?: string;
  name: string;
  type?: string | null;
  Type?: string | null;
  user_id?: string | null;
  UserID?: string | null;
  dates?: string[] | null;
  Dates?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

interface SupabaseErrorLike {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
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
  deleteHabit: (habitId: string) => Promise<void>;
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

const PROFILES_TABLE = process.env.NEXT_PUBLIC_SUPABASE_USER_TABLE ?? 'users';
const PROFILE_TABLE_CANDIDATES = Array.from(new Set([PROFILES_TABLE, 'users']));
const PROFILE_SELECT_COLUMNS = '*';
const PROFILE_SELECT_COLUMNS_WITH_USER_ID = '*';

type ProfileKeyColumn = 'id' | 'user_id';

interface ProfileStrategy {
  table: string;
  keyColumn: ProfileKeyColumn;
}

let profileStrategyCache: ProfileStrategy | null = null;

const HABITS_TABLE =
  process.env.NEXT_PUBLIC_SUPABASE_HABITS_TABLE ??
  process.env.NEXT_PUBLIC_SUPABASE_HABIT_TABLE ??
  'habit';

const statColumnMap: Record<UserStat, keyof Pick<ProfileRow, 'strength' | 'agility' | 'inteligent'>> = {
  Strength: 'strength',
  Agility: 'agility',
  Inteligent: 'inteligent',
};

const isSchemaMismatchError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;

  const supabaseError = error as SupabaseErrorLike;
  const message = `${supabaseError.message ?? ''} ${supabaseError.details ?? ''}`.toLowerCase();

  return (
    supabaseError.code === 'PGRST204' ||
    supabaseError.code === 'PGRST205' ||
    supabaseError.code === '42703' ||
    supabaseError.code === '42P01' ||
    message.includes('column') ||
    message.includes('relation') ||
    message.includes('schema cache') ||
    message.includes('could not find the table') ||
    message.includes('does not exist')
  );
};

const isRlsViolationError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;

  const supabaseError = error as SupabaseErrorLike;
  const message = `${supabaseError.message ?? ''} ${supabaseError.details ?? ''}`.toLowerCase();

  return supabaseError.code === '42501' || message.includes('row-level security');
};

const isUniqueViolationError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;

  const supabaseError = error as SupabaseErrorLike;
  const message = `${supabaseError.message ?? ''} ${supabaseError.details ?? ''}`.toLowerCase();

  return supabaseError.code === '23505' || message.includes('duplicate key');
};

const toErrorLog = (label: string, error: unknown) => {
  if (!error || typeof error !== 'object') {
    return `${label}: ${String(error)}`;
  }

  const supabaseError = error as SupabaseErrorLike;

  return `${label}: code=${supabaseError.code ?? 'unknown'} message=${supabaseError.message ?? 'unknown'} details=${supabaseError.details ?? 'n/a'} hint=${supabaseError.hint ?? 'n/a'}`;
};

const calculateXP = (level: number) => {
  return 50 * Math.pow(level, 2);
};

const sortDatesDescending = (dates: string[]) => {
  return [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
};

const getProfileStrategies = (): ProfileStrategy[] => {
  const allStrategies: ProfileStrategy[] = [];

  if (profileStrategyCache) {
    allStrategies.push(profileStrategyCache);
  }

  for (const table of PROFILE_TABLE_CANDIDATES) {
    allStrategies.push({ table, keyColumn: 'id' });
    allStrategies.push({ table, keyColumn: 'user_id' });
  }

  const seen = new Set<string>();

  return allStrategies.filter((strategy) => {
    const key = `${strategy.table}:${strategy.keyColumn}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const getProfileSelectColumns = (keyColumn: ProfileKeyColumn) => {
  return keyColumn === 'user_id' ? PROFILE_SELECT_COLUMNS_WITH_USER_ID : PROFILE_SELECT_COLUMNS;
};

const findProfileForUser = async (userId: string): Promise<ProfileRow | null> => {
  for (const strategy of getProfileStrategies()) {
    const { data, error } = await supabase
      .from(strategy.table)
      .select(getProfileSelectColumns(strategy.keyColumn))
      .eq(strategy.keyColumn, userId)
      .maybeSingle();

    if (error) {
      if (isSchemaMismatchError(error)) {
        continue;
      }

      throw error;
    }

    if (data) {
      profileStrategyCache = strategy;
      return data as unknown as ProfileRow;
    }
  }

  return null;
};

const createProfileForUser = async (userId: string, name: string): Promise<void> => {
  const existingProfile = await findProfileForUser(userId);
  if (existingProfile) {
    return;
  }

  const basePayload = {
    id: userId,
    name: name || 'Player',
    level: 1,
    experience: 0,
    strength: 0,
    agility: 0,
    inteligent: 0,
  };

  let lastError: unknown = null;

  for (const strategy of getProfileStrategies()) {
    const payload =
      strategy.keyColumn === 'user_id' ? { ...basePayload, user_id: userId } : basePayload;

    const { error } = await supabase.from(strategy.table).insert(payload);

    if (!error || isUniqueViolationError(error)) {
      profileStrategyCache = strategy;
      return;
    }

    if (isSchemaMismatchError(error) || isRlsViolationError(error)) {
      lastError = error;
      continue;
    }

    throw error;
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Failed to create player profile for all known table schemas.');
};

const updateProfileForUser = async (
  userId: string,
  payload: Record<string, number | string>,
  fallbackName = 'Player',
): Promise<void> => {
  let lastError: unknown = null;

  const tryUpdate = async (): Promise<boolean> => {
    for (const strategy of getProfileStrategies()) {
      const { data, error } = await supabase
        .from(strategy.table)
        .update(payload)
        .eq(strategy.keyColumn, userId)
        .select('id')
        .maybeSingle();

      if (error) {
        if (isSchemaMismatchError(error) || isRlsViolationError(error)) {
          lastError = error;
          continue;
        }

        throw error;
      }

      if (data) {
        profileStrategyCache = strategy;
        return true;
      }
    }

    return false;
  };

  if (await tryUpdate()) {
    return;
  }

  await createProfileForUser(userId, fallbackName);

  if (await tryUpdate()) {
    return;
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Failed to update player profile for all known table schemas.');
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
  $id: profile.user_id ?? profile.id,
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
  const dates = habit.dates ?? habit.Dates ?? [];
  const sortedDates = sortDatesDescending(dates);
  const habitId = habit.id ?? habit.document_id ?? habit.documentID ?? '';

  return {
    $id: habitId,
    name: habit.name,
    Type: habit.type ?? habit.Type ?? 'Strength',
    UserID: habit.user_id ?? habit.UserID ?? '',
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
  isLoading: true,

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

    const maxAttempts = 3;
    const retryDelayMs = 300;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          throw error;
        }

        const authUser = data.user;
        if (!authUser) {
          if (attempt < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
            continue;
          }

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
        return;
      } catch (error) {
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
          continue;
        }

        console.error('Session check failed:', error);
        set({ currentUserID: '', userName: '', currentUser: null, isLoading: false });
        return;
      }
    }
  },

  createUserAsPlayer: async () => {
    const { currentUserID, userName } = get();
    if (!currentUserID) return;

    try {
      await createProfileForUser(currentUserID, userName || 'Player');
    } catch (error) {
      console.log('User creation failed', error);
    }
  },

  getUser: async () => {
    const { currentUserID, userName } = get();
    if (!currentUserID) return;

    const fallbackName = userName || 'Player';

    const fetchUserWithRetry = async (retryCount = 0): Promise<void> => {
      try {
        const profile = await findProfileForUser(currentUserID);

        if (!profile) {
          if (retryCount < 3) {
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, retryCount) * 500));
            return fetchUserWithRetry(retryCount + 1);
          }

          await createProfileForUser(currentUserID, fallbackName);
          const created = await findProfileForUser(currentUserID);
          set({ currentUser: created ? mapProfileToUser(created, fallbackName) : createDefaultUser(currentUserID, fallbackName) });
          get().calculateProgressToNextLevel();
          return;
        }

        set({ currentUser: mapProfileToUser(profile, fallbackName) });
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
      let data: HabitRow[] | null = null;
      let error: unknown = null;

      const modernResult = await supabase
        .from(HABITS_TABLE)
        .select('id,document_id,name,type,user_id,dates,created_at,updated_at')
        .eq('user_id', currentUserID)
        .order('created_at', { ascending: false })
        .limit(50);

      data = modernResult.data as HabitRow[] | null;
      error = modernResult.error;

      // Support legacy table shape used by early migrations: documentID/Type/UserID/Dates.
      if (error && isSchemaMismatchError(error)) {
        const legacyResult = await supabase
          .from(HABITS_TABLE)
          .select('document_id,name,type,user_id,dates,created_at,updated_at')
          .eq('user_id', currentUserID)
          .limit(50);

        data = legacyResult.data;
        error = legacyResult.error;
      }

      if (error) {
        throw error;
      }

      const mappedHabits = (data ?? []).map((habit) =>
        mapHabitRowToDocument(habit as HabitRow, get().calculateHabitStreak),
      );

      set({ habits: mappedHabits });
    } catch (error) {
      console.error(toErrorLog('Habit fetch failed', error));
    }
  },

  addHabit: async (newHabit: HabitProps) => {
    const { habits, currentUserID } = get();

    let effectiveUserId = currentUserID;
    if (!effectiveUserId) {
      const { data } = await supabase.auth.getUser();
      effectiveUserId = data.user?.id ?? '';
    }

    if (!effectiveUserId) {
      console.error('Habit creation failed: missing authenticated user id');
      return;
    }

    const optimisticHabit: HabitDocument = {
      $id: newHabit.id,
      name: newHabit.name,
      Type: newHabit.Type,
      UserID: effectiveUserId,
      Dates: newHabit.Dates ?? [],
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      streak: 0,
      lastCompleted: null,
    };

    set({ habits: [...habits, optimisticHabit] });

    try {
      let { error } = await supabase.from(HABITS_TABLE).insert({
        id: newHabit.id,
        name: newHabit.name,
        type: newHabit.Type,
        user_id: effectiveUserId,
        dates: newHabit.Dates ?? [],
      });

      // Support legacy table shape used by early migrations: documentID/Type/UserID/Dates.
      if (error && (isSchemaMismatchError(error) || isRlsViolationError(error))) {
        const legacyInsert = await supabase.from(HABITS_TABLE).insert({
          document_id: newHabit.id,
          name: newHabit.name,
          type: newHabit.Type,
          user_id: effectiveUserId,
          dates: newHabit.Dates ?? [],
        });

        error = legacyInsert.error;
      }

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(toErrorLog('Habit creation failed', error));
      if (isRlsViolationError(error)) {
        console.error(
          `RLS hint: verify INSERT policy on table ${HABITS_TABLE} allows auth.uid() to match the inserted user id column (user_id or UserID).`,
        );
      }
      set({ habits: habits.filter((habit) => habit.$id !== newHabit.id) });
      await get().fetchHabits();
    }
  },

  deleteHabit: async (habitId: string) => {
    const { habits, currentUserID } = get();
    const habitToDelete = habits.find((habit) => habit.$id === habitId);

    set({ habits: habits.filter((habit) => habit.$id !== habitId) });

    try {
      let request = supabase.from(HABITS_TABLE).delete().eq('id', habitId);

      if (currentUserID) {
        request = request.eq('user_id', currentUserID);
      }

      let { error } = await request;

      if (error && isSchemaMismatchError(error)) {
        let legacyRequest = supabase.from(HABITS_TABLE).delete().eq('document_id', habitId);

        if (currentUserID) {
          legacyRequest = legacyRequest.eq('UserID', currentUserID);
        }

        const legacyDelete = await legacyRequest;
        error = legacyDelete.error;
      }

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(toErrorLog('Habit deletion failed', error));
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
      let { error } = await supabase
        .from(HABITS_TABLE)
        .update({ dates })
        .eq('id', habitId);

      if (error && isSchemaMismatchError(error)) {
        const legacyUpdate = await supabase
          .from(HABITS_TABLE)
          .update({ Dates: dates })
          .eq('document_id', habitId);

        error = legacyUpdate.error;
      }

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(toErrorLog('Habit date update failed', error));
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
      await updateProfileForUser(currentUserID, { experience: newXP }, currentUser.Name);
    } catch (error) {
      console.error(toErrorLog('Experience update failed', error));
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
      await updateProfileForUser(currentUserID, { level: newLevel }, currentUser.Name);
    } catch (error) {
      console.error(toErrorLog('Level update failed', error));
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
      await updateProfileForUser(currentUserID, { [column]: newValue }, currentUser.Name);
    } catch (error) {
      console.error(toErrorLog('Stat update failed', error));
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
