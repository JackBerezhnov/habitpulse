"use client"
import { format } from "date-fns";
import { useState } from "react";
import Calendar from "./calendar/Calendar";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date("2022-02-01"));

  return (
    <div className="mt-16 flex flex-col items-center gap-8">
      <div>
        <p>Selected Date: {format(currentDate, 'dd LLLL yyyy')}</p>

        <button className="px-4 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800">Today</button>
      </div>

      <Calendar value={currentDate} onChange={setCurrentDate}/>
    </div>
  );
}
