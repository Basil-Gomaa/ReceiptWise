import {
  Dialog as HeroDialog,
  DialogContent as HeroDialogContent,
  DialogDescription as HeroDialogDescription,
  DialogFooter as HeroDialogFooter,
  DialogHeader as HeroDialogHeader,
  DialogTitle as HeroDialogTitle,
  DialogTrigger as HeroDialogTrigger,
  DialogClose as HeroDialogClose,
  DialogPortal as HeroDialogPortal,
  DialogOverlay as HeroDialogOverlay,
  DialogProps as HeroDialogProps,
} from "@heroui/react";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, ElementRef, HTMLAttributes, forwardRef } from "react";

export interface DialogProps extends HeroDialogProps {}

// Export the HeroUI Dialog components as our own Dialog components
export const Dialog = HeroDialog;

export const DialogTrigger = HeroDialogTrigger;

export const DialogPortal = HeroDialogPortal;

export const DialogClose = HeroDialogClose;

export const DialogOverlay = forwardRef<
  ElementRef<typeof HeroDialogOverlay>,
  ComponentPropsWithoutRef<typeof HeroDialogOverlay>
>(({ className, ...props }, ref) => (
  <HeroDialogOverlay
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

export const DialogContent = forwardRef<
  ElementRef<typeof HeroDialogContent>,
  ComponentPropsWithoutRef<typeof HeroDialogContent>
>(({ className, children, ...props }, ref) => (
  <HeroDialogPortal>
    <HeroDialogOverlay />
    <HeroDialogContent ref={ref} className={cn(className)} {...props}>
      {children}
    </HeroDialogContent>
  </HeroDialogPortal>
));
DialogContent.displayName = "DialogContent";

export const DialogHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <HeroDialogHeader
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

export const DialogFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <HeroDialogFooter
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

export const DialogTitle = forwardRef<
  ElementRef<typeof HeroDialogTitle>,
  ComponentPropsWithoutRef<typeof HeroDialogTitle>
>(({ className, ...props }, ref) => (
  <HeroDialogTitle
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = forwardRef<
  ElementRef<typeof HeroDialogDescription>,
  ComponentPropsWithoutRef<typeof HeroDialogDescription>
>(({ className, ...props }, ref) => (
  <HeroDialogDescription
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";