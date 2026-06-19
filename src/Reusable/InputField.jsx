import './Reusable.css';

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  name,
  className = '',
  leftIcon,
  rightElement,
  ...rest
}) => {
  const hasLeftIcon = !!leftIcon;
  const hasRightElement = !!rightElement;

  return (
    <div className={`reusable-input-group ${className}`.trim()}>
      {label && (
        <label htmlFor={name} className="reusable-input-label">
          {label}
        </label>
      )}
      <div className={`reusable-input-wrapper ${hasLeftIcon ? 'has-left-icon' : ''} ${hasRightElement ? 'has-right-element' : ''}`.trim()}>
        {leftIcon && <span className="reusable-input-icon-left">{leftIcon}</span>}
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
        {rightElement && <span className="reusable-input-element-right">{rightElement}</span>}
      </div>
    </div>
  );
};

export default InputField;
