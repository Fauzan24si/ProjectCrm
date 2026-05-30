import './Reusable.css';

const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="reusable-modal-backdrop" onClick={onClose}>
      <div
        className={`reusable-modal ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="reusable-modal-title">{title}</h3>}
        <div className="reusable-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
