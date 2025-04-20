import {
  Popover as HeroPopover,
  PopoverTrigger as HeroPopoverTrigger,
  PopoverContent as HeroPopoverContent,
  PopoverProps as HeroPopoverProps,
} from "@heroui/react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Popover = HeroPopover;

export const PopoverTrigger = HeroPopoverTrigger;

export const PopoverContent = forwardRef<
  React.ElementRef<typeof HeroPopoverContent>,
  React.ComponentPropsWithoutRef<typeof HeroPopoverContent>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HeroPopoverContent
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(className)}
    {...props}
  />
));
PopoverContent.displayName = "PopoverContent";