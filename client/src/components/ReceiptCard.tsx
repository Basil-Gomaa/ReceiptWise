import { motion } from "framer-motion";
import { Calendar, PencilLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface ReceiptCardProps {
  receipt: {
    id: number;
    merchantName: string;
    total: number;
    date: string;
    categoryId?: number;
  };
  category?: {
    id: number;
    name: string;
    color: string;
  };
  onDelete: () => void;
}

export default function ReceiptCard({ receipt, category, onDelete }: ReceiptCardProps) {
  const formattedDate = new Date(receipt.date).toLocaleDateString();
  const formattedTime = new Date(receipt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div 
      className="receipt-card bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">{receipt.merchantName}</h3>
          {category ? (
            <span 
              className="text-xs font-semibold px-2.5 py-0.5 rounded"
              style={{ 
                backgroundColor: `${category.color}20`, 
                color: category.color 
              }}
            >
              {category.name}
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded">
              Uncategorized
            </span>
          )}
        </div>
        <p className="text-2xl font-bold mt-2">{formatCurrency(receipt.total)}</p>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
          <span>{formattedDate}</span>
          <span>{formattedTime}</span>
        </div>
      </div>
      <div className="p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 text-sm font-medium"
        >
          View Details
        </Button>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <PencilLine className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={onDelete}
          >
            <Trash2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
