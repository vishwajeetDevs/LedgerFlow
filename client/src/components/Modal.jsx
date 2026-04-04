import { useState, useEffect } from "react";

const Modal = ({ open, onClose, children, maxWidth = "max-w-md" }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setClosing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdrop}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${closing ? "animate-modal-overlay-out" : "animate-modal-overlay"}`}
    >
      <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full ${maxWidth} p-6 ${closing ? "animate-modal-content-out" : "animate-modal-content"}`}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
