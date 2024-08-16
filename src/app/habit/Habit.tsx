export interface HabitProps {
    title: string;
}

const Habit: React.FC<HabitProps> = ({ title }) => {
    return (
        <div><h3>{title}</h3></div>
    );
};

export default Habit;