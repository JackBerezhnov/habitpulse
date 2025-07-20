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
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
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
      <>
      <div className="card bg-base-100 shadow-lg mx-2 sm:mx-4 my-3 touch-manipulation">
        <div className="card-body p-3 sm:p-4">
          {/* Mobile: Stack layout, Desktop: Flex layout */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            
            {/* Habit Info Section */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between sm:justify-start gap-2">
                    <h3 className="font-semibold text-base sm:text-lg">{name}</h3>
                    <div className="sm:hidden">
                      <HabitType Type={Type} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs sm:text-sm flex items-center gap-1">
                      📅 Streak: {currentStreak} {streakEmoji}
                      {showAnimation && <span className="animate-bounce">✨</span>}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              
              {/* Main Action Button - Full width on mobile */}
              <button 
                onClick={handleMarkAsDone}
                disabled={isCompleted}
                className={`btn btn-sm sm:btn-md ${
                  isCompleted 
                    ? 'btn-success cursor-not-allowed' 
                    : 'btn-primary hover:btn-primary-focus'
                } transition-all duration-200 ${
                  showAnimation ? 'scale-105' : ''
                } touch-manipulation w-full sm:w-auto`}
              >
                {isCompleted ? (
                  <span className="flex items-center gap-2 text-xs sm:text-sm">
                    ✅ Completed Today
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-xs sm:text-sm">
                    📅 Mark as Done ({format(today, 'MMM dd')})
                  </span>
                )}
              </button>
              
              {/* Secondary Actions Row */}
              <div className="flex items-center justify-between sm:justify-end gap-2">
                
                {/* Calendar Progress View Button */}
                <button 
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="btn btn-ghost btn-sm tooltip flex hover:bg-base-200 transition-colors touch-manipulation" 
                  data-tip="View Progress"
                >
                  <Icon icon="material-symbols:calendar-month-outline" className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                
                {/* Desktop Habit Type and Delete */}
                <div className="hidden sm:flex items-center gap-2">
                  <HabitType Type={Type} />
                  <button onClick={handleDeleteButton} className="btn btn-outline btn-error btn-sm touch-manipulation">Delete</button>
                </div>
                
                {/* Mobile Delete Button */}
                <button onClick={handleDeleteButton} className="btn btn-outline btn-error btn-sm sm:hidden touch-manipulation">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Calendar Progress Modal */}
      {isCalendarModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Icon icon="material-symbols:calendar-month-outline" className="w-5 h-5" />
              {name} - Progress Overview
            </h3>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 touch-manipulation"
              onClick={() => setIsCalendarModalOpen(false)}
            >
              ✕
            </button>
            
            <div className="space-y-4">
              {/* Calendar */}
              <div className="bg-base-50 rounded-lg p-2">
                <Calendar value={currentDate} id={documentID} onChange={setCurrentDate} readOnly={true}/>
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg border">
                <span className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
                  Completed Days
                </span>
                <span className="flex items-center gap-2 font-medium text-sm">
                  <Icon icon="material-symbols:local-fire-department" className="w-4 h-4 text-orange-500" />
                  {currentStreak} day streak {streakEmoji}
                </span>
              </div>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn btn-primary touch-manipulation" 
                onClick={() => setIsCalendarModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsCalendarModalOpen(false)}>
          </div>
        </div>
      )}
      </>
    );
};

export default Habit;