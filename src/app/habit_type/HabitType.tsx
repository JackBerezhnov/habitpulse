export interface HabitTypeProps {
    Type: string;
}

const typeConfigs: Record<string, { label: string; btnClass: string }> = {
    Strength: { label: 'Strong', btnClass: 'pixel-btn-red' },
    Inteligent: { label: 'Intelligent', btnClass: 'pixel-btn-outline' },
    Agility: { label: 'Agile', btnClass: 'pixel-btn-green' },
};

const HabitType: React.FC<HabitTypeProps> = ({ Type }) => {
    const config = typeConfigs[Type];
    if (!config) return null;

    return (
        <span className={`pixel-btn ${config.btnClass} text-[0.45rem] py-1 px-3`}>
            {config.label}
        </span>
    );
}

export default HabitType; 