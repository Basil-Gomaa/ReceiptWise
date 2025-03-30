import { useState } from "react";
import { PlusCircle, Upload, Receipt, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploader from "./FileUploader";
import ReceiptForm from "./ReceiptForm";

interface AddReceiptModalProps {
  categories: Array<{
    id: number;
    name: string;
    color: string;
  }>;
}

export default function AddReceiptModal({ categories }: AddReceiptModalProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for creating a receipt manually
  const createManualMutation = useMutation({
    mutationFn: async (formData: any) => {
      // Convert categoryId to number if present
      if (formData.categoryId) {
        formData.categoryId = parseInt(formData.categoryId);
      }
      
      // Format total as string (API expects string)
      formData.total = String(formData.total);
      
      return apiRequest("POST", "/api/receipts", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      setOpen(false);
      toast({
        title: "Receipt Added",
        description: "Your receipt has been successfully added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add receipt: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for uploading a receipt
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("POST", "/api/upload", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/receipts"] });
      setOpen(false);
      toast({
        title: "Receipt Uploaded",
        description: "Your receipt has been successfully processed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to upload receipt: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("receipt", files[0]);
    
    uploadMutation.mutate(formData, {
      onSettled: () => setIsUploading(false),
    });
  };

  const handleManualSubmit = (formData: any) => {
    createManualMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 font-medium">
          <PlusCircle className="w-4 h-4" />
          Add Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Receipt</DialogTitle>
          <DialogDescription>
            Upload an image of your receipt or enter details manually
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Receipt
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-6">
            <FileUploader 
              onFileSelect={handleFileSelect} 
              isUploading={isUploading || uploadMutation.isPending} 
            />
          </TabsContent>
          
          <TabsContent value="manual" className="mt-6">
            <ReceiptForm 
              onSubmit={handleManualSubmit} 
              categories={categories}
              isLoading={createManualMutation.isPending}
            />
          </TabsContent>
        </Tabs>
        
        <DialogClose asChild>
          <Button 
            type="button" 
            variant="outline" 
            className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}