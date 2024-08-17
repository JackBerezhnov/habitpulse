export interface HabitProps {
    name: string;
}

const Habit: React.FC<HabitProps> = ({ name }) => {
    return (
        <div><button className="border-solid border-2 py-2 w-72 mt-5">{name}</button></div>
    );
};

export default Habit;