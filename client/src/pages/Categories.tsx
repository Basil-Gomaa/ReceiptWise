import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import CategoryPill from "@/components/CategoryPill";

export default function Categories() {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#3B82F6",
    icon: "tag",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async (categoryData: typeof newCategory) => {
      const response = await apiRequest("POST", "/api/categories", categoryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category created",
        description: `Category "${newCategory.name}" has been created.`,
      });
      // Reset form
      setNewCategory({
        name: "",
        color: "#3B82F6",
        icon: "tag",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Category deleted",
        description: "The category has been removed.",
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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      toast({
        title: "Invalid category",
        description: "Category name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(newCategory);
  };

  // Handle category deletion
  const handleDeleteCategory = (id: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories 
    ? categories.filter((category: any) => 
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Color options for category creation
  const colorOptions = [
    "#EF4444", // red-500
    "#F97316", // orange-500
    "#F59E0B", // amber-500
    "#EAB308", // yellow-500
    "#84CC16", // lime-500
    "#22C55E", // green-500
    "#10B981", // emerald-500
    "#14B8A6", // teal-500
    "#06B6D4", // cyan-500
    "#3B82F6", // blue-500
    "#6366F1", // indigo-500
    "#8B5CF6", // purple-500
    "#A855F7", // fuchsia-500
    "#EC4899", // pink-500
    "#F43F5E", // rose-500
  ];

  // Icon options
  const iconOptions = [
    { value: "tag", label: "Tag" },
    { value: "shopping-bag", label: "Groceries" },
    { value: "shopping-cart", label: "Shopping" },
    { value: "car", label: "Transportation" },
    { value: "home", label: "Utilities" },
    { value: "utensils", label: "Food & Dining" },
    { value: "coffee", label: "Coffee" },
    { value: "calendar", label: "Subscriptions" },
    { value: "zap", label: "Entertainment" },
    { value: "heart", label: "Health" },
    { value: "briefcase", label: "Business" },
    { value: "book", label: "Education" },
    { value: "gift", label: "Gifts" },
  ];

  return (
    <div className="categories-tab">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Category Management */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
              
              {/* Add Category Form */}
              <form className="mb-6" onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="categoryName" className="mb-1">Category Name</Label>
                  <Input 
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g. Groceries, Travel, Coffee"
                  />
                </div>
                
                <div className="mb-4">
                  <Label className="mb-1">Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full focus:ring-2 focus:ring-offset-2 ${
                          newCategory.color === color ? 'ring-2 ring-offset-2' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                      ></button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="categoryIcon" className="mb-1">Icon (Optional)</Label>
                  <select 
                    id="categoryIcon" 
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Category"}
                  </Button>
                </div>
              </form>
              
              {/* Category Settings */}
              <div>
                <h3 className="text-md font-medium mb-3">Settings</h3>
                
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="enableSubcategories" className="text-sm">Enable Subcategories</Label>
                  <Switch id="enableSubcategories" />
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="automaticCategorization" className="text-sm">Automatic Categorization</Label>
                  <Switch id="automaticCategorization" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCategoryIcons" className="text-sm">Show Category Icons</Label>
                  <Switch id="showCategoryIcons" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Category List */}
        <div className="md:col-span-2">
          <Card>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Categories</h2>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search categories..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2" />
                </div>
                
                <select className="rounded-lg text-sm border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 py-2 px-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option>Sort by Name</option>
                  <option>Sort by Usage</option>
                  <option>Sort by Recent</option>
                </select>
              </div>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array(6).fill(0).map((_, index) => (
                    <Skeleton key={index} className="h-20 w-full" />
                  ))}
                </div>
              ) : filteredCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCategories.map((category: any) => (
                    <CategoryPill
                      key={category.id}
                      category={category}
                      onDelete={() => handleDeleteCategory(category.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery 
                      ? "No categories match your search" 
                      : "No categories yet. Create your first category to get started!"}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
