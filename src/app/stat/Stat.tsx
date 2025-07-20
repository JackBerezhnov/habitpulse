import React from 'react';

interface StatProps {
    stat: number
    statType: string
}

const Stat: React.FC<StatProps> = ({stat, statType}) => {
    if(statType === "Strength") {
        return(
            <div className="stats shadow m-2 sm:m-5">
                <div className="stat place-items-center">
                    <div className="stat-title text-error">💪 Strength</div>
                    <div className="stat-value text-error">{stat}</div>
                </div>
            </div>
        )
    }

    if(statType === "Agility") {
        return(
            <div className="stats shadow m-2 sm:m-5">
                <div className="stat place-items-center">
                    <div className="stat-title text-accent">⚡ Agility</div>
                    <div className="stat-value text-accent">{stat}</div>
                </div>
            </div>
        )
    }

    if(statType === "Inteligent") {
        return(
            <div className="stats shadow m-2 sm:m-5">
                <div className="stat place-items-center">
                    <div className="stat-title text-info">🧠 Intelligence</div>
                    <div className="stat-value text-info">{stat}</div>
                </div>
            </div>
        )
    }
}

export default Stat;