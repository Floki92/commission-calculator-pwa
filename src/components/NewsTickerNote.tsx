import React, { useState, useRef, useEffect } from 'react';
import { Pencil, Check } from 'lucide-react';

interface NewsTickerNoteProps {
  note: string;
  onNoteChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

export const NewsTickerNote = React.memo(function NewsTickerNote({
  note,
  onNoteChange,
  className = '',
  placeholder = "Must Get 90% of High GA's to not lose any Over in Low GA's",
}: NewsTickerNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shiftDistance, setShiftDistance] = useState<number>(140);

  const displayText = note || placeholder;

  useEffect(() => {
    setDraft(note);
  }, [note]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Calculate overflow shift so the entire note is displayed from beginning to end and back
  useEffect(() => {
    const calculateShift = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const textWidth = textRef.current.scrollWidth;
        if (textWidth > containerWidth) {
          // Extra 24px so the end has breathing room
          setShiftDistance(Math.ceil(textWidth - containerWidth + 24));
        } else {
          // Subtle gentle shift even when it fits, or 0
          setShiftDistance(0);
        }
      }
    };

    calculateShift();
    window.addEventListener('resize', calculateShift);
    return () => window.removeEventListener('resize', calculateShift);
  }, [displayText, isEditing]);

  const handleSave = () => {
    onNoteChange(draft.trim() ? draft : placeholder);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setDraft(note);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`news-ticker-container relative flex items-center gap-1.5 bg-gradient-to-r from-red-50 via-white to-red-50 border border-red-300 hover:border-red-400 rounded-lg px-2 py-1 shadow-2xs overflow-hidden transition-all ${className}`}
    >
      {/* News Badge with live pulse */}
      <div className="flex items-center gap-1 bg-[#E60000] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-2xs shrink-0 select-none tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        <span className="font-extrabold">NOTE</span>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="text-xs font-bold text-red-950 bg-white border border-red-300 rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-[#E60000] w-full"
          />
          <button
            type="button"
            onClick={handleSave}
            className="p-1 rounded bg-[#E60000] text-white hover:bg-red-700 transition-colors shrink-0"
            title="Save note"
          >
            <Check className="w-3 h-3" />
          </button>
        </div>
      ) : (
        /* Live News Ping-Pong Ticker: Moves from Right to Left and back (vice-versa) to display entire note */
        <div
          ref={containerRef}
          onClick={() => setIsEditing(true)}
          className="relative flex-1 overflow-hidden h-5.5 flex items-center cursor-pointer select-none group min-w-0"
          title="Click to edit rule note"
        >
          {/* Animated Ping-Pong Text (Right to Left and Back) */}
          <div
            className={`print:hidden export-hide-input ${
              shiftDistance > 0 ? 'news-ticker-pingpong' : 'flex items-center'
            }`}
            style={
              shiftDistance > 0
                ? ({ '--ticker-shift': `${shiftDistance}px` } as React.CSSProperties)
                : undefined
            }
          >
            <span
              ref={textRef}
              className="text-[11px] sm:text-xs font-bold text-red-950 tracking-wide whitespace-nowrap inline-block pr-4"
            >
              {displayText}
            </span>
          </div>

          {/* Static Clean Text for Print & PDF Export */}
          <span className="hidden print:inline export-show-text text-[11px] font-bold text-red-950 truncate">
            {displayText}
          </span>

          {/* Quick Edit indicator on hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto pl-1 text-red-600 hover:text-red-800 shrink-0 print:hidden export-hide-input"
            title="Edit note"
            aria-label="Edit note"
          >
            <Pencil className="w-2.5 h-2.5" />
          </button>
        </div>
      )}
    </div>
  );
});
