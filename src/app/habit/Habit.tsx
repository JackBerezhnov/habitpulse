import Calendar from "../calendar/Calendar";
import { useState } from "react";
import { format } from "date-fns";

export interface HabitProps {
    name: string;
}

const Habit: React.FC<HabitProps> = ({ name }) => {
    
    const [currentDate, setCurrentDate] = useState(new Date());
    const handleSetToday = () => setCurrentDate(new Date());

    return (
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1">{name}</div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <button className="border-solid border-2 py-2 w-72 mt-5">{name}</button>
            <div className="flex flex-col items-center gap-2">
                <p>Selected Date: {format(currentDate, 'dd LLLL yyyy')}</p>
                <button
                onClick={handleSetToday} 
                className="text-sm px-4 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                >Today</button>
            </div>
            <Calendar value={currentDate} onChange={setCurrentDate}/>
          </ul>
        </div>
    );
};

export default Habit;