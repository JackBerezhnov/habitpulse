import Calendar from "../calendar/Calendar";
import { useState } from "react";
import { format } from "date-fns";

export interface HabitProps {
    name: string;
    UserID: string;
}

const Habit: React.FC<HabitProps> = ({ name }) => {
    
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1">{name} <span>Last time:</span>{format(currentDate, 'dd LLLL yyyy')}</div>
          <button className="btn btn-outline btn-error">Delete</button>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-100 p-5 shadow">
            <Calendar value={currentDate} onChange={setCurrentDate}/>
          </ul>
        </div>
    );
};

export default Habit;