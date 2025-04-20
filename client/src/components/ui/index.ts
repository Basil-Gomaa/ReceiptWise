// This file re-exports components from NextUI with our wrapper components
// to make it easier to switch UI libraries 

// Import and re-export card components
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from "../nextui/Card";

// Import and re-export badge component
import { Badge } from "../nextui/Badge";

// Import and re-export select components
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "../nextui/Select";

// Import and re-export skeleton component
import { Skeleton } from "../nextui/Skeleton";

// Export all components
export {
  // Card components
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  
  // Display components
  Badge,
  Skeleton,
  
  // Form components
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
};