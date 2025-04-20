import {
  Select as HeroSelect,
  SelectContent as HeroSelectContent,
  SelectGroup as HeroSelectGroup,
  SelectItem as HeroSelectItem,
  SelectLabel as HeroSelectLabel,
  SelectScrollDownButton as HeroSelectScrollDownButton,
  SelectScrollUpButton as HeroSelectScrollUpButton,
  SelectSeparator as HeroSelectSeparator,
  SelectTrigger as HeroSelectTrigger,
  SelectValue as HeroSelectValue,
  SelectProps as HeroSelectProps,
} from "@heroui/react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Select = HeroSelect;
export const SelectGroup = HeroSelectGroup;
export const SelectLabel = HeroSelectLabel;
export const SelectScrollUpButton = HeroSelectScrollUpButton;
export const SelectScrollDownButton = HeroSelectScrollDownButton;
export const SelectSeparator = HeroSelectSeparator;

export const SelectValue = forwardRef<
  React.ElementRef<typeof HeroSelectValue>,
  React.ComponentPropsWithoutRef<typeof HeroSelectValue>
>(({ className, ...props }, ref) => (
  <HeroSelectValue ref={ref} className={cn(className)} {...props} />
));
SelectValue.displayName = "SelectValue";

export const SelectTrigger = forwardRef<
  React.ElementRef<typeof HeroSelectTrigger>,
  React.ComponentPropsWithoutRef<typeof HeroSelectTrigger>
>(({ className, ...props }, ref) => (
  <HeroSelectTrigger ref={ref} className={cn(className)} {...props} />
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectContent = forwardRef<
  React.ElementRef<typeof HeroSelectContent>,
  React.ComponentPropsWithoutRef<typeof HeroSelectContent>
>(({ className, ...props }, ref) => (
  <HeroSelectContent ref={ref} className={cn(className)} {...props} />
));
SelectContent.displayName = "SelectContent";

export const SelectItem = forwardRef<
  React.ElementRef<typeof HeroSelectItem>,
  React.ComponentPropsWithoutRef<typeof HeroSelectItem>
>(({ className, ...props }, ref) => (
  <HeroSelectItem ref={ref} className={cn(className)} {...props} />
));
SelectItem.displayName = "SelectItem";