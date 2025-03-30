import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { CloudUpload } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (files: FileList | null) => void;
  isUploading: boolean;
}

export default function FileUploader({ onFileSelect, isUploading }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isUploading) {
      onFileSelect(e.target.files);
      // Reset the input to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!isUploading && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  return (
    <motion.div
      className={`receipt-upload-area border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
        isDragging 
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
          : "border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500"
      }`}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept=".jpg,.jpeg,.png,.pdf" 
        multiple 
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      <CloudUpload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      
      <h3 className="text-lg font-medium mb-2">
        {isDragging ? "Drop to Upload" : "Drag & Drop or Click to Upload"}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Support for JPG, PNG, and PDF files</p>
      <p className="text-gray-400 dark:text-gray-500 text-xs">Max file size: 10MB</p>
    </motion.div>
  );
}
