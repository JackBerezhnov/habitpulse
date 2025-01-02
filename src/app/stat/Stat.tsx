import React from 'react';

interface StatProps {
    stat: number
    statType: string
}

const Stat: React.FC<StatProps> = ({stat, statType}) => {
    if(statType === "Strength") {
        return(
            <div className="stats shadow m-5">
                <div className="stat">
                    <div className="stat-title">Strength</div>
                    <div className="stat-value">{stat}</div>
                </div>
            </div>
        )
    }

    if(statType === "Agility") {
        return(
            <div className="stats shadow m-5">
                <div className="stat">
                    <div className="stat-title">Agility</div>
                    <div className="stat-value">{stat}</div>
                </div>
            </div>
        )
    }

    if(statType === "Inteligent") {
        return(
            <div className="stats shadow m-5">
                <div className="stat">
                    <div className="stat-title">Inteligent</div>
                    <div className="stat-value">{stat}</div>
                </div>
            </div>
        )
    }
}

export default Stat;