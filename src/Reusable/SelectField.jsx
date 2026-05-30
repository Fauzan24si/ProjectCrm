import './Reusable.css';

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  name,
  placeholder,
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="reusable-select"
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
