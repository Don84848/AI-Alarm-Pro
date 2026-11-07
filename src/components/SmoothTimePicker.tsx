import React, { useRef, useEffect } from 'react';

interface SmoothTimePickerProps {
  hours: string;
  minutes: string;
  period: 'AM' | 'PM';
  onChange: (hours: string, minutes: string, period: 'AM' | 'PM') => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const PERIODS: ('AM' | 'PM')[] = ['AM', 'PM'];

const ITEM_HEIGHT = 48; // px height of each drum item

export const SmoothTimePicker: React.FC<SmoothTimePickerProps> = ({
  hours,
  minutes,
  period,
  onChange,
}) => {
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // Scroll to position on mount or external change
  useEffect(() => {
    const hIdx = HOURS.indexOf(hours);
    if (hIdx !== -1 && hoursRef.current) {
      hoursRef.current.scrollTop = hIdx * ITEM_HEIGHT;
    }
  }, []);

  useEffect(() => {
    const mIdx = MINUTES.indexOf(minutes);
    if (mIdx !== -1 && minutesRef.current) {
      minutesRef.current.scrollTop = mIdx * ITEM_HEIGHT;
    }
  }, []);

  useEffect(() => {
    const pIdx = PERIODS.indexOf(period);
    if (pIdx !== -1 && periodRef.current) {
      periodRef.current.scrollTop = pIdx * ITEM_HEIGHT;
    }
  }, []);

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    items: string[],
    callback: (val: any) => void
  ) => {
    if (!ref.current) return;
    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
    callback(items[clampedIndex]);
  };

  const scrollToItem = (
    ref: React.RefObject<HTMLDivElement>,
    index: number
  ) => {
    if (ref.current) {
      ref.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full max-w-xs mx-auto py-4 select-none">
      {/* Central Highlight Selection Bar */}
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-12 bg-emerald-50/70 border-y border-emerald-200/80 rounded-2xl pointer-events-none z-0"
      />

      {/* Top & Bottom Gradient Shadows for 3D Drum Effect */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />

      {/* Columns Container */}
      <div className="relative flex items-center justify-around h-48 z-0">
        {/* Hours Drum */}
        <div className="w-20 flex flex-col items-center">
          <div className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-1">
            Hour
          </div>
          <div
            ref={hoursRef}
            onScroll={() =>
              handleScroll(hoursRef, HOURS, (val) => onChange(val, minutes, period))
            }
            className="w-full h-36 overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory py-[48px]"
            style={{ overscrollBehaviorY: 'contain' }}
          >
            {HOURS.map((h, idx) => {
              const isSelected = h === hours;
              return (
                <div
                  key={h}
                  onClick={() => scrollToItem(hoursRef, idx)}
                  className={`h-12 flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'text-3xl font-bold text-gray-900 scale-110'
                      : 'text-lg font-normal text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {h}
                </div>
              );
            })}
          </div>
        </div>

        {/* Separator Colon */}
        <div className="text-2xl font-bold text-gray-300 mt-4 select-none">:</div>

        {/* Minutes Drum */}
        <div className="w-20 flex flex-col items-center">
          <div className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-1">
            Minute
          </div>
          <div
            ref={minutesRef}
            onScroll={() =>
              handleScroll(minutesRef, MINUTES, (val) => onChange(hours, val, period))
            }
            className="w-full h-36 overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory py-[48px]"
            style={{ overscrollBehaviorY: 'contain' }}
          >
            {MINUTES.map((m, idx) => {
              const isSelected = m === minutes;
              return (
                <div
                  key={m}
                  onClick={() => scrollToItem(minutesRef, idx)}
                  className={`h-12 flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'text-3xl font-bold text-gray-900 scale-110'
                      : 'text-lg font-normal text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {m}
                </div>
              );
            })}
          </div>
        </div>

        {/* Period Drum (AM / PM) */}
        <div className="w-20 flex flex-col items-center">
          <div className="text-[11px] font-semibold text-gray-400 tracking-wider uppercase mb-1">
            Period
          </div>
          <div
            ref={periodRef}
            onScroll={() =>
              handleScroll(periodRef, PERIODS, (val) => onChange(hours, minutes, val))
            }
            className="w-full h-36 overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory py-[48px]"
            style={{ overscrollBehaviorY: 'contain' }}
          >
            {PERIODS.map((p, idx) => {
              const isSelected = p === period;
              return (
                <div
                  key={p}
                  onClick={() => scrollToItem(periodRef, idx)}
                  className={`h-12 flex items-center justify-center snap-center cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'text-2xl font-bold text-[#00B074] scale-110'
                      : 'text-base font-normal text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {p}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
