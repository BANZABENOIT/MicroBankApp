import { FiX } from "react-icons/fi";
import "./Modal.css";

function Modal({ title, onClose, children }) {
  return (
    <div className="c-modal-overlay" onClick={onClose}>
      <div className="c-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="c-modal-header">
          <h3>{title}</h3>
          <button className="c-modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="c-modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
