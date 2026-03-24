import Calendar from "../calendar/Calendar";
import HabitType from "../habit_type/HabitType";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAppStore } from "../store/useAppStore";

export interface HabitProps {
    name: string;
    Type: string;
    UserID: string;
  id: string;
}

const Habit: React.FC<HabitProps> = ({ name, id, Type }) => {
    
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
        const currentHabit = habits.find(h => h.$id === id);
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
    }, [habits, id, calculateHabitStreak, getStreakEmoji]);
    
    const handleDeleteButton = async() => {
      await deleteHabit(id);
    }

    const handleMarkAsDone = async() => {
        if (isCompleted || !currentUser) return;
        
        try {
            const today = new Date();
            const currentHabit = habits.find(h => h.$id === id);
            const currentDates = currentHabit?.Dates || [];
            const updatedDates = [...currentDates, today.toISOString()];
            
            // Update habit dates
            await updateHabitDates(id, updatedDates);
            
            // Update streak
            await updateHabitStreak(id);
            
            // Add XP and handle level up (no await for instant UI updates)
            const earnedXP = 100;
            const newXP = currentUser.Experience + earnedXP;
            updateUserExperience(newXP); // Instant UI update
            
            // Handle level up (no await for instant UI updates)
            const calculateXP = (level: number) => 50 * Math.pow(level, 2);
            let currentLevel = currentUser.Level;
            while (newXP >= calculateXP(currentLevel + 1)) {
                currentLevel += 1;
                updateUserLevel(currentLevel); // Instant UI update
            }
            
            // Add stats based on habit type (no await for instant UI updates)
            if (currentHabit?.Type === "Strength") {
                updateUserStats('Strength', currentUser.Strength + 1); // Instant UI update
            } else if (currentHabit?.Type === "Agility") {
                updateUserStats('Agility', currentUser.Agility + 1); // Instant UI update
            } else if (currentHabit?.Type === "Inteligent") {
                updateUserStats('Inteligent', currentUser.Inteligent + 1); // Instant UI update
            }
            
            // Show animation feedback
            setShowAnimation(true);
            setTimeout(() => setShowAnimation(false), 1000);
            
        } catch (error) {
            // Silently handle habit completion errors
        }
    }

    const today = new Date();

    return (
      <>
      <div className="quest-card p-4">
        {/* Top row: icon + name + streak */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📕</span>
            <div>
              <h3 className="text-[0.7rem] text-yellow-400">{name}</h3>
              <p className="text-[0.5rem] text-gray-400">Quest Log</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[0.6rem] text-gray-300">
              Streak: {currentStreak} {streakEmoji}
            </span>
            {showAnimation && <span className="animate-bounce ml-1">✨</span>}
          </div>
        </div>

        {/* Bottom row: actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMarkAsDone}
            disabled={isCompleted}
            className={`pixel-btn text-[0.5rem] py-2 px-3 ${
              isCompleted ? 'pixel-btn-green' : 'pixel-btn-outline'
            }`}
          >
            {isCompleted ? '✅ Completed Today' : `📅 Mark Done (${format(today, 'MMM dd')})`}
          </button>

          <button
            onClick={() => setIsCalendarModalOpen(true)}
            className="pixel-btn pixel-btn-outline text-[0.5rem] py-2 px-3"
            title="View Progress"
          >
            📅
          </button>

          <HabitType Type={Type} />

          <button
            onClick={handleDeleteButton}
            className="pixel-btn pixel-btn-red text-[0.5rem] py-2 px-3"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Calendar Progress Modal */}
      {isCalendarModalOpen && (
        <div className="pixel-modal-overlay" onClick={() => setIsCalendarModalOpen(false)}>
          <div className="pixel-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[0.7rem] text-yellow-400 mb-4 flex items-center gap-2">
              📅 {name} - Progress Overview
            </h3>
            <button
              className="absolute right-3 top-3 text-gray-400 hover:text-white text-[0.7rem] cursor-pointer"
              onClick={() => setIsCalendarModalOpen(false)}
            >
              ✕
            </button>

            <div className="space-y-4">
              <div className="pixel-panel p-3 overflow-x-hidden">
                <Calendar value={currentDate} id={id} onChange={setCurrentDate} readOnly={true}/>
              </div>

              <div className="flex items-center justify-between p-3 pixel-panel">
                <span className="flex items-center gap-2 text-[0.55rem]">
                  <div className="w-3 h-3 bg-green-500"></div>
                  Completed Days
                </span>
                <span className="flex items-center gap-2 text-[0.55rem] text-orange-400">
                  🔥 {currentStreak} day streak {streakEmoji}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <button
                className="pixel-btn pixel-btn-green w-full"
                onClick={() => setIsCalendarModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    );
};

export default Habit;