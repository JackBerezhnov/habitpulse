import Calendar from "../calendar/Calendar";
import HabitType from "../habit_type/HabitType";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { databases } from "../appwrite";

export interface HabitProps {
    name: string;
    Type: string;
    UserID: string;
    documentID: string;
}

const Habit: React.FC<HabitProps> = ({ name, documentID, Type }) => {
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isMounted, setIsMounted] = useState(false);
    console.log("Current Date: ", currentDate);
    console.log("Type: ", Type);
    
    useEffect(() => {
      setIsMounted(true); // Ensures this code runs only in the browser
    }, []);

    
    const handleDeleteButton = async() => {
      const deleteHabit = await databases.deleteDocument(
        `${process.env.NEXT_PUBLIC_DB}`,
        `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
        `${documentID}`
      );
      window.location.reload();
    }

    return (
      <div className="flex justify-between items-center p-4 m-4 border border-gray-500 rounded">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1">{name} <span>Last time:</span>{format(currentDate, 'dd LLLL yyyy')}</div>
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