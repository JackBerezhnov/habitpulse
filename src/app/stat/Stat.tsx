import React from 'react';

interface StatProps {
    stat: number
    statType: string
}

const statConfigs: Record<string, { icon: string; label: string; barClass: string }> = {
    Strength: { icon: '⚔️', label: 'Strength', barClass: 'stat-bar-red' },
    Agility: { icon: '⚡', label: 'Agility', barClass: 'stat-bar-green' },
    Inteligent: { icon: '🧠', label: 'Intelligence', barClass: 'stat-bar-blue' },
};

const Stat: React.FC<StatProps> = ({stat, statType}) => {
    const config = statConfigs[statType];
    if (!config) return null;

    return (
        <div className={`stat-bar ${config.barClass}`}>
            <span className="text-2xl">{config.icon}</span>
            <span className="text-[0.65rem] flex-1">{config.label}</span>
            <span className="text-lg">{stat}</span>
        </div>
    );
}

export default Stat;