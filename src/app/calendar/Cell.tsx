interface Props extends React.PropsWithChildren {}

const Cell: React.FC<Props> = ({children}) => {
    return <div>{children}</div>
};

export default Cell;