"use client"
import { useState, useEffect } from "react";
import Habit from "./habit/Habit";
import { useRouter } from "next/navigation";
import Stat from "./stat/Stat";
import Footer from "./footer/Footer";
import { useAppStore, HabitProps } from "./store/useAppStore";
import MainLayout from "./components/MainLayout";

const createHabitId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function Home() {
  const [habitName, setHabitName] = useState<string>('');
  const [habitType, setHabitType] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Remove old user state - using Zustand store instead
  
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
    const initializeApp = async () => {
      // First, check if user is authenticated
      await fetchUser();
    };
    initializeApp();
  }, [fetchUser]);

  useEffect(() => {
    if (!currentUserID) return;
    
    const initializeUserData = async () => {
      // Create user document if it doesn't exist
      await createUserAsPlayer();
      // Load user data from database
      await getUser();
      // Load user's habits
      await fetchHabits();
    };
    
    initializeUserData();
  }, [currentUserID, createUserAsPlayer, getUser, fetchHabits]);

  useEffect(() => {
    if (!isLoading && !currentUserID) {
      router.push('/login');
    }
  }, [isLoading, currentUserID, router]);

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(habitName.trim() === '' || habitType === '') return;
  
    const newHabit: HabitProps = {
      name: habitName,
      Type: habitType,
      UserID: currentUserID,
      id: createHabitId(),
    };

    await addHabit(newHabit);
    setHabitName('');
    setHabitType('');
    setIsModalOpen(false); // Close modal after successful addition
  }

  if (isLoading || !currentUser || !currentUserID) {
    return (
      <div className="space-bg min-h-screen flex items-center justify-center">
        <div className="relative z-10 pixel-panel p-8 text-center">
          <span className="pixel-loading">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex flex-col gap-4 p-3 sm:p-6 max-w-5xl mx-auto w-full">

          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pixel-panel p-4">
            <h2 className="text-[0.7rem] sm:text-[0.85rem] text-yellow-400 text-center sm:text-left">
              Welcome to HabitPulse, {userName}
            </h2>
            <button
              className="pixel-btn pixel-btn-outline text-[0.55rem]"
              onClick={() => setIsHelpModalOpen(true)}
            >
              Getting Started
            </button>
          </div>

          {/* Three-card row: Level, Motivation, Progress */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level Card */}
            <div className="pixel-panel p-4">
              <h3 className="text-[0.7rem] text-yellow-400 mb-3">Level {currentUser.Level}</h3>
              <div className="flex items-center gap-4">
                <div className="pixel-panel-light w-16 h-20 flex items-center justify-center text-3xl flex-shrink-0">
                  ⚔️
                </div>
                <div className="space-y-1 text-[0.5rem]">
                  <p>Level: <span className="text-yellow-300">{currentUser.Experience}</span></p>
                  <p>ATK: <span className="text-red-400">{currentUser.Strength}</span></p>
                  <p>DEF: <span className="text-blue-400">{currentUser.Level + currentUser.Strength}</span></p>
                  <p>Rax: <span className="text-green-400">{currentUser.Agility}</span></p>
                  <p>Core: <span className="text-purple-400">{currentUser.Inteligent}</span></p>
                </div>
              </div>
            </div>

            {/* Daily Motivation Scroll */}
            <div className="pixel-scroll p-4 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 mb-2">
                <span>⚔️</span>
                <h3 className="text-[0.6rem] font-bold">Daily Motivation</h3>
                <span>📋</span>
              </div>
              <blockquote className="text-[0.55rem] leading-relaxed italic">
                &ldquo;{getDailyQuote()}&rdquo;
              </blockquote>
            </div>

            {/* Next Level Progress */}
            <div className="pixel-panel p-4 flex flex-col items-center justify-center">
              <h3 className="text-[0.6rem] text-gray-300 mb-3">Next Level Progress</h3>
              <div className="pixel-progress-container">
                <svg width="100" height="100" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#2d1b4e" strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#4aeadc" strokeWidth="3"
                    strokeDasharray={`${progressLevel}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="pixel-progress-text">{progressLevel}%</span>
              </div>
              <span className="text-lg mt-1">🧪</span>
            </div>
          </div>

          {/* Stats + Create/Habits two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Stat bars */}
            <div className="flex flex-col gap-3">
              <Stat statType="Strength" stat={currentUser.Strength}/>
              <Stat statType="Agility" stat={currentUser.Agility}/>
              <Stat statType="Inteligent" stat={currentUser.Inteligent}/>
            </div>

            {/* Right: Create button + Habits */}
            <div className="flex flex-col gap-3">
              <button
                className="pixel-btn pixel-btn-yellow w-full py-4 text-[0.75rem]"
                onClick={() => setIsModalOpen(true)}
              >
                + Create New Habit
              </button>

              {habits.map((habit) => (
                <Habit key={habit.$id} id={habit.$id} name={habit.name} Type={habit.Type} UserID={currentUserID}/>
              ))}
            </div>
          </div>
        </div>

        {/* Create Habit Modal */}
        {isModalOpen && (
          <div className="pixel-modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="pixel-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-[0.75rem] text-yellow-400 mb-4">Create Your Habit</h3>
              <button
                className="absolute right-3 top-3 text-gray-400 hover:text-white text-[0.7rem] cursor-pointer"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
              <div className="space-y-4">
                <div>
                  <label className="block text-[0.55rem] text-gray-300 mb-2">Habit name</label>
                  <input
                    type="text"
                    placeholder="e.g., Daily workout, Read 30 minutes..."
                    className="pixel-input"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[0.55rem] text-gray-300 mb-2">Habit type</label>
                  <select
                    className="pixel-select"
                    value={habitType}
                    onChange={(e) => setHabitType(e.target.value)}
                  >
                    <option disabled value="">Choose your focus area</option>
                    <option value="Strength">⚔️ Strength - Physical fitness</option>
                    <option value="Agility">⚡ Agility - Skills &amp; coordination</option>
                    <option value="Inteligent">🧠 Intelligence - Learning</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <button
                  className="pixel-btn pixel-btn-green w-full"
                  onClick={handleAddHabit}
                  disabled={!habitName.trim() || !habitType}
                >
                  Create Habit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started Modal */}
        {isHelpModalOpen && (
          <div className="pixel-modal-overlay" onClick={() => setIsHelpModalOpen(false)}>
            <div className="pixel-modal max-w-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-[0.75rem] text-yellow-400 mb-4">Getting Started with HabitPulse</h3>
              <button
                className="absolute right-3 top-3 text-gray-400 hover:text-white text-[0.7rem] cursor-pointer"
                onClick={() => setIsHelpModalOpen(false)}
              >
                ✕
              </button>

              <div className="space-y-4">
                <p className="text-[0.6rem] text-green-400 mb-3">Start building your habits — one quest at a time.</p>

                {[
                  { num: '1', title: 'Create Your First Habit', desc: 'Click "Create New Habit" to add quests. Choose Strength, Agility, or Intelligence.' },
                  { num: '2', title: 'Mark Habits as "Completed Today"', desc: 'Complete quests daily to earn XP and boost your character stats!' },
                  { num: '3', title: 'Build Streaks & Level Up', desc: 'Stay consistent: 🌱 → 🔥 → ⚡ → 💪 → 🏆. Earn XP to level up!' },
                  { num: '⚠', title: "Don't Break Your Streak!", desc: 'Missing a day resets your streak to 0. Stay consistent!' },
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-3">
                    <div className="pixel-btn pixel-btn-yellow text-[0.5rem] py-1 px-2 flex-shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h4 className="text-[0.55rem] text-yellow-300 mb-1">{step.title}</h4>
                      <p className="text-[0.5rem] text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}

                <button
                  className="pixel-btn pixel-btn-green w-full mt-4"
                  onClick={() => setIsHelpModalOpen(false)}
                >
                  Got it! Let&rsquo;s go! 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </MainLayout>
  );
}
