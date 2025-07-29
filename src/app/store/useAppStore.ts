import { create } from 'zustand';
import { Models } from 'appwrite';
import { databases, account, ID } from '../appwrite';

export interface HabitProps {
  name: string;
  Type: string;
  UserID: string;
  documentID: string;
  Dates?: string[];
  currentStreak?: number;
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

interface AppState {
  // User state
  currentUser: User | null;
  currentUserID: string;
  userName: string;
  progressLevel: string;
  
  // Habits state
  habits: Models.Document[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setCurrentUserID: (id: string) => void;
  setUserName: (name: string) => void;
  setCurrentUser: (user: User | null) => void;
  setHabits: (habits: Models.Document[]) => void;
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
  updateUserStats: (statType: string, newValue: number) => Promise<void>;
  calculateProgressToNextLevel: () => void;
  
  // Streak system
  calculateHabitStreak: (dates: string[]) => number;
  getStreakEmoji: (streak: number) => string;
  updateHabitStreak: (habitId: string) => Promise<void>;
}

const calculateXP = (level: number) => {
  return 50 * Math.pow(level, 2);
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
      // Check if session exists first to avoid 401 errors
      const userSession = await account.getSession('current').catch(e => null);
      
      if (userSession) {
        // Session exists, now safely get user data
        const currentUser = await account.get();
        const userId = currentUser.$id;
        set({ currentUserID: userId, userName: currentUser.name, isLoading: false });
      } else {
        // No session found - clear user state
        set({ currentUserID: '', userName: '', currentUser: null, isLoading: false });
      }
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Document not found — this is normal for new users.');
      }
      // Silently handle session check errors
      set({ currentUserID: '', userName: '', currentUser: null, isLoading: false });
    }
  },

  createUserAsPlayer: async () => {
    const { currentUserID, userName } = get();
    if (!currentUserID) return;

    // Check if user already exists
    try {
      await databases.getDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
      `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
        `${currentUserID}`
      );
      // User already exists, no need to create
      return;
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Document not found — this is normal for new users.');
      }
      // User doesn't exist, proceed with creation
    }

    try {
      // Create new user document
      await databases.createDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
        `${currentUserID}`,
        {
          userID: `${currentUserID}`,
          Name: `${userName}`
        }
      );
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Document not found — this is normal for new users.');
      }
      console.log("User creation failed", error);
      // Silently handle user creation errors
    }
  },

  getUser: async () => {
    const { currentUserID } = get();
    if (!currentUserID) return;

    // Internal retry helper function
    const fetchUserWithRetry = async (retryCount = 0): Promise<void> => {
      try {
        const userDoc = await databases.getDocument(
          `${process.env.NEXT_PUBLIC_DB}`,
          `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
          `${currentUserID}`
        );
        
        // Properly extract user data from Appwrite document
        const user: User = {
          $id: userDoc.$id,
          Name: userDoc.Name || 'Player',
          Level: userDoc.Level || 1,
          Experience: userDoc.Experience || 0,
          Strength: userDoc.Strength || 0,
          Agility: userDoc.Agility || 0,
          Inteligent: userDoc.Inteligent || 0
        };
        
        set({ currentUser: user });
        get().calculateProgressToNextLevel();
      } catch (error: any) {
        if(error.code === 404) {
          // Expected behavior for newly created users
          console.log("User not found, retrying...");
        }
        // Retry logic for newly created users (race condition)
        if (retryCount < 3) {
          console.log(`Retrying getUser, attempt ${retryCount + 1}`);
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 500));
          return await fetchUserWithRetry(retryCount + 1);
        }
        
        // If all retries failed, create default user state
        set({ 
          currentUser: {
            $id: currentUserID,
            Name: get().userName || 'Player',
            Level: 1,
            Experience: 0,
            Strength: 0,
            Agility: 0,
            Inteligent: 0
          } as User
        });
        get().calculateProgressToNextLevel();
      }
    };

    await fetchUserWithRetry();
  },

  fetchHabits: async () => {
    const { currentUserID } = get();
    if (!currentUserID) return;

    try {
      const response = await databases.listDocuments(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_COLLECTION}`
      );

      const userHabits = response.documents.filter(
        habit => habit.userID === currentUserID
      );

      set({ habits: userHabits });
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Document not found — this is normal for new users.');
      }
      // Silently handle habit fetch errors
    }
  },

  addHabit: async (newHabit: HabitProps) => {
    try {
      // Add to local state immediately for instant UI update
      const { habits } = get();
      const newHabitDocument = {
        ...newHabit,
        $id: newHabit.documentID,
        $collectionId: process.env.NEXT_PUBLIC_DB_COLLECTION || '',
        $databaseId: process.env.NEXT_PUBLIC_DB || '',
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
        $permissions: [],
        Dates: []
      } as Models.Document;
      const updatedHabits = [...habits, newHabitDocument];
      set({ habits: updatedHabits });
      
      // Save to database in background
      await databases.createDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
        `${newHabit.documentID}`,
        newHabit,
      );
      
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Document not found — this is normal for new users.');
      }
      // Silently handle habit creation errors
      const { habits } = get();
      const revertedHabits = habits.filter(h => h.$id !== newHabit.documentID);
      set({ habits: revertedHabits });
      await get().fetchHabits();
    }
  },

  deleteHabit: async (documentID: string) => {
    // Store habit to delete for potential restoration
    const { habits } = get();
    const habitToDelete = habits.find(h => h.$id === documentID);
    
    try {
      // Remove from local state immediately for instant UI update
      const updatedHabits = habits.filter(habit => habit.$id !== documentID);
      set({ habits: updatedHabits });
      
      // Delete from database in background
      await databases.deleteDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
        `${documentID}`
      );
      
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Document not found — this is normal for new users.');
      }
      // Silently handle habit deletion errors
      if (habitToDelete) {
        const { habits: currentHabits } = get();
        const restoredHabits = [...currentHabits, habitToDelete];
        set({ habits: restoredHabits });
      }
      await get().fetchHabits();
    }
  },

  updateHabitDates: async (habitId: string, dates: string[]) => {
    try {
      await databases.updateDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
        `${habitId}`,
        { Dates: dates }
      );

      // Update local state
      const { habits } = get();
      const updatedHabits = habits.map(habit => 
        habit.$id === habitId ? { ...habit, Dates: dates } : habit
      );
      set({ habits: updatedHabits });
      
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Document not found — this is normal for new users.');
      }
      // Silently handle habit update errors
    }
  },

  updateUserExperience: async (newXP: number) => {
    const { currentUserID, currentUser } = get();
    if (!currentUserID || !currentUser) return;

    const oldXP = currentUser.Experience;
    
    try {
      // Update local state immediately for instant UI update
      const updatedUser = { ...currentUser, Experience: newXP };
      set({ currentUser: updatedUser });
      get().calculateProgressToNextLevel();
      
      // Update database in background
      await databases.updateDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
        `${currentUserID}`,
        { Experience: newXP }
      );
      
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Document not found — this is normal for new users.');
      }
      // Silently handle user experience update errors
      const revertedUser = { ...get().currentUser!, Experience: oldXP };
      set({ currentUser: revertedUser });
      get().calculateProgressToNextLevel();
    }
  },

  updateUserLevel: async (newLevel: number) => {
    const { currentUserID, currentUser } = get();
    if (!currentUserID || !currentUser) return;

    const oldLevel = currentUser.Level;
    
    try {
      // Update local state immediately for instant UI update
      const updatedUser = { ...currentUser, Level: newLevel };
      set({ currentUser: updatedUser });
      get().calculateProgressToNextLevel();
      
      // Update database in background
      await databases.updateDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
        `${currentUserID}`,
        { Level: newLevel }
      );
      
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Document not found — this is normal for new users.');
      }
      // Silently handle user level update errors
      const revertedUser = { ...get().currentUser!, Level: oldLevel };
      set({ currentUser: revertedUser });
      get().calculateProgressToNextLevel();
    }
  },

  updateUserStats: async (statType: string, newValue: number) => {
    const { currentUserID, currentUser } = get();
    if (!currentUserID || !currentUser) return;

    const oldValue = (currentUser as any)[statType];
    
    try {
      // Update local state immediately for instant UI update
      const updatedUser = { ...currentUser, [statType]: newValue };
      set({ currentUser: updatedUser });
      
      // Update database in background
      await databases.updateDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
        `${currentUserID}`,
        { [statType]: newValue }
      );
      
    } catch (error: any) {
      if (error.code === 404) {
        console.log('Document not found — this is normal for new users.');
      }
      // Silently handle user stats update errors
      const revertedUser = { ...get().currentUser!, [statType]: oldValue };
      set({ currentUser: revertedUser });
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
      .map(dateStr => normalizeToLocalMidnight(dateStr))
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
        streak++;
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

  updateHabitStreak: async (habitId: string) => {
    // Since streaks are calculated dynamically, we don't need to store them in DB
    // This function is kept for compatibility but doesn't do database updates
  },
}));
