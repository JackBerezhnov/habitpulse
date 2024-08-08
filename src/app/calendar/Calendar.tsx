 import { differenceInDays, endOfMonth, startOfMonth } from "date-fns";
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

    return <div className="w-[400px] border-t border-l">
        <div className="grid grid-cols-7 items-center justify-center text-center">
            <Cell>{"<<"}</Cell>
            <Cell>{"<"}</Cell>
            <Cell className="col-span-3">August 2022</Cell>
            <Cell>{">"}</Cell>
            <Cell>{">>"}</Cell>

            {daysOfWeek.map((day) => (
                <Cell key={day} className="text-sm font-bold">{day}</Cell>
            ))}

            {Array.from({length: numDays}).map((_, index) => {
                const date = index + 1; 

                return <Cell key={date}>{date}</Cell>;
            })}
        </div>
    </div>;
};

export default Calendar;