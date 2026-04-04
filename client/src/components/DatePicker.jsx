import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

const DatePicker = ({ value, onChange, placeholder = "Select date" }) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("days");
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const yearListRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
        setView("days");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (value) setViewDate(new Date(value));
  }, [value]);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 380;
      const top = spaceBelow < dropdownHeight ? rect.top - dropdownHeight - 6 : rect.bottom + 6;
      setPos({ top, left: rect.left });
    }
  }, [open]);

  useEffect(() => {
    if (view === "years" && yearListRef.current) {
      const active = yearListRef.current.querySelector("[data-active]");
      if (active) active.scrollIntoView({ block: "center" });
    }
  }, [view]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = value ? new Date(value) : null;
  if (selectedDate) selectedDate.setHours(0, 0, 0, 0);

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false });
  for (let i = 1; i <= daysInMonth; i++) cells.push({ day: i, current: true });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) cells.push({ day: i, current: false });

  const selectDay = (day) => {
    const d = new Date(year, month, day);
    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    onChange(formatted);
    setOpen(false);
    setView("days");
  };

  const selectMonth = (m) => {
    setViewDate(new Date(year, m, 1));
    setView("days");
  };

  const selectYear = (y) => {
    setViewDate(new Date(y, month, 1));
    setView("months");
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (day) => {
    if (!selectedDate) return false;
    return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  const displayValue = value
    ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  return (
    <>
      <div
        ref={triggerRef}
        onClick={() => { setOpen(!open); setView("days"); }}
        className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer hover:border-indigo-400 transition-colors min-w-40"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={displayValue ? "text-gray-900 dark:text-gray-100" : "text-gray-400"}>
          {displayValue || placeholder}
        </span>
      </div>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[200] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-3 w-72 animate-modal-content"
          style={{ top: pos.top, left: pos.left }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => view === "days" ? prevMonth() : setViewDate(new Date(year - 1, month, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setView(view === "days" ? "months" : view === "months" ? "years" : "years")}
              className="text-sm font-semibold text-gray-900 dark:text-white hover:text-indigo-600 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              {view === "years" ? `${YEARS[0]} - ${YEARS[YEARS.length - 1]}` : view === "months" ? year : `${MONTHS_FULL[month]} ${year}`}
            </button>

            <button
              onClick={() => view === "days" ? nextMonth() : setViewDate(new Date(year + 1, month, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {view === "days" && (
            <>
              <div className="grid grid-cols-7 mb-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((cell, i) => (
                  <button
                    key={i}
                    disabled={!cell.current}
                    onClick={() => cell.current && selectDay(cell.day)}
                    className={`w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-all cursor-pointer
                      ${!cell.current ? "text-gray-300 dark:text-gray-600 cursor-default" : ""}
                      ${cell.current && isSelected(cell.day) ? "bg-indigo-600 text-white font-semibold" : ""}
                      ${cell.current && isToday(cell.day) && !isSelected(cell.day) ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold" : ""}
                      ${cell.current && !isSelected(cell.day) && !isToday(cell.day) ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" : ""}
                    `}
                  >
                    {cell.day}
                  </button>
                ))}
              </div>
            </>
          )}

          {view === "months" && (
            <div className="grid grid-cols-3 gap-2 py-2">
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  onClick={() => selectMonth(i)}
                  className={`py-2.5 text-sm rounded-lg border transition-all cursor-pointer ${
                    i === month
                      ? "bg-indigo-600 text-white font-semibold border-indigo-600"
                      : "text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-indigo-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {view === "years" && (
            <div ref={yearListRef} className="grid grid-cols-3 gap-2 py-2 max-h-56 overflow-y-auto">
              {YEARS.map((y) => (
                <button
                  key={y}
                  data-active={y === year ? "" : undefined}
                  onClick={() => selectYear(y)}
                  className={`py-2.5 text-sm rounded-lg border transition-all cursor-pointer ${
                    y === year
                      ? "bg-indigo-600 text-white font-semibold border-indigo-600"
                      : "text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-indigo-300"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={() => { onChange(""); setOpen(false); setView("days"); }}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => { setViewDate(new Date()); setView("days"); selectDay(today.getDate()); }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default DatePicker;
