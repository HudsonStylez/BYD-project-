import React, { useState, useEffect } from "react";

interface PriceCounterProps {
  value: number;
  duration?: number; // ms
  prefix?: string;
  suffix?: string;
  className?: string;
  id?: string;
}

export const PriceCounter: React.FC<PriceCounterProps> = ({
  value,
  duration = 800,
  prefix = "$",
  suffix = "",
  className = "",
  id
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = Math.max(0, value - Math.round(value * 0.15)); // Start from 85% of target for quick classy roll

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Quad ease-out equation
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const current = Math.floor(startValue + easeProgress * (value - startValue));
      
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  const formattedValue = displayValue.toLocaleString("en-US");

  return (
    <span id={id} className={`font-mono transition-all duration-300 ${className}`}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};
