"use client"
import { format } from "date-fns";
import { useState } from "react";
import Calendar from "./calendar/Calendar";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleSetToday = () => setCurrentDate(new Date());
  const handleAddHabit = (e: any) => {
    const habit = e.target.value;
  }

  return (
    <div className="mt-16 flex flex-col items-center gap-8">
      <form>
        <input className="text-black" type="text" onChange={handleAddHabit} />
        <input type="submit" />
      </form>
      <div className="flex flex-col items-center gap-2">
        <p>Selected Date: {format(currentDate, 'dd LLLL yyyy')}</p>

        <button
          onClick={handleSetToday} 
          className="text-sm px-4 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        >Today</button>
      </div>

      <Calendar value={currentDate} onChange={setCurrentDate}/>
    </div>
  );
}
