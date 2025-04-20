import { 
  Card as HeroCard, 
  CardContent as HeroCardContent,
  CardDescription as HeroCardDescription,
  CardFooter as HeroCardFooter,
  CardHeader as HeroCardHeader,
  CardTitle as HeroCardTitle,
  CardProps as HeroCardProps
} from "@heroui/react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface CardProps extends HeroCardProps {}

// Export the HeroUI Card component as our own Card component
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroCard 
        ref={ref} 
        className={cn(className)} 
        {...props} 
      />
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <HeroCardHeader ref={ref} className={cn(className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <HeroCardTitle ref={ref} className={cn(className)} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <HeroCardDescription ref={ref} className={cn(className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <HeroCardContent ref={ref} className={cn(className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <HeroCardFooter ref={ref} className={cn(className)} {...props} />
));
CardFooter.displayName = "CardFooter";