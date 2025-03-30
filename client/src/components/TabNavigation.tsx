import { Link, useLocation } from "wouter";
import { BarChart, ReceiptText, Tags, Settings as SettingsIcon, PieChart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TabNavigation() {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location === path;

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 backdrop-blur-md bg-white/70 dark:bg-background/70 shadow-lg border border-border rounded-full pb-safe">
        <div className="flex items-center justify-around px-4 py-3">
          <Link href="/">
            <div className={`flex flex-col items-center ${isActive("/") ? "text-primary font-medium" : "text-muted-foreground"}`}>
              <div className={`p-1.5 rounded-full ${isActive("/") ? "bg-white dark:bg-primary/10" : ""}`}>
                <PieChart className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-1">Dashboard</span>
            </div>
          </Link>
          
          <Link href="/receipts">
            <div className={`flex flex-col items-center ${isActive("/receipts") ? "text-primary font-medium" : "text-muted-foreground"}`}>
              <div className={`p-1.5 rounded-full ${isActive("/receipts") ? "bg-white dark:bg-primary/10" : ""}`}>
                <ReceiptText className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-1">Receipts</span>
            </div>
          </Link>
          
          <Link href="/categories">
            <div className={`flex flex-col items-center ${isActive("/categories") ? "text-primary font-medium" : "text-muted-foreground"}`}>
              <div className={`p-1.5 rounded-full ${isActive("/categories") ? "bg-white dark:bg-primary/10" : ""}`}>
                <Tags className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-1">Categories</span>
            </div>
          </Link>
          
          <Link href="/settings">
            <div className={`flex flex-col items-center ${isActive("/settings") ? "text-primary font-medium" : "text-muted-foreground"}`}>
              <div className={`p-1.5 rounded-full ${isActive("/settings") ? "bg-white dark:bg-primary/10" : ""}`}>
                <SettingsIcon className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-1">Settings</span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Desktop navigation
  return (
    <div className="mb-8 flex justify-center sm:justify-start">
      <div className="backdrop-blur-sm bg-white/70 dark:bg-primary/5 rounded-full p-1.5 flex items-center justify-between gap-1 shadow-sm border border-gray-100 dark:border-gray-800">
        <Link href="/">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/") 
              ? "bg-primary text-white font-medium shadow-sm" 
              : "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-primary/10"}
          `}>
            <PieChart className="h-4 w-4" />
            <span className="text-sm">Dashboard</span>
          </div>
        </Link>
        
        <Link href="/receipts">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/receipts") 
              ? "bg-primary text-white font-medium shadow-sm" 
              : "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-primary/10"}
          `}>
            <ReceiptText className="h-4 w-4" />
            <span className="text-sm">Receipts</span>
          </div>
        </Link>
        
        <Link href="/categories">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/categories") 
              ? "bg-primary text-white font-medium shadow-sm" 
              : "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-primary/10"}
          `}>
            <Tags className="h-4 w-4" />
            <span className="text-sm">Categories</span>
          </div>
        </Link>
        
        <Link href="/settings">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/settings") 
              ? "bg-primary text-white font-medium shadow-sm" 
              : "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-primary/10"}
          `}>
            <SettingsIcon className="h-4 w-4" />
            <span className="text-sm">Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
