"use client"
import { useState, useEffect } from "react";
import Habit from "./habit/Habit";
import { account, ID } from "./appwrite";
import { useRouter } from "next/navigation";
import Navbar from "./navbar/Navbar";
import Stat from "./stat/Stat";
import { useAppStore, HabitProps } from "./store/useAppStore";

export default function Home() {
  const [habitName, setHabitName] = useState<string>('');
  const [habitType, setHabitType] = useState<string>('');
  const router = useRouter();

  // Zustand store
  const {
    currentUser,
    currentUserID,
    userName,
    progressLevel,
    habits,
    isLoading,
    fetchUser,
    createUserAsPlayer,
    getUser,
    fetchHabits,
    addHabit,
  } = useAppStore();

  useEffect(() => {
    const initializeUser = async () => {
      await fetchUser();
    };
    initializeUser();
  }, []); // Remove fetchUser dependency to prevent loops

  useEffect(() => {
    if (!currentUserID) return;
    createUserAsPlayer();
  }, [currentUserID]); // Remove createUserAsPlayer dependency

  useEffect(() => {
    if (!currentUserID) return;
    getUser();
  }, [currentUserID]); // Remove getUser dependency

  useEffect(() => {
    if (!currentUserID) return;
    fetchHabits();
  }, [currentUserID]); // Remove fetchHabits dependency

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(habitName.trim() === '' || habitType === '') return;
  
    const newHabit: HabitProps = {
      name: habitName,
      Type: habitType,
      UserID: currentUserID,
      documentID: ID.unique(),
    };

    await addHabit(newHabit);
    setHabitName('');
    setHabitType('');
    
    // Close modal after successful addition
    const modal = document.getElementById('my_modal_2') as HTMLDialogElement | null;
    if(modal) {
      modal.close();
    }
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

  if(!currentUser || isLoading) {
    return <div className="flex flex-col justify-center items-center gap-8 hero bg-base-200 h-[100vh]">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return (
    <div className="flex flex-col items-center gap-8 hero bg-base-200 h-[300vh]">
      <Navbar onLogout={logout}/>
      <h2>Welcome to the HabitPulse, {userName}</h2>
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Level</div>
          <div className="stat-value">{currentUser.Level}</div>
          <div className="stat-desc">Your exp: {currentUser.Experience}</div>
        </div>
      </div>
      <h3>Progress next level: <div className="radial-progress text-primary" style={{"--value": progressLevel } as React.CSSProperties} role="progressbar">
  {progressLevel}%
</div></h3>
      <div className="flex flex-wrap items-center">
        <Stat statType="Strength" stat={currentUser.Strength}/>
        <Stat statType="Agility" stat={currentUser.Agility}/>
        <Stat statType="Inteligent" stat={currentUser.Inteligent}/>
      </div>
      <button className="btn" onClick={() => { 
        const modal = document.getElementById('my_modal_2') as HTMLDialogElement | null;
        if(modal) {
          modal.showModal();
        }
      } }>Create Habit</button>
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Start to create your habit</h3>
          <form onSubmit={handleAddHabit} className="w-9/12 mt-4">
            <input 
              className="mr-10 input input-bordered w-full max-w-xs"
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="Enter a habit" 
            />
            <label className="form-control w-full max-w-xs mt-4">
              <div className="label">
                <span className="label-text">Pick the category for your habit</span>
              </div>
              <select 
                className="select select-bordered"
                value={habitType}
                onChange={(e) => setHabitType(e.target.value)}
              >
                <option>Select</option>
                <option>Strength</option>
                <option>Inteligent</option>
                <option>Agility</option>
              </select>
            </label>
            <button className="btn btn-primary mt-4" type="submit">Add Habit</button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <div className="habits flex flex-col">
        {habits.map((habit) => (
          <Habit key={habit.$id} documentID={habit.$id} name={habit.name} Type={habit.Type} UserID={currentUserID}/>
        ))}
      </div>
    </div>
  );
}
