import React from "react";
import { Card as NextUICard, CardBody as NextUICardBody, CardHeader as NextUICardHeader, CardFooter as NextUICardFooter } from "@nextui-org/react";

// --- Card ---
type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <NextUICard className={className}>
      {children}
    </NextUICard>
  );
};

// --- Card Content ---
type CardContentProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardContent = ({ children, className = "" }: CardContentProps) => {
  return (
    <NextUICardBody className={className}>
      {children}
    </NextUICardBody>
  );
};

// --- Card Header ---
type CardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardHeader = ({ children, className = "" }: CardHeaderProps) => {
  return (
    <NextUICardHeader className={className}>
      {children}
    </NextUICardHeader>
  );
};

// --- Card Footer ---
type CardFooterProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardFooter = ({ children, className = "" }: CardFooterProps) => {
  return (
    <NextUICardFooter className={className}>
      {children}
    </NextUICardFooter>
  );
};

// --- Card Title ---
type CardTitleProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardTitle = ({ children, className = "" }: CardTitleProps) => {
  return (
    <h3 className={`text-lg font-semibold ${className}`}>
      {children}
    </h3>
  );
};

// --- Card Description ---
type CardDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

export const CardDescription = ({ children, className = "" }: CardDescriptionProps) => {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
};