import './Reusable.css';

const Loading = ({ message = 'Loading...', fullscreen = false, className = '' }) => {
  const wrapperClass = fullscreen
    ? 'reusable-loading reusable-loading--fullscreen'
    : 'reusable-loading';

  return (
    <div className={`${wrapperClass} ${className}`.trim()}>
      <div className="reusable-spinner" />
      {message && <span>{message}</span>}
    </div>
  );
};

export default Loading;
