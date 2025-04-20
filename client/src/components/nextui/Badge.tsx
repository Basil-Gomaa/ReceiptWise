import React from "react";
import { Chip } from "@nextui-org/react";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "solid" | "flat" | "faded" | "shadow" | "outline";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  className?: string;
};

export const Badge = ({ 
  children, 
  variant = "solid", 
  color = "primary",
  className = "" 
}: BadgeProps) => {
  // Map the variant to NextUI's variant
  let mappedVariant: "solid" | "flat" | "faded" | "shadow" | "bordered" = "solid";
  if (variant === "outline") {
    mappedVariant = "bordered";
  } else if (variant === "solid" || variant === "flat" || variant === "faded" || variant === "shadow") {
    mappedVariant = variant;
  }

  return (
    <Chip
      variant={mappedVariant}
      color={color}
      size="sm"
      className={className}
    >
      {children}
    </Chip>
  );
};