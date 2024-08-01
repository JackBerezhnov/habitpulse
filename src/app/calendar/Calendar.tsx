const Calendar = () => {
    return <div className="w-[400px] border">
        <div className="grid grid-cols-7 items-center justify-center text-center">
            <div>{"<<"}</div>
            <div>{"<"}</div>
            <div className="col-span-3">August 2022</div>
            <div>{">"}</div>
            <div>{">>"}</div>
        </div>
    </div>;
};

export default Calendar;