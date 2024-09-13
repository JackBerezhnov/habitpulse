"use client"
import { useState, useEffect } from "react";
import Habit, {HabitProps}  from "./habit/Habit";
import { account, databases, ID } from "./appwrite";
import { useRouter } from "next/navigation";
import { Models } from "appwrite";

export default function Home() {

  const [habits, setHabits] = useState<HabitProps[]>([]);
  const [habitsDB, setHabitsDB] = useState<Models.Document[]>([]);
  const [habitName, setHabitName] = useState<string>('');
  const [habitType, setHabitType] = useState<string>('');
  const [currentUserID, setCurrentUserID] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await account.get();
      const userId = currentUser.$id;
      setCurrentUserID(userId);
      setUserName(currentUser.name);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!currentUserID) return;

    const fetchHabits = async() => {
      const habitsOfCurrentUser: any = [];
      const response = await databases.listDocuments(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_COLLECTION}`
      );
  
      response.documents.forEach(newHabit => {
        console.log(currentUserID);
        console.log(newHabit.UserID);
        if(currentUserID === newHabit.UserID) {
          habitsOfCurrentUser.push(newHabit);
        }
        console.log(newHabit);
      });
  
      setHabitsDB(habitsOfCurrentUser);
      console.log("Habist BEFORE add to DB State: ", response.documents);
      console.log("Habits from DB: ", response);
    };

    fetchHabits();
  }, [currentUserID]);

  const addHabitToDb = async (newHabit: HabitProps) => {
    try{
      const response = await databases.createDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
        `${newHabit.documentID}`,
        newHabit,
      );
      console.log('Habit added successfully:', response);
      window.location.reload();
    } catch (error) {
      console.log('Failed to add habit:', error);
    }
  }

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if(habitName.trim() === '') return;
  
    const newHabit: HabitProps = {
      name: habitName,
      Type: habitType,
      UserID: currentUserID,
      documentID: ID.unique(),
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

  console.log("Habits DB State: ", habitsDB);

  return (
    <div className="pt-20 flex flex-col items-center gap-8 hero bg-base-200 h-[150vh]">
      <h2>Welcome to the HabitPulse, {userName}</h2>
      <p>Start to create habits</p>
      <button className="btn btn-outline" onClick={logout}>Logout</button>
      <button className="btn" onClick={() => { 
        const modal = document.getElementById('my_modal_2') as HTMLDialogElement | null;
        if(modal) {
          modal.showModal();
        }
      } }>Create Habit</button>
      <dialog id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Start to crete your habit</h3>
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
        {habitsDB.map((habit) => (
          <Habit key={habit.$id} documentID={habit.$id} name={habit.name} Type={habit.Type} UserID={currentUserID}/>
        ))}
      </div>
    </div>
  );
}
