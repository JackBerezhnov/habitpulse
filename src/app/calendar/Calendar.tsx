import { differenceInDays, endOfMonth, startOfMonth, sub, format, add, setDate } from "date-fns";
import Cell from "./Cell";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface Props {
    value?: Date;
    onChange?: (value: Date) => void;
}

const Calendar: React.FC<Props> = ({ value = new Date(), onChange }) => {
    const startDate = startOfMonth(value);
    const endDate = endOfMonth(value);
    const numDays = differenceInDays(endDate, startDate) + 1;

    const prefixDays = startDate.getDay();
    const suffixDays = 6 - endDate.getDay();

    const prevMonth = () => onChange && onChange(sub(value, { months: 1 }));
    const nextMonth = () => onChange && onChange(add(value, { months: 1 }));
    const prevYear = () => onChange && onChange(sub(value, { years: 1 }));
    const nextYear = () => onChange && onChange(add(value, { years: 1 }));

    const handleClickDate = (index: number) => {
        const date = setDate(value, index);
        onChange && onChange(date);
        console.log("Date from Calendar: ", date);
    }

    return <div className="w-[400px] border-t border-l">
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
                const date = index + 1; 

                return <Cell onClick={() => handleClickDate(index + 1)} key={date}>{date}</Cell>;
            })}

            {Array.from({length: suffixDays}).map((_, index) => {
                return <Cell key={index}></Cell>;
            })}
        </div>
    </div>;
};

export default Calendar;