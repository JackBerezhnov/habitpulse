import Calendar from "../calendar/Calendar";
import HabitType from "../habit_type/HabitType";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAppStore } from "../store/useAppStore";

export interface HabitProps {
    name: string;
    Type: string;
    UserID: string;
    documentID: string;
}

const Habit: React.FC<HabitProps> = ({ name, documentID, Type }) => {
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isMounted, setIsMounted] = useState(false);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [streakEmoji, setStreakEmoji] = useState('💤');
    
    useEffect(() => {
      setIsMounted(true); // Ensures this code runs only in the browser
    }, []);

    const { deleteHabit, calculateHabitStreak, getStreakEmoji, habits } = useAppStore();
    
    // Update streak whenever habits data changes
    useEffect(() => {
        const currentHabit = habits.find(h => h.$id === documentID);
        if (currentHabit) {
            const newStreak = calculateHabitStreak(currentHabit.Dates || []);
            const newEmoji = getStreakEmoji(newStreak);
            setCurrentStreak(newStreak);
            setStreakEmoji(newEmoji);
        }
    }, [habits, documentID, calculateHabitStreak, getStreakEmoji]);
    
    const handleDeleteButton = async() => {
      await deleteHabit(documentID);
    }

    return (
      <div className="flex justify-between items-center p-4 m-4 border border-gray-500 rounded">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1">
            {name} 
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm">Streak: {currentStreak} {streakEmoji}</span>
              <span className="text-xs opacity-70">Last: {format(currentDate, 'dd MMM')}</span>
            </div>
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-100 p-5 shadow">
            <Calendar value={currentDate} id={documentID} onChange={setCurrentDate}/>
          </ul>
        </div>
        <HabitType Type={Type} />
        <button onClick={handleDeleteButton} className="btn btn-outline btn-error">Delete</button>
      </div>
    );
};

export default Habit;