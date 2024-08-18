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
          <div tabIndex={0} role="button" className="btn m-1">{name} <span>Last time:</span>{format(currentDate, 'dd LLLL yyyy')}</div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <Calendar value={currentDate} onChange={setCurrentDate}/>
          </ul>
        </div>
    );
};

export default Habit;