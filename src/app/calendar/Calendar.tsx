import { useState, useEffect } from "react";
import { differenceInDays, endOfMonth, startOfMonth, sub, format, add, setDate, formatISO, parse } from "date-fns";
import { databases } from "../appwrite";
import Cell from "./Cell";
import { get } from "http";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
    value?: Date;
    onChange?: (value: Date) => void;
    id: string;
}

const Calendar: React.FC<Props> = ({ value = new Date(), onChange, id }) => {
    const [checkedDays, setCheckedDays] = useState([])
    const startDate = startOfMonth(value);
    const endDate = endOfMonth(value);
    const numDays = differenceInDays(endDate, startDate) + 1;
    const checkedDayNumbers = checkedDays.map(dateString => new Date(dateString)).map(date => date.getDate())
   console.log({ checkedDayNumbers })
 
    useEffect(() => {
       async function getData() {
            const getHabit = await databases.getDocument(
                `${process.env.NEXT_PUBLIC_DB}`,
                `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
                `${id}`,
            );
        setCheckedDays(getHabit.Dates)
       }
       getData();
       console.log(checkedDays);
    },  [])

    const prefixDays = startDate.getDay();
    const suffixDays = 6 - endDate.getDay();

    const prevMonth = () => onChange && onChange(sub(value, { months: 1 }));
    const nextMonth = () => onChange && onChange(add(value, { months: 1 }));
    const prevYear = () => onChange && onChange(sub(value, { years: 1 }));
    const nextYear = () => onChange && onChange(add(value, { years: 1 }));

    const handleClickDate = async(index: number) => {
        const date = setDate(value, index);
        let checkedDays = [];
        onChange && onChange(date);
        const getHabit = await databases.getDocument(
            `${process.env.NEXT_PUBLIC_DB}`,
            `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
            `${id}`,
        );
        checkedDays = getHabit.Dates;
        checkedDays.push(date.toISOString());
        setCheckedDays(checkedDays)
        const addHabitDate = await databases.updateDocument(
            `${process.env.NEXT_PUBLIC_DB}`,
            `${process.env.NEXT_PUBLIC_DB_COLLECTION}`,
            `${id}`,
            {
                Dates: checkedDays
            },
        );
    }

    return <div className="w-[400px] border-t border-l" id={id}>
        <div className="grid grid-cols-7 items-center justify-center text-center">
            <Cell onClick={prevYear}>{"<<"}</Cell>
            <Cell onClick={prevMonth}>{"<"}</Cell>
            <Cell className="col-span-3">{format(value, 'LLLL yyyy')}</Cell>
            <Cell onClick={nextMonth}>{">"}</Cell>
            <Cell onClick={nextYear}>{">>"}</Cell>

            {daysOfWeek.map((day) => (
                <Cell key={day} className="text-sm font-bold">{day}</Cell>
            ))}

            {Array.from({length: prefixDays}).map((_, index) => {
                return <Cell key={index}></Cell>;
            })}

            {Array.from({length: numDays}).map((_, index) => {
                const day = index + 1;
                const currentDate = setDate(value, day);
                
                const fuckWhatever = checkedDays.some(dateString => {
                    let date = new Date(dateString);
                    let dateCurrentString = date.toLocaleString();
                    let currentNewDate = currentDate.toLocaleString();
                    const newCurrentDate = currentNewDate.split(",");
                    const newDateCurrentString = dateCurrentString.split(",");

                    return newDateCurrentString[0] === newCurrentDate[0];
                })

            return <Cell onClick={() => handleClickDate(index + 1)} fuckWhatever={fuckWhatever} key={currentDate.toLocaleString()}>{day}</Cell>;
            })}

            {Array.from({length: suffixDays}).map((_, index) => {
                return <Cell key={index}></Cell>;
            })}
        </div>
    </div>;
};

export default Calendar;