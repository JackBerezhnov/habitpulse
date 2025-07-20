import clsx from "clsx";
import { useState } from "react";

interface Props extends React.PropsWithChildren {
    onClick?: () => void;
    className?: string;
    isCurrentDay?: boolean;
    isToday?: boolean;
    isDisabled?: boolean;
}

const Cell: React.FC<Props> = ({onClick, className, isCurrentDay, isToday, isDisabled, children}) => {
    

    const handleClick = () => {
        if (onClick && !isDisabled) onClick();
    };

    return (
        <div
            onClick={handleClick} 
            className={clsx(
                "h-12 flex items-center justify-center border-b border-r",
                {
                    "cursor-pointer hover:bg-gray-100 hover:text-black active:bg-gray-200": !!onClick && !isDisabled,
                    "bg-green-500 text-white": isCurrentDay,
                    "bg-blue-100 border-blue-300 font-semibold": isToday && !isCurrentDay,
                    "text-gray-400 cursor-not-allowed": isDisabled,
                    "cursor-default": !onClick || isDisabled
                },
                className
            )}
        >
                {children}
        </div>
    );
};

export default Cell;