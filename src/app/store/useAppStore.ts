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
    try {
      const currentUser = await account.get();
      const userId = currentUser.$id;
      set({ currentUserID: userId, userName: currentUser.name });
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  },

  createUserAsPlayer: async () => {
    const { currentUserID, userName } = get();
    if (!currentUserID) return;

    try {
      await databases.createDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
        `${currentUserID}`,
        {
          userID: `${currentUserID}`,
          Name: `${userName}`
        }
      );
    } catch (error) {
      // User might already exist, which is fine
      console.log('User creation result:', error);
    }
  },

  getUser: async () => {
    const { currentUserID } = get();
    if (!currentUserID) return;

    try {
      const user = await databases.getDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
        `${currentUserID}`
      );
      set({ currentUser: user as unknown as User });
      get().calculateProgressToNextLevel();
    } catch (error) {
      console.error('Failed to get user:', error);
    }
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
        habit => habit.UserID === currentUserID
      );

      set({ habits: userHabits });
    } catch (error) {
      console.error('Failed to fetch habits:', error);
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
      
    } catch (error) {
      console.error('Failed to add habit:', error);
      // If there's an error, remove from local state and refetch
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
      
    } catch (error) {
      console.error('Failed to delete habit:', error);
      // If there's an error, restore the habit and refetch
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
      
    } catch (error) {
      console.error('Failed to update habit dates:', error);
    }
  },

  updateUserExperience: async (newXP: number) => {
    const { currentUserID, currentUser } = get();
    if (!currentUserID || !currentUser) return;

    try {
      await databases.updateDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
        `${currentUserID}`,
        { Experience: newXP }
      );

      // Update local state
      const updatedUser = { ...currentUser, Experience: newXP };
      set({ currentUser: updatedUser });
      get().calculateProgressToNextLevel();
      
    } catch (error) {
      console.error('Failed to update user experience:', error);
    }
  },

  updateUserLevel: async (newLevel: number) => {
    const { currentUserID, currentUser } = get();
    if (!currentUserID || !currentUser) return;

    try {
      await databases.updateDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
        `${currentUserID}`,
        { Level: newLevel }
      );

      // Update local state
      const updatedUser = { ...currentUser, Level: newLevel };
      set({ currentUser: updatedUser });
      get().calculateProgressToNextLevel();
      
    } catch (error) {
      console.error('Failed to update user level:', error);
    }
  },

  updateUserStats: async (statType: string, newValue: number) => {
    const { currentUserID, currentUser } = get();
    if (!currentUserID || !currentUser) return;

    try {
      await databases.updateDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_USER_COLLECTION}`,
        `${currentUserID}`,
        { [statType]: newValue }
      );

      // Update local state
      const updatedUser = { ...currentUser, [statType]: newValue };
      set({ currentUser: updatedUser });
      
    } catch (error) {
      console.error(`Failed to update user ${statType}:`, error);
    }
  },

  calculateProgressToNextLevel: () => {
    const { currentUser } = get();
    if (!currentUser) return;

    const currentXP = currentUser.Experience;
    const currentLevelXP = calculateXP(currentUser.Level);
    const nextLevelXP = calculateXP(currentUser.Level + 1);
    const progressInPercentage = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    
    set({ progressLevel: progressInPercentage.toFixed(2) });
  },

  // Streak system implementation
  calculateHabitStreak: (dates: string[]) => {
    if (!dates || dates.length === 0) return 0;

    // Sort dates in descending order (most recent first)
    const sortedDates = dates
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);

    // Check if the most recent completion was today or yesterday
    const mostRecentDate = new Date(sortedDates[0]);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // If last completion was more than 1 day ago, streak is broken
    if (daysDiff > 1) return 0;
    
    // Count consecutive days
    for (const completionDate of sortedDates) {
      const checkDate = new Date(completionDate);
      checkDate.setHours(0, 0, 0, 0);
      
      if (checkDate.getTime() === currentDate.getTime()) {
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
    try {
      const habit = await databases.getDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
        habitId
      );

      const currentStreak = get().calculateHabitStreak(habit.Dates || []);
      
      // Update the habit with current streak
      await databases.updateDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
        habitId,
        { currentStreak }
      );

      // Update local state
      const { habits } = get();
      const updatedHabits = habits.map(h => 
        h.$id === habitId ? { ...h, currentStreak } : h
      );
      set({ habits: updatedHabits });
      
    } catch (error) {
      console.error('Failed to update habit streak:', error);
    }
  },
}));
