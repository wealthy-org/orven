import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberTicker({
  value,
  delay = 0,
  className = "",
  decimalPlaces = 2,
  prefix = "",
  suffix = "",
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const animatedValueRef = useRef({ val: 0 });

  useEffect(() => {
    const obj = animatedValueRef.current;
    let animation: any = null;

    try {
      animation = animate(obj, {
        val: value,
        duration: 1200,
        delay: delay * 1000,
        ease: "outExpo",
        onUpdate: () => {
          setDisplayValue(obj.val);
        },
      });
    } catch {
      setDisplayValue(value);
    }

    return () => {
      if (animation && animation.pause) {
        animation.pause();
      }
    };
  }, [value, delay]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return (
    <span className={`num number-ticker ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
