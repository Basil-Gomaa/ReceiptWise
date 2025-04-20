import * as React from "react";
import {
  useForm as useHeroForm,
  Form as HeroForm,
  FormControl as HeroFormControl,
  FormDescription as HeroFormDescription,
  FormField as HeroFormField,
  FormItem as HeroFormItem,
  FormLabel as HeroFormLabel,
  FormMessage as HeroFormMessage,
  FormProps as HeroFormProps,
} from "@heroui/react";
import { Slot } from "@radix-ui/react-slot";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";

export { useForm } from "@heroui/react";

export const Form = HeroForm;

export const FormField = HeroFormField;

export const FormItem = React.forwardRef<
  React.ElementRef<typeof HeroFormItem>,
  React.ComponentPropsWithoutRef<typeof HeroFormItem>
>(({ className, ...props }, ref) => (
  <HeroFormItem ref={ref} className={cn(className)} {...props} />
));
FormItem.displayName = "FormItem";

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof HeroFormLabel>,
  React.ComponentPropsWithoutRef<typeof HeroFormLabel>
>(({ className, ...props }, ref) => (
  <HeroFormLabel ref={ref} className={cn(className)} {...props} />
));
FormLabel.displayName = "FormLabel";

export const FormControl = React.forwardRef<
  React.ElementRef<typeof HeroFormControl>,
  React.ComponentPropsWithoutRef<typeof HeroFormControl>
>(({ ...props }, ref) => <HeroFormControl ref={ref} {...props} />);
FormControl.displayName = "FormControl";

export const FormDescription = React.forwardRef<
  React.ElementRef<typeof HeroFormDescription>,
  React.ComponentPropsWithoutRef<typeof HeroFormDescription>
>(({ className, ...props }, ref) => (
  <HeroFormDescription ref={ref} className={cn(className)} {...props} />
));
FormDescription.displayName = "FormDescription";

export const FormMessage = React.forwardRef<
  React.ElementRef<typeof HeroFormMessage>,
  React.ComponentPropsWithoutRef<typeof HeroFormMessage>
>(({ className, children, ...props }, ref) => {
  const { error } = useFormContext();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <HeroFormMessage
      ref={ref}
      className={cn(className)}
      {...props}
    >
      {body}
    </HeroFormMessage>
  );
});
FormMessage.displayName = "FormMessage";