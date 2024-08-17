import Calendar from "../calendar/Calendar";
import { useState } from "react";

export interface HabitProps {
    name: string;
}

const Habit: React.FC<HabitProps> = ({ name }) => {
    
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <div>
            <button className="border-solid border-2 py-2 w-72 mt-5">{name}</button>
            <Calendar value={currentDate} onChange={setCurrentDate}/>
        </div>
    );
};

export default Habit;