import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Download, Search, SlidersHorizontal } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import OcrProcessingUI from "@/components/OcrProcessingUI";
import ReceiptCard from "@/components/ReceiptCard";
import { formatCurrency } from "@/lib/utils";

export default function Receipts() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch receipts and categories
  const { data: receipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ["/api/receipts"],
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Mutation for uploading receipts
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/categories"] });
      toast({
        title: "Receipt uploaded successfully",
        description: "Your receipt has been processed and added to your expenses.",
      });
      setIsUploading(false);
      setOcrProgress(0);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setIsUploading(false);
      setOcrProgress(0);
    },
  });

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setOcrProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    const formData = new FormData();
    formData.append("receipt", files[0]);
    
    try {
      await uploadMutation.mutateAsync(formData);
    } finally {
      clearInterval(progressInterval);
      setOcrProgress(100);
      
      // Reset progress after a delay
      setTimeout(() => {
        setOcrProgress(0);
      }, 1500);
    }
  };

  // Delete receipt mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/receipts/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/categories"] });
      toast({
        title: "Receipt deleted",
        description: "The receipt has been removed from your expenses.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle receipt deletion
  const handleDeleteReceipt = (id: number) => {
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter receipts based on search and category
  const filteredReceipts = receipts 
    ? receipts.filter((receipt: any) => {
        const matchesSearch = searchQuery === "" || 
          receipt.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesCategory = selectedCategory === "all" || 
          receipt.categoryId === parseInt(selectedCategory);
        
        return matchesSearch && matchesCategory;
      })
    : [];

  // Export receipts as CSV
  const handleExportCsv = async () => {
    try {
      window.location.href = "/api/export/receipts";
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export receipts as CSV",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="receipts-tab">
      {/* Upload Section */}
      <div className="mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Receipt</h2>
            
            <FileUploader 
              onFileSelect={handleFileUpload} 
              isUploading={isUploading} 
            />
            
            {/* OCR Processing UI */}
            {isUploading && (
              <OcrProcessingUI progress={ocrProgress} />
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Receipt List Section */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-xl font-semibold">Recent Receipts</h2>
          
          <div className="flex items-center flex-wrap gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search receipts..." 
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            <select 
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories && categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
              <SlidersHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        {receiptsLoading || categoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {Array(6).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-48 w-full" />
            ))}
          </div>
        ) : filteredReceipts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredReceipts.map((receipt: any) => {
              const category = categories?.find((cat: any) => cat.id === receipt.categoryId);
              
              return (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  category={category}
                  onDelete={() => handleDeleteReceipt(receipt.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No receipts found</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {searchQuery || selectedCategory !== "all" 
                ? "Try changing your search or filter criteria" 
                : "Upload your first receipt to get started"}
            </p>
          </div>
        )}
        
        {receipts && receipts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">
                {Math.min(filteredReceipts.length, 1)}-{filteredReceipts.length}
              </span> of <span className="font-medium">{receipts.length}</span> receipts
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-50"
                  disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 disabled:opacity-50"
                  disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <Button onClick={handleExportCsv} className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export CSV</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
