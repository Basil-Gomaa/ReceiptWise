import { Button as HeroButton, ButtonProps as HeroButtonProps } from "@heroui/react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ButtonProps extends HeroButtonProps {}

// Export the HeroUI Button component as our own Button component
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroButton 
        ref={ref} 
        className={cn(className)} 
        {...props} 
      />
    );
  }
);

Button.displayName = "Button";