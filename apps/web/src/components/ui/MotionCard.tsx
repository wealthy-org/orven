import React, { useRef, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  enableSpotlight?: boolean;
}

export function MotionCard({
  children,
  className = "",
  enableSpotlight = true,
  style,
  ...props
}: MotionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableSpotlight || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: -1000, y: -1000 });
      }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className={`motion-card ${className}`}
      style={{ ...style }}
      {...props}
    >
      {enableSpotlight && isHovered && (
        <div
          className="motion-card-spotlight"
          style={{
            background: `radial-gradient(350px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(217, 56, 30, 0.05), transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}
      <div className="motion-card-content">{children}</div>
    </motion.div>
  );
}
