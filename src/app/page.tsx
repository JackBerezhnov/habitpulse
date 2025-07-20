"use client"
import { useState, useEffect } from "react";
import Habit from "./habit/Habit";
import { account, ID } from "./appwrite";
import { useRouter } from "next/navigation";
import Navbar from "./navbar/Navbar";
import Stat from "./stat/Stat";
import Footer from "./footer/Footer";
import { useAppStore, HabitProps } from "./store/useAppStore";

export default function Home() {
  const [habitName, setHabitName] = useState<string>('');
  const [habitType, setHabitType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
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
    setIsModalOpen(false); // Close modal after successful addition
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
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar onLogout={logout}/>
      <div className="flex flex-col items-center gap-6 px-4 py-8 flex-grow">
        <h2 className="text-2xl font-bold">Welcome to HabitPulse, {userName}</h2>
        
        {/* Getting Started Button */}
        <button 
          className="btn btn-outline btn-sm gap-2" 
          onClick={() => setIsHelpModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Getting Started
        </button>
        
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
      <button className="btn" onClick={() => setIsModalOpen(true)}>Create Habit</button>
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Start to create your habit</h3>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
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
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          </div>
        </div>
      )}
      
      {/* Getting Started Modal */}
      {isHelpModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-xl mb-6">Getting Started with HabitPulse</h3>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsHelpModalOpen(false)}
            >
              ✕
            </button>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-4 text-primary">Start building your habits — one check at a time.</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-lg">✅</span>
                    <div>
                      <p className="font-medium">Add habits that help you grow</p>
                      <p className="text-sm text-base-content/70">Create habits focused on Strength, Intelligence, or Agility to level up your character.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-lg">✅</span>
                    <div>
                      <p className="font-medium">Mark them "Completed Today"</p>
                      <p className="text-sm text-base-content/70">Use the blue "Mark as Done" button to complete habits and earn 100 XP plus stat points.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-500 font-bold text-lg">✅</span>
                    <div>
                      <p className="font-medium">Build streaks and level up</p>
                      <p className="text-sm text-base-content/70">Complete habits daily to build streaks (🌱→🔥→⚡→💪→🏆) and watch your character grow stronger.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-bold">Stay Consistent!</h4>
                  <p className="text-sm">Your streak resets if you skip a day. Build the habit of daily completion to maximize your growth.</p>
                </div>
              </div>
              
              <div className="text-center">
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsHelpModalOpen(false)}
                >
                  Got it! Let's start building habits
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsHelpModalOpen(false)}>
          </div>
        </div>
      )}
      
      <div className="habits flex flex-col">
        {habits.map((habit) => (
          <Habit key={habit.$id} documentID={habit.$id} name={habit.name} Type={habit.Type} UserID={currentUserID}/>
        ))}
      </div>
      </div>
      <Footer />
    </div>
  );
}
