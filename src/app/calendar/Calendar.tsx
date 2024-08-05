import Cell from "./Cell";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = () => {
    return <div className="w-[400px] border-t border-l">
        <div className="grid grid-cols-7 items-center justify-center text-center">
            <Cell>{"<<"}</Cell>
            <Cell>{"<"}</Cell>
            <Cell className="col-span-3">August 2022</Cell>
            <Cell>{">"}</Cell>
            <Cell>{">>"}</Cell>

            {daysOfWeek.map((day) => (
                // eslint-disable-next-line react/jsx-key
                <Cell className="text-sm font-bold">{day}</Cell>
            ))}
        </div>
    </div>;
};

export default Calendar;