import React, { useState, useEffect } from 'react';

export const AnalogClockHero: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="flex flex-col items-center justify-center pt-2 pb-6 select-none">
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        {/* Analog Clock SVG Dial */}
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* Subtle outer dial circle */}
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="white"
            stroke="#E5E7EB"
            strokeWidth="1"
          />

          {/* 60 Minute/Second Tick Marks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const isHourTick = i % 5 === 0;
            const angle = (i * 6 * Math.PI) / 180;
            const r1 = 92;
            const r2 = isHourTick ? 85 : 88;
            const x1 = 100 + r1 * Math.sin(angle);
            const y1 = 100 - r1 * Math.cos(angle);
            const x2 = 100 + r2 * Math.sin(angle);
            const y2 = 100 - r2 * Math.cos(angle);

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isHourTick ? '#9CA3AF' : '#E5E7EB'}
                strokeWidth={isHourTick ? '1.2' : '0.8'}
              />
            );
          })}

          {/* Clock Numerals 1 to 12 */}
          {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
            const angle = (num * 30 * Math.PI) / 180;
            const r = 74;
            const x = 100 + r * Math.sin(angle);
            const y = 100 - r * Math.cos(angle) + 4; // slight vertical centering offset

            return (
              <text
                key={num}
                x={x}
                y={y}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="#1F2937"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {num}
              </text>
            );
          })}

          {/* Hour Hand */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="52"
            stroke="#111827"
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${hourDeg} 100 100)`}
          />

          {/* Minute Hand */}
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="34"
            stroke="#4B5563"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${minuteDeg} 100 100)`}
          />

          {/* Second Hand (Red with subtle dot) */}
          <line
            x1="100"
            y1="112"
            x2="100"
            y2="24"
            stroke="#EF4444"
            strokeWidth="1.2"
            strokeLinecap="round"
            transform={`rotate(${secondDeg} 100 100)`}
          />

          {/* Center Pivot Point */}
          <circle cx="100" cy="100" r="3.5" fill="#111827" />
          <circle cx="100" cy="100" r="1.5" fill="#EF4444" />
        </svg>
      </div>
    </div>
  );
};
