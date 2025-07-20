import Calendar from "../calendar/Calendar";
import HabitType from "../habit_type/HabitType";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAppStore } from "../store/useAppStore";
import { Icon } from '@iconify/react';

export interface HabitProps {
    name: string;
    Type: string;
    UserID: string;
    documentID: string;
}

const Habit: React.FC<HabitProps> = ({ name, documentID, Type }) => {
    
    const [isMounted, setIsMounted] = useState(false);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [streakEmoji, setStreakEmoji] = useState('💤');
    const [isCompleted, setIsCompleted] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    
    useEffect(() => {
      setIsMounted(true); // Ensures this code runs only in the browser
    }, []);

    const { deleteHabit, calculateHabitStreak, getStreakEmoji, habits, updateHabitDates, updateUserExperience, updateUserLevel, updateUserStats, updateHabitStreak, currentUser } = useAppStore();
    
    // Update streak and completion status whenever habits data changes
    useEffect(() => {
        const currentHabit = habits.find(h => h.$id === documentID);
        if (currentHabit) {
            const newStreak = calculateHabitStreak(currentHabit.Dates || []);
            const newEmoji = getStreakEmoji(newStreak);
            setCurrentStreak(newStreak);
            setStreakEmoji(newEmoji);
            
            // Check if today is already completed
            const today = new Date();
            const todayCompleted = currentHabit.Dates?.some((dateString: string) => {
                const date = new Date(dateString);
                return date.toDateString() === today.toDateString();
            }) || false;
            setIsCompleted(todayCompleted);
        }
    }, [habits, documentID, calculateHabitStreak, getStreakEmoji]);
    
    const handleDeleteButton = async() => {
      await deleteHabit(documentID);
    }

    const handleMarkAsDone = async() => {
        if (isCompleted || !currentUser) return;
        
        try {
            const today = new Date();
            const currentHabit = habits.find(h => h.$id === documentID);
            const currentDates = currentHabit?.Dates || [];
            const updatedDates = [...currentDates, today.toISOString()];
            
            // Update habit dates
            await updateHabitDates(documentID, updatedDates);
            
            // Update streak
            await updateHabitStreak(documentID);
            
            // Add experience and stats
            const earnedXP = 100;
            const newXP = currentUser.Experience + earnedXP;
            await updateUserExperience(newXP);
            
            // Handle level up
            const calculateXP = (level: number) => 50 * Math.pow(level, 2);
            let currentLevel = currentUser.Level;
            while (newXP >= calculateXP(currentLevel + 1)) {
                currentLevel += 1;
                await updateUserLevel(currentLevel);
            }
            
            // Add stats based on habit type
            if (currentHabit?.Type === "Strength") {
                await updateUserStats('Strength', currentUser.Strength + 1);
            } else if (currentHabit?.Type === "Agility") {
                await updateUserStats('Agility', currentUser.Agility + 1);
            } else if (currentHabit?.Type === "Inteligent") {
                await updateUserStats('Inteligent', currentUser.Inteligent + 1);
            }
            
            // Show animation feedback
            setShowAnimation(true);
            setTimeout(() => setShowAnimation(false), 1000);
            
        } catch (error) {
            console.error('Failed to mark habit as done:', error);
        }
    }

    const today = new Date();

    return (
      <div className="flex justify-between items-center p-4 m-4 border border-gray-500 rounded">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg">{name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm flex items-center gap-1">
                📅 Streak: {currentStreak} {streakEmoji}
                {showAnimation && <span className="animate-bounce">✨</span>}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleMarkAsDone}
              disabled={isCompleted}
              className={`btn ${
                isCompleted 
                  ? 'btn-success cursor-not-allowed' 
                  : 'btn-primary hover:btn-primary-focus'
              } transition-all duration-200 ${
                showAnimation ? 'scale-105' : ''
              }`}
            >
              {isCompleted ? (
                <span className="flex items-center gap-2">
                  ✅ Completed Today
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  📅 Mark as Done ({format(today, 'MMM dd')})
                </span>
              )}
            </button>
            
            {/* Calendar Progress View */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-sm tooltip flex hover:bg-base-200 transition-colors" data-tip="View Progress">
                <Icon icon="material-symbols:calendar-month-outline" className="w-5 h-5" />
              </div>
              <div tabIndex={0} className="dropdown-content bg-base-100 rounded-xl z-[1] shadow-2xl border border-base-300 mt-2">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-base-200">
                    <Icon icon="material-symbols:calendar-month-outline" className="w-4 h-4 opacity-60" />
                    <span className="text-sm font-medium text-base-content/70">Progress Overview</span>
                  </div>
                  
                  {/* Calendar */}
                  <div className="bg-base-50 rounded-lg p-2">
                    <Calendar value={currentDate} id={documentID} onChange={setCurrentDate} readOnly={true}/>
                  </div>
                  
                  {/* Footer Stats */}
                  <div className="mt-4 pt-3 border-t border-base-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-base-content/60">
                        <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                        Completed
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Icon icon="material-symbols:local-fire-department" className="w-3 h-3 text-orange-500" />
                        {currentStreak} day streak
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <HabitType Type={Type} />
          <button onClick={handleDeleteButton} className="btn btn-outline btn-error">Delete</button>
        </div>
      </div>
    );
};

export default Habit;