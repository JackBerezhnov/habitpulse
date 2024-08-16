export interface HabitProps {
    name: string;
}

const Habit: React.FC<HabitProps> = ({ name }) => {
    return (
        <div><h3>{name}</h3></div>
    );
};

export default Habit;