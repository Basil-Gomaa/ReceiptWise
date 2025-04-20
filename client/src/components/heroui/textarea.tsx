import { Textarea as HeroTextarea, TextareaProps as HeroTextareaProps } from "@heroui/react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface TextareaProps extends HeroTextareaProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroTextarea
        className={cn(className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";