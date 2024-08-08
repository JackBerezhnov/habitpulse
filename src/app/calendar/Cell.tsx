import clsx from "clsx";

interface Props extends React.PropsWithChildren {
    onClick?: () => void;
    className?: string;
}

const Cell: React.FC<Props> = ({onClick, className, children}) => {
    return (
        <div
            onClick={onClick} 
            className={clsx("h-12 flex items-center justify-center border-b border-r", className)}>
                {children}
        </div>
    );
};

export default Cell;