"use client"
import { useState } from "react";
import Calendar from "./calendar/Calendar";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <div className="mt-16 flex flex-col items-center">
      <Calendar value={currentDate} onChange={setCurrentDate}/>
    </div>
  );
}
