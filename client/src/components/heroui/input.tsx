import { Input as HeroInput, InputProps as HeroInputProps } from "@heroui/react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface InputProps extends HeroInputProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroInput
        className={cn(className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";