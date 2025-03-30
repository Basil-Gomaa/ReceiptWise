import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PencilLine, Trash2, ShoppingCart, Tag, Car, Home, Coffee, Calendar, Zap, Heart, Briefcase, Book, Gift, ShoppingBag, Utensils } from "lucide-react";

interface CategoryPillProps {
  category: {
    id: number;
    name: string;
    color: string;
    icon?: string;
  };
  onDelete: () => void;
}

export default function CategoryPill({ category, onDelete }: CategoryPillProps) {
  // Get icon component based on category icon name
  const getIcon = () => {
    switch (category.icon) {
      case 'shopping-cart':
        return <ShoppingCart className="h-5 w-5" />;
      case 'car':
        return <Car className="h-5 w-5" />;
      case 'home':
        return <Home className="h-5 w-5" />;
      case 'coffee':
        return <Coffee className="h-5 w-5" />;
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      case 'zap':
        return <Zap className="h-5 w-5" />;
      case 'heart':
        return <Heart className="h-5 w-5" />;
      case 'briefcase':
        return <Briefcase className="h-5 w-5" />;
      case 'book':
        return <Book className="h-5 w-5" />;
      case 'gift':
        return <Gift className="h-5 w-5" />;
      case 'shopping-bag':
        return <ShoppingBag className="h-5 w-5" />;
      case 'utensils':
        return <Utensils className="h-5 w-5" />;
      default:
        return <Tag className="h-5 w-5" />;
    }
  };

  return (
    <motion.div 
      className="category-pill flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3"
          style={{ backgroundColor: category.color }}
        >
          {getIcon()}
        </div>
        <div>
          <h3 className="font-medium">{category.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {/* In a real app, would show actual count */}
            {Math.floor(Math.random() * 30)} receipts
          </p>
        </div>
      </div>
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500"
        >
          <PencilLine className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500"
          onClick={onDelete}
        >
          <Trash2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </Button>
      </div>
    </motion.div>
  );
}
