export interface HabitTypeProps {
    Type: string;
}

const HabitType: React.FC<HabitTypeProps> = ({ Type }) => {
    if(Type === "Strength") {
        console.log("Type: ", Type);
        return(
            <div className="badge badge-error badge-outline mr-4 ml-4">{ Type }</div>
        )
    }
    if(Type === "Inteligent") {
        return(
            <div className="badge badge-info badge-outline mr-4 ml-4">{ Type }</div>
        )
    }
    if(Type === "Agility") {
        return(
            <div className="badge badge-accent badge-outline mr-4 ml-4">{ Type }</div>
        )
    }
}

export default HabitType; 