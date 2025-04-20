import React from "react";
import { Select as NextUISelect, SelectItem as NextUISelectItem } from "@nextui-org/react";

type SelectProps = {
  children: React.ReactNode;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
};

export const Select = ({ 
  children, 
  defaultValue,
  placeholder = "Select an option",
  className = "" 
}: SelectProps) => {
  return (
    <NextUISelect 
      defaultSelectedKeys={defaultValue ? [defaultValue] : undefined}
      placeholder={placeholder}
      className={className}
    >
      {children}
    </NextUISelect>
  );
};

type SelectTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

export const SelectTrigger = ({ children, className = "" }: SelectTriggerProps) => {
  // NextUISelect already includes a trigger, this is just a wrapper for compatibility
  return <div className={className}>{children}</div>;
};

type SelectValueProps = {
  placeholder?: string;
};

export const SelectValue = ({ placeholder }: SelectValueProps) => {
  // NextUISelect already handles value display
  return <span>{placeholder}</span>;
};

type SelectContentProps = {
  children: React.ReactNode;
};

export const SelectContent = ({ children }: SelectContentProps) => {
  // NextUISelect already includes content
  return <>{children}</>;
};

type SelectItemProps = {
  children: React.ReactNode;
  value: string;
  className?: string;
};

export const SelectItem = ({ children, value, className = "" }: SelectItemProps) => {
  // NextUI requires a key but not value directly
  return (
    <NextUISelectItem key={value} value={value} className={className}>
      {children}
    </NextUISelectItem>
  );
};