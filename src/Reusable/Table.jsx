import './Reusable.css';

const Table = ({ children, className = '', style, ...rest }) => {
  return (
    <table className={`reusable-table ${className}`.trim()} style={style} {...rest}>
      {children}
    </table>
  );
};

export default Table;
