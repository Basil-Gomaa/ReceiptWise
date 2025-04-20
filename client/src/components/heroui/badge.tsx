import { Badge as HeroBadge, BadgeProps as HeroBadgeProps } from "@heroui/react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface BadgeProps extends HeroBadgeProps {}

// Export the HeroUI Badge component as our own Badge component
export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroBadge 
        ref={ref} 
        className={cn(className)} 
        {...props} 
      />
    );
  }
);

Badge.displayName = "Badge";