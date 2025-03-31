import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface OcrProcessingUIProps {
  progress: number;
  errorMessage?: string;
}

export default function OcrProcessingUI({ progress, errorMessage }: OcrProcessingUIProps) {
  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-medium text-center">
        {progress < 100 ? "Processing Receipt..." : "Processing Complete"}
      </h3>
      
      <Progress value={progress} className="h-2 w-full" />
      
      <p className="text-sm text-center text-muted-foreground">
        {progress < 100 
          ? "We're analyzing your receipt. This may take a moment..."
          : "Analysis complete!"}
      </p>
      
      {errorMessage && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
      
      {progress === 100 && !errorMessage && (
        <div className="flex justify-center">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
      )}
    </div>
  );
}