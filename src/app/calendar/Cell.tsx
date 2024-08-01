interface Props extends React.PropsWithChildren {
    className?: string;
}

const Cell: React.FC<Props> = ({className, children}) => {
    return <div className={className}>{children}</div>
};

export default Cell;