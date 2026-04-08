import React, { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isWithinInterval,
  isBefore,
  isAfter
} from "date-fns";
import { ChevronLeft, ChevronRight, PenLine, Trash2 } from "lucide-react";

export default function InteractiveCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Date range selection
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  // Load notes on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("calendarNotes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Save notes on update
  useEffect(() => {
    localStorage.setItem("calendarNotes", JSON.stringify(notes));
  }, [notes]);

  const handleDateClick = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        setEndDate(startDate);
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    }
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    let dateKey = "general";
    if (startDate && !endDate) {
      dateKey = format(startDate, "yyyy-MM-dd");
    } else if (startDate && endDate) {
      dateKey = `${format(startDate, "yyyy-MM-dd")}_${format(endDate, "yyyy-MM-dd")}`;
    }

    const note = {
      id: Math.random().toString(36).substr(2, 9),
      dateKey,
      text: newNote.trim(),
    };
    
    setNotes([note, ...notes]);
    setNewNote("");
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center py-4 px-6 border-b border-gray-100 dark:border-gray-800">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <span className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-800">
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = "eeeeee";
    let startDateOfWeek = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="flex justify-center py-2 text-xs font-semibold text-gray-500 uppercase tracking-widest" key={i}>
          {format(addDays(startDateOfWeek, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 pb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDateOfWeek = startOfWeek(monthStart);
    const endDateOfWeek = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDateOfWeek;
    let formattedDate = "";

    while (day <= endDateOfWeek) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelectedStart = startDate && isSameDay(day, startDate);
        const isSelectedEnd = endDate && isSameDay(day, endDate);
        const isInRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate });
        
        let dayClasses = "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 text-sm cursor-pointer mx-auto relative z-10 ";
        
        if (!isCurrentMonth) {
          dayClasses += "text-gray-300 dark:text-gray-600 hover:text-gray-500 ";
        } else if (isSelectedStart || isSelectedEnd) {
          dayClasses += "bg-indigo-600 text-white font-bold shadow-md transform scale-105 ";
        } else if (isInRange) {
          dayClasses += "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-medium ";
        } else {
          dayClasses += "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 ";
        }
        
        let wrapperClasses = "p-1 relative ";
        // Background strip for range
        if (isInRange && !isSelectedStart && !isSelectedEnd && isCurrentMonth) {
          wrapperClasses += "after:absolute after:top-1/2 after:-translate-y-1/2 after:left-0 after:right-0 after:h-10 after:bg-indigo-50 dark:after:bg-indigo-900/20 ";
        }
        if (isSelectedStart && endDate && isCurrentMonth) {
          wrapperClasses += "after:absolute after:top-1/2 after:-translate-y-1/2 after:left-1/2 after:right-0 after:h-10 after:bg-indigo-50 dark:after:bg-indigo-900/20 ";
        }
        if (isSelectedEnd && startDate && isCurrentMonth) {
          wrapperClasses += "after:absolute after:top-1/2 after:-translate-y-1/2 after:left-0 after:right-1/2 after:h-10 after:bg-indigo-50 dark:after:bg-indigo-900/20 ";
        }

        days.push(
          <div
            className={wrapperClasses}
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
          >
            <div className={dayClasses}>
              <span>{formattedDate}</span>
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 mt-2" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="p-4">{rows}</div>;
  };

  const getNotesHeading = () => {
    if (startDate && endDate) {
      return `Notes for ${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`;
    }
    if (startDate) {
      return `Notes for ${format(startDate, "MMM d, yyyy")}`;
    }
    return "General Notes";
  };

  const filteredNotes = notes.filter((note) => {
    if (startDate && endDate) {
      const targetRange = `${format(startDate, "yyyy-MM-dd")}_${format(endDate, "yyyy-MM-dd")}`;
      return note.dateKey === targetRange;
    }
    if (startDate && !endDate) {
      return note.dateKey === format(startDate, "yyyy-MM-dd");
    }
    return note.dateKey === "general";
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="max-w-5xl w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-300">
        
        {/* Left Side - Hero Image */}
        <div className="md:w-5/12 relative min-h-[250px] md:min-h-full">
          <img 
            src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="Calendar wall aesthetic"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-8 flex flex-col justify-end">
            <h2 className="text-white text-4xl font-light tracking-wider mb-2">
              {format(currentMonth, "MMMM")}
            </h2>
            <p className="text-indigo-200 text-lg font-medium tracking-widest pl-1">
              {format(currentMonth, "yyyy")}
            </p>
          </div>
        </div>

        {/* Right Side - Calendar & Notes */}
        <div className="md:w-7/12 flex flex-col">
          <div className="flex-1 border-b border-gray-100 dark:border-gray-800 pb-2">
            {renderHeader()}
            <div className="px-2">
              {renderDays()}
              {renderCells()}
            </div>
            
            {(startDate || endDate) && (
              <div className="px-6 py-2 flex justify-between items-center text-sm text-gray-500">
                <span>
                  {startDate ? format(startDate, "MMM d, yyyy") : ""} 
                  {endDate ? ` - ${format(endDate, "MMM d, yyyy")}` : ""}
                </span>
                <button 
                  onClick={clearSelection}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-4">
              <PenLine className="w-5 h-5 text-indigo-500" />
              {getNotesHeading()}
            </h3>
            
            <form onSubmit={handleAddNote} className="mb-4">
              <input
                type="text"
                placeholder="Jot down a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </form>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[200px] scrollbar-thin">
              {filteredNotes.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-500 text-center mt-6 text-sm italic">
                  No notes for this selection yet.
                </p>
              ) : (
                filteredNotes.map((note) => (
                  <div 
                    key={note.id} 
                    className="flex justify-between items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm group hover:shadow-md transition-shadow"
                  >
                    <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                      {note.text}
                    </p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}