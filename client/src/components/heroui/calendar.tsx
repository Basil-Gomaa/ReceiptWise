import { Calendar as HeroCalendar, CalendarProps as HeroCalendarProps } from "@heroui/react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface CalendarProps extends HeroCalendarProps {}

export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroCalendar
        className={cn(className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Calendar.displayName = "Calendar";