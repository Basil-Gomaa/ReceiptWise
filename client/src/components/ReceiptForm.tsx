import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

// Define the schema for the form
const receiptFormSchema = z.object({
  merchantName: z.string().min(1, "Merchant name is required"),
  total: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Total must be a positive number" }
  ),
  date: z.date({ required_error: "Please select a date" }),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
});

type ReceiptFormValues = z.infer<typeof receiptFormSchema>;

interface ReceiptFormProps {
  onSubmit: (values: ReceiptFormValues) => void;
  categories: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  initialValues?: Partial<ReceiptFormValues>;
  isLoading?: boolean;
}

export default function ReceiptForm({
  onSubmit,
  categories,
  initialValues,
  isLoading = false,
}: ReceiptFormProps) {
  // Initialize the form with default values
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: {
      merchantName: initialValues?.merchantName || "",
      total: initialValues?.total !== undefined 
        ? String(initialValues.total) 
        : "",
      date: initialValues?.date || new Date(),
      categoryId: initialValues?.categoryId 
        ? String(initialValues.categoryId) 
        : undefined,
      notes: initialValues?.notes || "",
    },
  });

  const handleSubmit = (values: ReceiptFormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader>
        <CardTitle>Receipt Details</CardTitle>
        <CardDescription>
          Enter the details of your receipt manually
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="merchantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Merchant Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Store or Service Provider" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Uncategorized</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          <div className="flex items-center">
                            <span
                              className="h-3 w-3 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            ></span>
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about this expense"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Receipt"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}