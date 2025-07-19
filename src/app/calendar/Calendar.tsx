import { useState, useEffect } from "react";
import { differenceInDays, endOfMonth, startOfMonth, sub, format, add, setDate, formatISO, parse } from "date-fns";
import { databases } from "../appwrite";
import Cell from "./Cell";
import { useAppStore } from "../store/useAppStore";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
    value?: Date;
    onChange?: (value: Date) => void;
    id: string;
}

const Calendar: React.FC<Props> = ({ value = new Date(), onChange, id }) => {
    const [checkedDays, setCheckedDays] = useState<string[]>([])
    const startDate = startOfMonth(value);
    const endDate = endOfMonth(value);
    const numDays = differenceInDays(endDate, startDate) + 1;
    const checkedDayNumbers = checkedDays.map(dateString => new Date(dateString)).map(date => date.getDate())
    
    const { 
        currentUserID, 
        currentUser, 
        habits,
        updateHabitDates, 
        updateUserExperience, 
        updateUserLevel, 
        updateUserStats,
        updateHabitStreak 
    } = useAppStore();
 
    // Get habit data from store instead of fetching separately
    useEffect(() => {
        const currentHabit = habits.find(h => h.$id === id);
        if (currentHabit && currentHabit.Dates) {
            setCheckedDays(currentHabit.Dates);
        }
    }, [habits, id]);

    const prefixDays = startDate.getDay();
    const suffixDays = 6 - endDate.getDay();

    const prevMonth = () => onChange && onChange(sub(value, { months: 1 }));
    const nextMonth = () => onChange && onChange(add(value, { months: 1 }));
    const prevYear = () => onChange && onChange(sub(value, { years: 1 }));
    const nextYear = () => onChange && onChange(add(value, { years: 1 }));

    const handleClickDate = async(index: number) => {
        const date = setDate(value, index);
        onChange && onChange(date);
        
        try {
            // Get current habit data from store
            const currentHabit = habits.find(h => h.$id === id);
            const currentDates = currentHabit?.Dates || [];
            
            const updatedDates = [...currentDates, date.toISOString()];
            setCheckedDays(updatedDates);
            
            // Update habit dates in store and database
            await updateHabitDates(id, updatedDates);
            
            // Update streak after adding new date
            await updateHabitStreak(id);
            
            // Add experience and stats
            await addExperienceToTheUser();
            await addStats();
        } catch (error) {
            console.error('Failed to update habit date:', error);
        }
    }

    const addExperienceToTheUser = async() => {
        if (!currentUser) return;
        
        // Calculate required XP for a given level
        function calculateXP(level: number) {
            return 50 * Math.pow(level, 2);
        }
        
        // Handle XP Gain and Level Up
        const earnedXP = 100;
        const newXP = currentUser.Experience + earnedXP;
        
        // Update XP using Zustand store
        await updateUserExperience(newXP);
        
        // Check if user leveled up
        let currentLevel = currentUser.Level;
        while (newXP >= calculateXP(currentLevel + 1)) {
            currentLevel += 1;
            await updateUserLevel(currentLevel);
            console.log(`Congrats! You've leveled up to Level ${currentLevel}`);
        }
    }

    const addStats = async() => {
        if (!currentUser) return;
        
        try {
            const habit = await databases.getDocument(
                `${process.env.NEXT_PUBLIC_DB}`,
                `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
                `${id}`,
            );

            if(habit.Type === "Strength") {
                const newStrength = currentUser.Strength + 1;
                await updateUserStats('Strength', newStrength);
            }

            if(habit.Type === "Agility") {
                const newAgility = currentUser.Agility + 1;
                await updateUserStats('Agility', newAgility);
            }

            if(habit.Type === "Inteligent") {
                const newInteligent = currentUser.Inteligent + 1;
                await updateUserStats('Inteligent', newInteligent);
            }
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }

    return <div className="w-[400px] border-t border-l" id={id}>
        <div className="grid grid-cols-7 items-center justify-center text-center">
            <Cell onClick={prevYear}>{"<<"}</Cell>
            <Cell onClick={prevMonth}>{"<"}</Cell>
            <Cell className="col-span-3">{format(value, 'LLLL yyyy')}</Cell>
            <Cell onClick={nextMonth}>{">"}</Cell>
            <Cell onClick={nextYear}>{">>"}</Cell>

            {daysOfWeek.map((day) => (
                <Cell key={day} className="text-sm font-bold">{day}</Cell>
            ))}

            {Array.from({length: prefixDays}).map((_, index) => {
                return <Cell key={index}></Cell>;
            })}

            {Array.from({length: numDays}).map((_, index) => {
                const day = index + 1;
                const currentDate = setDate(value, day);
                
                const isCurrentDay = checkedDays.some(dateString => {
                    let date = new Date(dateString);
                    let dateCurrentString = date.toLocaleString();
                    let currentNewDate = currentDate.toLocaleString();
                    const newCurrentDate = currentNewDate.split(",");
                    const newDateCurrentString = dateCurrentString.split(",");
                    return newDateCurrentString[0] === newCurrentDate[0];
                })

            return <Cell onClick={() => handleClickDate(index + 1)} isCurrentDay={isCurrentDay} key={currentDate.toLocaleString()}>{day}</Cell>;
            })}

            {Array.from({length: suffixDays}).map((_, index) => {
                return <Cell key={index}></Cell>;
            })}
        </div>
    </div>;
};

export default Calendar;