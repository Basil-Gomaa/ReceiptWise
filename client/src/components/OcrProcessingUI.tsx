import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OcrProcessingUIProps {
  progress: number;
  errorMessage?: string;
}

export default function OcrProcessingUI({ progress, errorMessage }: OcrProcessingUIProps) {
  // Determine if we should show an API error message
  const isApiError = errorMessage && (
    errorMessage.includes("API not properly enabled") || 
    errorMessage.includes("API client not available")
  );
  
  return (
    <AnimatePresence>
      {progress > 0 && (
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`rounded-lg p-6 ${errorMessage 
            ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" 
            : "bg-gray-50 dark:bg-gray-700"}`}>
            
            <div className="flex items-center mb-4">
              {errorMessage ? (
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              ) : (
                <Shield className="h-6 w-6 text-primary-500 mr-3 animate-pulse" />
              )}
              
              <h3 className="text-lg font-medium">
                {errorMessage ? "OCR Processing Issue" : "Processing Receipt"}
              </h3>
            </div>
            
            {!errorMessage && (
              <Progress 
                value={progress} 
                className="h-2 mb-4"
              />
            )}
            
            <p className={`text-sm ${errorMessage 
              ? "text-red-600 dark:text-red-400" 
              : "text-gray-500 dark:text-gray-400"}`}>
              
              {errorMessage ? errorMessage : (
                progress < 100 
                  ? "Extracting receipt data using OCR technology..." 
                  : "Processing complete! Analyzing extracted data..."
              )}
            </p>
            
            {isApiError && (
              <div className="mt-4 flex items-start space-x-2 text-xs bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-blue-700 dark:text-blue-300">
                  The receipt will still be saved, but without automatic data extraction. 
                  You'll need to manually update the merchant name and total amount.
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
