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
    notes?: string;
  };
  category?: {
    id: number;
    name: string;
    color: string;
  };
  onDelete: () => void;
  onEdit?: () => void;
}

export default function ReceiptCard({ receipt, category, onDelete, onEdit }: ReceiptCardProps) {
  const formattedDate = new Date(receipt.date).toLocaleDateString();
  const formattedTime = new Date(receipt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Check if this receipt likely needs manual data entry
  const needsManualEntry = receipt.merchantName.includes("Needs Manual Entry") || 
                          (receipt.notes && receipt.notes.includes("OCR processing failed")) ||
                          receipt.total === 0;

  return (
    <motion.div 
      className={`receipt-card ${needsManualEntry ? 'border-2 border-orange-300 dark:border-orange-600' : ''} bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {needsManualEntry && (
        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 text-orange-800 dark:text-orange-300 text-sm text-center">
          This receipt needs manual data entry
        </div>
      )}
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
        
        {receipt.notes && (
          <div className="mt-2 text-sm">
            {receipt.notes.includes("Products detected:") ? (
              <div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Items:</p>
                <p className="text-gray-600 dark:text-gray-300">
                  {receipt.notes.replace("Products detected:", "").replace(/\.$/, "").trim()}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 italic">{receipt.notes}</p>
            )}
          </div>
        )}
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
            variant={needsManualEntry ? "outline" : "ghost"}
            size="icon"
            className={`p-1 rounded-full ${needsManualEntry ? 'border-orange-300 bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-400 animate-pulse' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            onClick={onEdit}
          >
            <PencilLine className={`h-5 w-5 ${needsManualEntry ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'}`} />
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
