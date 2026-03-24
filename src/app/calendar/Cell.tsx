import clsx from "clsx";

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
                "h-10 flex items-center justify-center text-[0.5rem] border border-[#3d2a5c]/40",
                {
                    "cursor-pointer hover:bg-[#4a3570] active:bg-[#5a4580]": !!onClick && !isDisabled,
                    "bg-green-600 text-white": isCurrentDay,
                    "bg-[#2d1b4e] text-yellow-300 font-bold": isToday && !isCurrentDay,
                    "text-gray-600 cursor-not-allowed": isDisabled && !isCurrentDay,
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