import { motion, AnimatePresence } from "framer-motion";
import { Shield, AlertTriangle, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OcrProcessingUIProps {
  progress: number;
  errorMessage?: string;
}

export default function OcrProcessingUI({ progress, errorMessage }: OcrProcessingUIProps) {
  // Determine message states based on the error message
  const isApiError = errorMessage && (
    errorMessage.includes("API not properly enabled") || 
    errorMessage.includes("API client not available")
  );
  
  const isGeminiFallback = errorMessage && errorMessage.includes("Trying Gemini AI");
  
  // Choose the appropriate styling and icons based on message type
  const getCardStyles = () => {
    if (isGeminiFallback) {
      return "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800";
    } else if (errorMessage) {
      return "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800";
    } else {
      return "bg-gray-50 dark:bg-gray-700";
    }
  };
  
  const getStatusIcon = () => {
    if (isGeminiFallback) {
      return <Shield className="h-6 w-6 text-amber-500 mr-3" />;
    } else if (errorMessage) {
      return <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />;
    } else {
      return <Shield className="h-6 w-6 text-primary-500 mr-3 animate-pulse" />;
    }
  };
  
  const getStatusTitle = () => {
    if (isGeminiFallback) {
      return "Using Alternative OCR";
    } else if (errorMessage) {
      return "OCR Processing Issue";
    } else {
      return "Processing Receipt";
    }
  };
  
  const getTextColor = () => {
    if (isGeminiFallback) {
      return "text-amber-600 dark:text-amber-400";
    } else if (errorMessage) {
      return "text-red-600 dark:text-red-400";
    } else {
      return "text-gray-500 dark:text-gray-400";
    }
  };
  
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
          <div className={`rounded-lg p-6 ${getCardStyles()}`}>
            
            <div className="flex items-center mb-4">
              {getStatusIcon()}
              <h3 className="text-lg font-medium">
                {getStatusTitle()}
              </h3>
            </div>
            
            {/* Always show progress bar, but different color for fallback */}
            <Progress 
              value={progress} 
              className={`h-2 mb-4 ${isGeminiFallback ? "bg-amber-100 dark:bg-amber-800" : ""}`}
            />
            
            <p className={`text-sm ${getTextColor()}`}>
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
            
            {isGeminiFallback && (
              <div className="mt-4 flex items-start space-x-2 text-xs bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-blue-700 dark:text-blue-300">
                  Google Vision API isn't available, so we're using Gemini AI to extract your receipt data. 
                  This might take longer but should still work well. Please verify the details after processing.
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
