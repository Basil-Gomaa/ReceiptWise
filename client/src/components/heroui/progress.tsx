import { Progress as HeroProgress, ProgressProps as HeroProgressProps } from "@heroui/react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ProgressProps extends HeroProgressProps {}

// Export the HeroUI Progress component as our own Progress component
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroProgress 
        ref={ref} 
        className={cn(className)} 
        {...props} 
      />
    );
  }
);

Progress.displayName = "Progress";