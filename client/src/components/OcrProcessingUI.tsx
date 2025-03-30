import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OcrProcessingUIProps {
  progress: number;
}

export default function OcrProcessingUI({ progress }: OcrProcessingUIProps) {
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
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-primary-500 mr-3 animate-pulse" />
              <h3 className="text-lg font-medium">Processing Receipt</h3>
            </div>
            
            <Progress 
              value={progress} 
              className="h-2 mb-4"
            />
            
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {progress < 100 
                ? "Extracting receipt data using OCR technology..." 
                : "Processing complete! Analyzing extracted data..."}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
