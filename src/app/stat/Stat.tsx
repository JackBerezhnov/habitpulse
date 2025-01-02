import React from 'react';

interface StatProps {
    stat: number
}

const Stat: React.FC<StatProps> = ({stat}) => {
    return(
        <div className="stats shadow">
            <div className="stat">
                <div className="stat-title">Strength</div>
                <div className="stat-value">{stat}</div>
            </div>
        </div>
    )
}

export default Stat;