import './Reusable.css';

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  name,
  className = '',
  ...rest
}) => {
  return (
    <div className={`reusable-input-group ${className}`.trim()}>
      {label && (
        <label htmlFor={name} className="reusable-input-label">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="reusable-input"
        {...rest}
      />
    </div>
  );
};

export default InputField;
