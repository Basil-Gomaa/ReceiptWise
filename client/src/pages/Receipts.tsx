import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Download, Search, SlidersHorizontal, Database, Calendar as CalendarIcon, ChevronDown, ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import FileUploader from "@/components/FileUploader";
import OcrProcessingUI from "@/components/OcrProcessingUI";
import ReceiptCard from "@/components/ReceiptCard";
import AddReceiptModal from "@/components/AddReceiptModal";
import { formatCurrency, formatDateString } from "@/lib/utils";

// Type definitions for the API responses
interface Receipt {
  id: number;
  merchantName: string;
  total: number;
  date: string;
  categoryId?: number;
  notes?: string;
  imageUrl?: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

interface UploadResponse {
  ocrError?: string;
  ocrText?: string;
  receipt?: Receipt;
  id?: number;
  merchantName?: string;
  total?: number;
  date?: string;
  categoryId?: number;
  notes?: string;
  imageUrl?: string;
}

export default function Receipts() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Advanced filtering and sorting states
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "merchant">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [amountRange, setAmountRange] = useState<{
    min: number | undefined;
    max: number | undefined;
  }>({
    min: undefined,
    max: undefined,
  });
  
  // Check if any advanced filters are active
  const hasActiveFilters = useRef(false);
  
  // Determine if advanced filters are active
  useEffect(() => {
    hasActiveFilters.current = (
      (sortBy !== "date" || sortDirection !== "desc") || 
      dateRange.from !== undefined || 
      dateRange.to !== undefined || 
      amountRange.min !== undefined || 
      amountRange.max !== undefined
    );
  }, [sortBy, sortDirection, dateRange, amountRange]);

