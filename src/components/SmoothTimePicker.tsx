import React, { useRef, useEffect, useCallback } from 'react';

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

  const scrollTimeoutHours = useRef<any>(null);
  const scrollTimeoutMinutes = useRef<any>(null);
  const scrollTimeoutPeriod = useRef<any>(null);

  // Initialize scroll positions on mount
  useEffect(() => {
    const hIdx = HOURS.indexOf(hours);
    if (hIdx !== -1 && hoursRef.current) {
      hoursRef.current.scrollTop = hIdx * ITEM_HEIGHT;
    }
    const mIdx = MINUTES.indexOf(minutes);
    if (mIdx !== -1 && minutesRef.current) {
      minutesRef.current.scrollTop = mIdx * ITEM_HEIGHT;
    }
    const pIdx = PERIODS.indexOf(period);
    if (pIdx !== -1 && periodRef.current) {
      periodRef.current.scrollTop = pIdx * ITEM_HEIGHT;
    }
  }, []);

  const handleScrollDebounced = useCallback(
    (
      ref: React.RefObject<HTMLDivElement>,
      items: string[],
      timeoutRef: React.MutableRefObject<any>,
      onValueChange: (val: any) => void
    ) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (!ref.current) return;
        const scrollTop = ref.current.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);
        const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
        const selectedValue = items[clampedIndex];

        // Smoothly snap to exact center
        ref.current.scrollTo({
          top: clampedIndex * ITEM_HEIGHT,
          behavior: 'smooth',
        });

        onValueChange(selectedValue);

        // Light haptic feedback on wheel snap
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(8);
          } catch {}
        }
      }, 70);
    },
    []
  );

  const selectDirect = (
    ref: React.RefObject<HTMLDivElement>,
    index: number,
    onValueChange: () => void
  ) => {
    if (ref.current) {
      ref.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth',
      });
      onValueChange();
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(10);
        } catch {}
      }
    }
  };

  return (
    <div className="relative w-full max-w-xs mx-auto py-2 select-none">
      {/* Central Highlight Selection Pill */}
      <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-12 bg-emerald-500/10 border-y border-[#00B074]/30 rounded-2xl pointer-events-none z-0" />

      {/* Top & Bottom Gradient Shadows for 3D Wheel Fade */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10" />

      {/* Columns Container */}
      <div className="relative flex items-center justify-around h-48 z-0">
        {/* Hours Drum */}
        <div className="w-20 flex flex-col items-center">
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-1">
            Hour
          </div>
          <div
            ref={hoursRef}
            onScroll={() =>
              handleScrollDebounced(hoursRef, HOURS, scrollTimeoutHours, (val) =>
                onChange(val, minutes, period)
              )
            }
            className="w-full h-36 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[48px]"
            style={{ overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            {HOURS.map((h, idx) => {
              const isSelected = h === hours;
              return (
                <div
                  key={h}
                  onClick={() => selectDirect(hoursRef, idx, () => onChange(h, minutes, period))}
                  className={`h-12 flex items-center justify-center snap-center cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'text-3xl font-semibold text-gray-900 scale-105'
                      : 'text-lg font-light text-gray-300 hover:text-gray-500'
                  }`}
                >
                  {h}
                </div>
              );
            })}
          </div>
        </div>

        {/* Separator Colon */}
        <div className="text-2xl font-light text-gray-400 mt-4 select-none">:</div>

        {/* Minutes Drum */}
        <div className="w-20 flex flex-col items-center">
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-1">
            Minute
          </div>
          <div
            ref={minutesRef}
            onScroll={() =>
              handleScrollDebounced(minutesRef, MINUTES, scrollTimeoutMinutes, (val) =>
                onChange(hours, val, period)
              )
            }
            className="w-full h-36 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[48px]"
            style={{ overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            {MINUTES.map((m, idx) => {
              const isSelected = m === minutes;
              return (
                <div
                  key={m}
                  onClick={() => selectDirect(minutesRef, idx, () => onChange(hours, m, period))}
                  className={`h-12 flex items-center justify-center snap-center cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'text-3xl font-semibold text-gray-900 scale-105'
                      : 'text-lg font-light text-gray-300 hover:text-gray-500'
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
          <div className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-1">
            Period
          </div>
          <div
            ref={periodRef}
            onScroll={() =>
              handleScrollDebounced(periodRef, PERIODS, scrollTimeoutPeriod, (val) =>
                onChange(hours, minutes, val)
              )
            }
            className="w-full h-36 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[48px]"
            style={{ overscrollBehaviorY: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            {PERIODS.map((p, idx) => {
              const isSelected = p === period;
              return (
                <div
                  key={p}
                  onClick={() => selectDirect(periodRef, idx, () => onChange(hours, minutes, p))}
                  className={`h-12 flex items-center justify-center snap-center cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'text-2xl font-bold text-[#00B074] scale-105'
                      : 'text-base font-normal text-gray-300 hover:text-gray-500'
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
