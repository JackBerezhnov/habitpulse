import Calendar from "../calendar/Calendar";
import { useState } from "react";
import { format } from "date-fns";

export interface HabitProps {
    name: string;
    UserID: string;
    documentID: string;
}

const handleDeleteButton = () => {
  alert("Delete Button Clicked");
}

const Habit: React.FC<HabitProps> = ({ name, documentID }) => {
    
    const [currentDate, setCurrentDate] = useState(new Date());

    console.log("Current Date: ", currentDate);

    return (
      <div className="flex justify-between items-center p-4 m-4 border border-gray-500 rounded">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1">{name} <span>Last time:</span>{format(currentDate, 'dd LLLL yyyy')}</div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-100 p-5 shadow">
            <Calendar value={currentDate} id={documentID} onChange={setCurrentDate}/>
          </ul>
        </div>
        <button onClick={handleDeleteButton} className="btn btn-outline btn-error">Delete</button>
      </div>
    );
};

export default Habit;