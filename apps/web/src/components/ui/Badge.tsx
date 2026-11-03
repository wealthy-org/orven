import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "destructive";
  size?: "sm" | "md";
}

export function Badge({
  className = "",
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={`ui-badge ui-badge-${variant} ui-badge-${size} ${className}`} {...props}>
      {children}
    </div>
  );
}
