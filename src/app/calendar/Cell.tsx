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
                "h-10 flex items-center justify-center text-[0.5rem] border border-[#524c7d]/40",
                {
                    "cursor-pointer hover:bg-[#524c7d]/30 active:bg-[#524c7d]/50": !!onClick && !isDisabled,
                    "bg-[#3fbf3f] text-white": isCurrentDay,
                    "bg-[#524c7d]/30 text-[#e6b636] font-bold": isToday && !isCurrentDay,
                    "text-[#524c7d] cursor-not-allowed": isDisabled && !isCurrentDay,
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