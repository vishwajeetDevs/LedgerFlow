import { useEffect, useState, useCallback } from "react";

let addToastFn = null;

export const toast = {
  success: (message) => addToastFn?.({ type: "success", message }),
  error: (message) => addToastFn?.({ type: "error", message }),
  info: (message) => addToastFn?.({ type: "info", message }),
};

const ToastItem = ({ toast: t, onRemove }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onRemove, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: (
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const bg = { success: "border-green-200", error: "border-red-200", info: "border-indigo-200" };

  return (
    <div
      className={`flex items-center gap-3 bg-white dark:bg-gray-900 border ${bg[t.type]} shadow-lg rounded-lg px-4 py-3 min-w-72 transition-all duration-300 ${
        exiting ? "opacity-0 -translate-y-3" : "opacity-100 translate-y-0"
      }`}
    >
      {icons[t.type]}
      <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">{t.message}</p>
      <button onClick={() => { setExiting(true); setTimeout(onRemove, 300); }} className="text-gray-400 hover:text-gray-600 cursor-pointer">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => remove(t.id)} />
      ))}
    </div>
  );
};

export default ToastContainer;
