export interface HabitTypeProps {
    Type: string;
}

const HabitType: React.FC<HabitTypeProps> = ({ Type }) => {
    if(Type !== null) {
        return(
            <div className="badge badge-primary">{Type}</div>
        )
    }
}

export default HabitType; 