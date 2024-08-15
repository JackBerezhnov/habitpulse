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
      </div>

      <Calendar value={currentDate} onChange={setCurrentDate}/>
    </div>
  );
}