  // Fetch receipts and categories
  const { data: receipts = [], isLoading: receiptsLoading } = useQuery<Receipt[]>({
    queryKey: ["/api/receipts"],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Mutation for uploading receipts
  const uploadMutation = useMutation<UploadResponse, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await apiRequest("POST", "/api/upload", formData);
        const data = await response.json() as UploadResponse;
        
        // Handle case where the API returned success but with OCR errors
        if (data.ocrError) {
          // Check if this is a message about falling back to Gemini AI
          if (data.ocrError.includes("Trying alternative OCR")) {
            setOcrError("Google Vision API unavailable. Trying Gemini AI...");
          } else {
            setOcrError(data.ocrError);
          }
          // We still return the data since the receipt was saved
          return data;
        }
        
        return data;
      } catch (error: any) {
        // Set the OCR error message
        setOcrError(error.message);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly-comparison"] });
      
      // If there was an OCR error or we had to use fallback method, show appropriate toast
      if (data.ocrError) {
        // If Gemini AI was used as fallback (ocrError exists but we also have ocrText)
        if (data.ocrError.includes("Trying alternative OCR") && data.ocrText) {
          toast({
            title: "Receipt processed with Gemini AI",
            description: "Google Vision API was unavailable, but Gemini AI successfully extracted the text. Please verify the details.",
          });
        } else {
          toast({
            title: "Receipt uploaded with limitations",
            description: "Your receipt was saved, but automatic data extraction failed. You can edit details manually.",
          });
        }
      } else {
        toast({
          title: "Receipt uploaded successfully",
          description: "Your receipt has been processed and added to your expenses.",
        });
      }
      
      // Reset states after a delay to show completion
      setTimeout(() => {
        setIsUploading(false);
        setOcrProgress(0);
        setOcrError(undefined);
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      
      // Reset states after a delay
      setTimeout(() => {
        setIsUploading(false);
        setOcrProgress(0);
        setOcrError(undefined);
      }, 2000);
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
  const deleteMutation = useMutation<number, Error, number>({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/receipts/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly-comparison"] });
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

  // Apply the advanced filters and sorting
  const filteredAndSortedReceipts = receipts
    .filter((receipt: Receipt) => {
      // Apply basic filters (search query and category)
      const matchesSearch = searchQuery === "" || 
        receipt.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || 
        receipt.categoryId === parseInt(selectedCategory);
      
      // Apply date range filter
      const receiptDate = new Date(receipt.date);
      const matchesDateFrom = !dateRange.from || receiptDate >= dateRange.from;
      const matchesDateTo = !dateRange.to || receiptDate <= dateRange.to;
      
      // Apply amount range filter
      const receiptAmount = typeof receipt.total === 'string' ? parseFloat(receipt.total) : receipt.total;
      const matchesAmountMin = amountRange.min === undefined || receiptAmount >= amountRange.min;
      const matchesAmountMax = amountRange.max === undefined || receiptAmount <= amountRange.max;
      
      return matchesSearch && matchesCategory && matchesDateFrom && matchesDateTo && 
        matchesAmountMin && matchesAmountMax;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      if (sortBy === "amount") {
        const amountA = typeof a.total === 'string' ? parseFloat(a.total) : a.total;
        const amountB = typeof b.total === 'string' ? parseFloat(b.total) : b.total;
        return sortDirection === "asc" ? amountA - amountB : amountB - amountA;
      }
      
      if (sortBy === "merchant") {
        const merchantA = a.merchantName.toLowerCase();
        const merchantB = b.merchantName.toLowerCase();
        return sortDirection === "asc" 
          ? merchantA.localeCompare(merchantB) 
          : merchantB.localeCompare(merchantA);
      }
      
      return 0;
    });
    
  // Reset to previous variable name for compatibility
  const filteredReceipts = filteredAndSortedReceipts;

  // Seed data mutation
  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seed");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly-comparison"] });
      
      toast({
        title: "Test data generated",
        description: data.message || "Dummy receipts were successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate test data",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle seed data generation
  const handleSeedData = () => {
    if (window.confirm("This will generate test receipts data. Continue?")) {
      seedMutation.mutate();
    }
  };
  
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
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Receipts</h1>
        <AddReceiptModal categories={categories} />
        
        {/* OCR Processing UI */}
        {isUploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <OcrProcessingUI 
                  progress={ocrProgress} 
                  errorMessage={ocrError} 
                />
              </CardContent>
            </Card>
          </div>
        )}
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
              {categories.map((category: Category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <button 
                  className={`p-2 rounded-lg relative ${
                    isFilterOpen 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                      : hasActiveFilters.current
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  {hasActiveFilters.current && !isFilterOpen && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                  )}
                </button>
              </PopoverTrigger>
              
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Filter & Sort</h3>
                  
                  {/* Sort Options */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Sort By</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        className={`py-1 px-2 rounded-md text-sm text-center ${
                          sortBy === "date" 
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400" 
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                        onClick={() => setSortBy("date")}
                      >
                        Date
                      </button>
                      <button
                        className={`py-1 px-2 rounded-md text-sm text-center ${
                          sortBy === "amount" 
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400" 
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                        onClick={() => setSortBy("amount")}
                      >
                        Amount
                      </button>
                      <button
                        className={`py-1 px-2 rounded-md text-sm text-center ${
                          sortBy === "merchant" 
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400" 
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                        onClick={() => setSortBy("merchant")}
                      >
                        Merchant
                      </button>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Order</span>
                      <button
                        className="flex items-center space-x-1 text-sm bg-gray-100 dark:bg-gray-800 py-1 px-2 rounded-md"
                        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                      >
                        {sortDirection === "asc" ? (
                          <>
                            <ArrowUp className="h-4 w-4" />
                            <span>Ascending</span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="h-4 w-4" />
                            <span>Descending</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Date Range */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Date Range</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-sm"
                          >
                            <span>
                              {dateRange.from ? format(dateRange.from, 'PP') : 'From date'}
                            </span>
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => 
                              setDateRange(prev => ({...prev, from: date}))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-sm"
                          >
                            <span>
                              {dateRange.to ? format(dateRange.to, 'PP') : 'To date'}
                            </span>
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => 
                              setDateRange(prev => ({...prev, to: date}))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {(dateRange.from || dateRange.to) && (
                      <button 
                        className="mt-1 text-xs text-blue-600 dark:text-blue-400"
                        onClick={() => setDateRange({from: undefined, to: undefined})}
                      >
                        Clear dates
                      </button>
                    )}
                  </div>
                  
                  {/* Amount Range */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Amount Range</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          placeholder="Min ($)"
                          value={amountRange.min === undefined ? '' : amountRange.min}
                          onChange={(e) => setAmountRange(prev => ({
                            ...prev, 
                            min: e.target.value === '' ? undefined : Number(e.target.value)
                          }))}
                          className="w-full p-2 rounded-md text-sm bg-gray-100 dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Max ($)"
                          value={amountRange.max === undefined ? '' : amountRange.max}
                          onChange={(e) => setAmountRange(prev => ({
                            ...prev, 
                            max: e.target.value === '' ? undefined : Number(e.target.value)
                          }))}
                          className="w-full p-2 rounded-md text-sm bg-gray-100 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    {(amountRange.min !== undefined || amountRange.max !== undefined) && (
                      <button 
                        className="mt-1 text-xs text-blue-600 dark:text-blue-400"
                        onClick={() => setAmountRange({min: undefined, max: undefined})}
                      >
                        Clear amounts
                      </button>
                    )}
                  </div>
                  
                  {/* Reset all filters */}
                  <div className="pt-2">
                    <Button 
                      onClick={() => {
                        setSortBy("date");
                        setSortDirection("desc");
                        setDateRange({from: undefined, to: undefined});
                        setAmountRange({min: undefined, max: undefined});
                        setIsFilterOpen(false);
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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
            {filteredReceipts.map((receipt: Receipt) => {
              const category = categories.find((cat: Category) => cat.id === receipt.categoryId);
              
              return (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  category={category}
                  onDelete={() => handleDeleteReceipt(receipt.id)}
                  onEdit={() => {
                    // Future feature: implement edit functionality
                    toast({
                      title: "Edit receipt",
                      description: "The edit receipt feature will be available soon. For now, you can delete and re-upload with correct details.",
                    });
                  }}
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
            
            {!searchQuery && selectedCategory === "all" && (
              <div className="flex justify-center mt-2">
                <Button 
                  onClick={handleSeedData} 
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  disabled={seedMutation.isPending}
                >
                  <Database className="h-5 w-5" />
                  <span>{seedMutation.isPending ? 'Generating...' : 'Generate Test Data'}</span>
                </Button>
              </div>
            )}
          </div>
        )}
        
        {receipts.length > 0 && (
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
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleSeedData} 
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  disabled={seedMutation.isPending}
                >
                  <Database className="h-5 w-5" />
                  <span>{seedMutation.isPending ? 'Generating...' : 'Generate Test Data'}</span>
                </Button>
                <Button onClick={handleExportCsv} className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
