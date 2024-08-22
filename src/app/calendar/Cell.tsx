import clsx from "clsx";

interface Props extends React.PropsWithChildren {
    onClick?: () => void;
    className?: string;
}

const Cell: React.FC<Props> = ({onClick, className, children}) => {
    return (
        <div
            onClick={onClick} 
            className={clsx(
                "h-12 flex items-center justify-center border-b border-r",
                {"cursor-pointer hover:bg-gray-100 hover:text-black active:bg-gray-200": !!onClick},
                className
            )}
        >
                {children}
        </div>
    );
};

export default Cell;