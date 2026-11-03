import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ShimmerButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  className?: string;
}

export function ShimmerButton({
  children,
  shimmerColor = "rgba(255, 255, 255, 0.25)",
  shimmerSize = "0.08em",
  shimmerDuration = "2.5s",
  borderRadius = "12px",
  className = "",
  disabled = false,
  style,
  ...props
}: ShimmerButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={
        {
          borderRadius,
          ...style,
        } as React.CSSProperties
      }
      className={`shimmer-button ${disabled ? "disabled" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      <div className="shimmer-sweep" aria-hidden="true" />
      <span className="shimmer-content">{children}</span>
    </motion.button>
  );
}
