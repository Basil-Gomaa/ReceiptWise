import { motion } from "framer-motion";
import { Calendar, PencilLine, Trash2, Eye, ReceiptText, Tag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDateString } from "@/lib/utils";

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
  const formattedDate = formatDateString(receipt.date);
  const needsManualEntry = receipt.merchantName.includes("Needs Manual Entry") || 
                          (receipt.notes && receipt.notes.includes("OCR processing failed")) ||
                          receipt.total === 0;

  // Extract product information from receipt notes if available
  const hasProducts = receipt.notes && receipt.notes.includes("Products detected:");
  const products = hasProducts && receipt.notes
    ? receipt.notes?.replace("Products detected:", "").replace(/\.$/, "").trim().split(', ')
    : [];

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className={`card-hover h-full ${needsManualEntry ? 'border-2 border-amber-400 dark:border-amber-600' : ''} overflow-hidden`}>
        {needsManualEntry && (
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 text-amber-800 dark:text-amber-300 text-xs font-medium text-center flex items-center justify-center gap-1">
            <PencilLine className="h-3 w-3" />
            Needs manual data entry
          </div>
        )}
        
        <CardHeader className="p-4 pb-1">
          <div className="flex justify-between items-start">
            <div className="w-3/4">
              <CardTitle className="text-base font-semibold line-clamp-1">
                {receipt.merchantName}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </CardDescription>
            </div>
            <div>
              {category ? (
                <Badge 
                  className="font-medium text-[10px] sm:text-xs whitespace-nowrap" 
                  style={{ backgroundColor: category.color, color: 'white' }}
                >
                  {category.name}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap">
                  Uncategorized
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-2">
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ReceiptText className="h-3 w-3" />
              <span>Receipt #{receipt.id}</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(receipt.total)}
            </p>
          </div>
          
          {hasProducts && products.length > 0 && (
            <div className="mt-3">
              <Separator className="my-2" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {products.map((product, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-[10px] sm:text-xs font-normal bg-primary/5 text-primary-foreground/90 whitespace-nowrap"
                  >
                    {product}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {!hasProducts && receipt.notes && (
            <div className="mt-3">
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground italic line-clamp-2">
                {receipt.notes}
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-3 pt-0 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs font-medium flex items-center gap-1.5 h-8 px-2.5"
          >
            <Eye className="h-3.5 w-3.5" />
            Details
          </Button>
          
          <div className="flex gap-1">
            <Button 
              variant={needsManualEntry ? "default" : "ghost"}
              size="sm"
              className={`h-8 w-8 p-0 ${needsManualEntry ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'hover:bg-primary/5 text-muted-foreground hover:text-foreground'}`}
              onClick={onEdit}
            >
              <PencilLine className="h-3.5 w-3.5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
