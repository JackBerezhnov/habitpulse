"use client"
import { useState, useEffect } from "react";
import Habit, {HabitProps}  from "./habit/Habit";
import { account, databases, ID } from "./appwrite";
import { useRouter } from "next/navigation";
import { add } from "date-fns";

export default function Home() {

  const [habits, setHabits] = useState<HabitProps[]>([]);
  const [habitName, setHabitName] = useState<string>('');
  const [currentUserID, setCurrentUserID] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await account.get();
      const userId = currentUser.$id;
      setCurrentUserID(userId);
    };

    fetchUser();
  }, [])

  const addHabitToDb = async (newHabit: HabitProps) => {
    try{
      const response = await databases.createDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
        `${ID.unique()}`,
        newHabit,
      );
      console.log('Habit added successfully:', response);
    } catch (error) {
      console.log('Failed to add habit:', error);
    }
  }

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if(habitName.trim() === '') return;
  
    const newHabit: HabitProps = {
      name: habitName,
    };

    addHabitToDb(newHabit);
    setHabits([...habits, newHabit]);
    setHabitName('');
  }

  const logout = async () => {
    try {
      await account.deleteSession('current');
      console.log('Logged out successfully');
      router.push("/login");
    } catch (error) {
      console.log('Error logging out: ', error);
    }
  }

  return (
    <div className="pt-20 flex flex-col items-center gap-8 hero bg-base-200 min-h-screen">
      <button className="btn btn-outline" onClick={logout}>Logout</button>
      <form onSubmit={handleAddHabit} className="w-9/12 flex items-center justify-center">
        <input 
          className="mr-10 input input-bordered w-full max-w-xs"
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
