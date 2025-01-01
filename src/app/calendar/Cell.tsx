import clsx from "clsx";
import { useState } from "react";

interface Props extends React.PropsWithChildren {
    onClick?: () => void;
    className?: string;
    isCurrentDay?: boolean;
}

const Cell: React.FC<Props> = ({onClick, className, isCurrentDay, children}) => {
    

    const handleClick = () => {
        if (onClick) onClick();
    };

    return (
        <div
            onClick={handleClick} 
            className={clsx(
                "h-12 flex items-center justify-center border-b border-r",
                {
                    "cursor-pointer hover:bg-gray-100 hover:text-black active:bg-gray-200": !!onClick,
                    "bg-green-500 text-white": isCurrentDay
                },
                className
            )}
        >
                {children}
        </div>
    );
};

export default Cell;