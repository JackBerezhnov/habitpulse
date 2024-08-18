"use client"
import { useState } from "react";
import Habit, {HabitProps}  from "./habit/Habit";

export default function Home() {

  const [habits, setHabits] = useState<HabitProps[]>([]);
  const [habitName, setHabitName] = useState<string>('');

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if(habitName.trim() === '') return;
  
    const newHabit: HabitProps = {
      name: habitName,
    };

    setHabits([...habits, newHabit]);
    setHabitName('');
  }

  return (
    <div className="mt-16 flex flex-col items-center gap-8">
      <form onSubmit={handleAddHabit}>
        <input 
          type="text"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="Enter a habit" 
        />
        <button className="btn btn-primary" type="submit">Add Habit</button>
      </form>
      <div className="habits">
        {habits.map((habit) => (
          <Habit key={habit.name} name={habit.name}/>
        ))}
      </div>
    </div>
  );
}
