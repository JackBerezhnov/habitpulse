"use client"
import { useState, useEffect } from "react";
import Habit from "./habit/Habit";
import { account, ID } from "./appwrite";
import { useRouter } from "next/navigation";
import Navbar from "./navbar/Navbar";
import Stat from "./stat/Stat";
import Footer from "./footer/Footer";
import { useAppStore, HabitProps } from "./store/useAppStore";
import { logoutUser } from './auth';

export default function Home() {
  const [habitName, setHabitName] = useState<string>('');
  const [habitType, setHabitType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  // Motivational quotes that change daily
  const motivationalQuotes = [
    "Small steps every day lead to big changes every year.",
    "The secret of getting ahead is getting started.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Don't watch the clock; do what it does. Keep going.",
    "The only impossible journey is the one you never begin.",
    "Your future is created by what you do today, not tomorrow.",
    "Progress, not perfection, is the goal.",
    "Every expert was once a beginner. Every pro was once an amateur.",
    "The best time to plant a tree was 20 years ago. The second best time is now.",
    "Consistency is the mother of mastery.",
    "You don't have to be great to get started, but you have to get started to be great.",
    "The difference between ordinary and extraordinary is that little extra.",
    "Champions keep playing until they get it right.",
    "Success isn't just about what you accomplish, but what you inspire others to do.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "It always seems impossible until it's done.",
    "The journey of a thousand miles begins with one step.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't wait for opportunity. Create it.",
    "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    "The key to success is to focus on goals, not obstacles."
  ];
  
  // Get daily quote based on current date
  const getDailyQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return motivationalQuotes[dayOfYear % motivationalQuotes.length];
  };
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
  }, [fetchUser]);

  useEffect(() => {
    if (!currentUserID) return;
    createUserAsPlayer();
  }, [currentUserID, createUserAsPlayer]);

  useEffect(() => {
    if (!currentUserID) return;
    getUser();
  }, [currentUserID, getUser]);

  useEffect(() => {
    if (!currentUserID) return;
    fetchHabits();
  }, [currentUserID, fetchHabits]);

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

  const handleLogout = async () => {
    try {
      logoutUser();
      router.push("/login");
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  if(!currentUser || isLoading) {
    return <div className="flex flex-col justify-center items-center gap-8 hero bg-base-200 h-[100vh]">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">
      <Navbar onLogout={handleLogout}/>
      <main className="flex-grow flex flex-col">
        <div className="flex flex-col items-center gap-4 sm:gap-6 px-3 sm:px-4 py-4 sm:py-8 max-w-4xl mx-auto w-full">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome to HabitPulse, {userName}</h2>
          
          {/* Getting Started Button */}
          <button 
            className="btn btn-outline btn-sm gap-2 touch-manipulation" 
            onClick={() => setIsHelpModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Getting Started
          </button>
        </div>
        
        {/* Stats Section - Mobile Optimized */}
        <div className="w-full space-y-4">
          {/* Level and XP Card */}
          <div className="card bg-base-100 shadow-lg w-full">
            <div className="card-body p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="stats stats-vertical sm:stats-horizontal shadow-none bg-transparent">
                  <div className="stat place-items-center">
                    <div className="stat-title text-xs sm:text-sm">Level</div>
                    <div className="stat-value text-2xl sm:text-3xl">{currentUser.Level}</div>
                    <div className="stat-desc text-xs">XP: {currentUser.Experience}</div>
                  </div>
                </div>
                
                {/* Daily Motivational Quote */}
                <div className="text-center max-w-md mx-auto px-4">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-primary text-lg">💪</span>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">Daily Motivation</span>
                      <span className="text-primary text-lg">✨</span>
                    </div>
                    <blockquote className="text-sm sm:text-base font-medium text-base-content/80 italic leading-relaxed">
                      &ldquo;{getDailyQuote()}&rdquo;
                    </blockquote>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs sm:text-sm font-medium">Next Level Progress</div>
                  <div className="radial-progress text-primary text-xs sm:text-sm" style={{"--value": progressLevel, "--size": "4rem"} as React.CSSProperties} role="progressbar">
                    {progressLevel}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Character Stats - Mobile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <Stat statType="Strength" stat={currentUser.Strength}/>
            <Stat statType="Agility" stat={currentUser.Agility}/>
            <Stat statType="Inteligent" stat={currentUser.Inteligent}/>
          </div>
        </div>
        
        {/* Create Habit Button - Mobile Friendly */}
        <button 
          className="btn btn-primary btn-md w-full sm:w-auto touch-manipulation" 
          onClick={() => setIsModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm sm:text-base">Create New Habit</span>
        </button>
        
        {/* Habits Section */}
        <div className="habits flex flex-col w-full">
          {habits.map((habit) => (
            <Habit key={habit.$id} documentID={habit.$id} name={habit.name} Type={habit.Type} UserID={currentUserID}/>
          ))}
        </div>
        </div>
      </main>
      
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg sm:text-xl mb-4">Create Your Habit</h3>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 touch-manipulation"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm sm:text-base">Habit name</span>
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Daily workout, Read 30 minutes..." 
                  className="input input-bordered w-full text-sm sm:text-base touch-manipulation" 
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm sm:text-base">Habit type</span>
                </label>
                <select 
                  className="select select-bordered w-full text-sm sm:text-base touch-manipulation" 
                  value={habitType}
                  onChange={(e) => setHabitType(e.target.value)}
                >
                  <option disabled value="">Choose your focus area</option>
                  <option value="Strength">💪 Strength - Physical fitness & health</option>
                  <option value="Agility">⚡ Agility - Skills & coordination</option>
                  <option value="Inteligent">🧠 Intelligence - Learning & knowledge</option>
                </select>
              </div>
            </div>
            <div className="modal-action mt-6">
              <button 
                className="btn btn-primary btn-block sm:btn-auto sm:ml-auto touch-manipulation" 
                onClick={handleAddHabit}
                disabled={!habitName.trim() || !habitType}
              >
                Create Habit
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          </div>
        </div>
      )}
      
      {/* Getting Started Modal */}
      {isHelpModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg sm:text-xl mb-4 sm:mb-6">Getting Started with HabitPulse</h3>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 touch-manipulation"
              onClick={() => setIsHelpModalOpen(false)}
            >
              ✕
            </button>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-4 text-primary">Start building your habits — one check at a time.</h4>
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5">1</div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base mb-1">Create Your First Habit</h4>
                        <p className="text-xs sm:text-sm text-base-content/70">Click &ldquo;Create New Habit&rdquo; to add activities that will help you grow. Choose from Strength (physical), Agility (skills), or Intelligence (learning) categories.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5">2</div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base mb-1">Mark Habits as &ldquo;Completed Today&rdquo;</h4>
                        <p className="text-xs sm:text-sm text-base-content/70">Each day, click the &ldquo;Mark as Done&rdquo; button when you complete a habit. You&rsquo;ll earn 10 XP and increase your character stats!</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5">3</div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base mb-1">Build Streaks & Level Up</h4>
                        <p className="text-xs sm:text-sm text-base-content/70">Complete habits consistently to build streaks: 🌱 → 🔥 → ⚡ → 💪 → 🏆. Earn XP to level up your character and unlock higher stats!</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-warning text-warning-content rounded-full flex items-center justify-center text-xs font-bold mt-0.5">⚠️</div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base mb-1 text-warning">Don&rsquo;t Break Your Streak!</h4>
                        <p className="text-xs sm:text-sm text-base-content/70">Missing a day will reset your streak to 0. Stay consistent to maintain your progress and keep those streak emojis growing!</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="modal-action mt-6 sm:mt-8">
                  <button 
                    className="btn btn-primary btn-block touch-manipulation"
                    onClick={() => setIsHelpModalOpen(false)}
                  >
                    <span className="text-sm sm:text-base">Got it! Let&rsquo;s start building habits 🚀</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsHelpModalOpen(false)}>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
