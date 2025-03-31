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
      <div className="fixed bottom-4 left-4 right-4 z-40 glass-effect shadow-lg rounded-full pb-safe">
        <div className="flex items-center justify-around px-4 py-3">
          <Link href="/">
            <div className={`flex flex-col items-center ${isActive("/") ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"}`}>
              <div className={`p-1.5 rounded-full ${isActive("/") ? "bg-primary/20 text-primary dark:text-primary-foreground" : ""}`}>
                <PieChart className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-1">Dashboard</span>
            </div>
          </Link>
          
          <Link href="/receipts">
            <div className={`flex flex-col items-center ${isActive("/receipts") ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"}`}>
              <div className={`p-1.5 rounded-full ${isActive("/receipts") ? "bg-primary/20 text-primary dark:text-primary-foreground" : ""}`}>
                <ReceiptText className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-1">Receipts</span>
            </div>
          </Link>
          
          <Link href="/categories">
            <div className={`flex flex-col items-center ${isActive("/categories") ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"}`}>
              <div className={`p-1.5 rounded-full ${isActive("/categories") ? "bg-primary/20 text-primary dark:text-primary-foreground" : ""}`}>
                <Tags className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-1">Categories</span>
            </div>
          </Link>
          
          <Link href="/settings">
            <div className={`flex flex-col items-center ${isActive("/settings") ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"}`}>
              <div className={`p-1.5 rounded-full ${isActive("/settings") ? "bg-primary/20 text-primary dark:text-primary-foreground" : ""}`}>
                <SettingsIcon className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-1">Settings</span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Desktop navigation - Left sidebar similar to the design
  return (
    <div className="mb-8 flex justify-center sm:justify-start">
      <div className="glass-effect rounded-full p-1.5 flex items-center justify-between gap-1 shadow-sm">
        <Link href="/">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/") 
              ? "bg-primary text-white dark:text-[#0f172a] font-medium shadow-sm" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"}
          `}>
            <PieChart className="h-4 w-4" />
            <span className="text-sm">Dashboard</span>
          </div>
        </Link>
        
        <Link href="/receipts">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/receipts") 
              ? "bg-primary text-white dark:text-[#0f172a] font-medium shadow-sm" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"}
          `}>
            <ReceiptText className="h-4 w-4" />
            <span className="text-sm">Receipts</span>
          </div>
        </Link>
        
        <Link href="/categories">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/categories") 
              ? "bg-primary text-white dark:text-[#0f172a] font-medium shadow-sm" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"}
          `}>
            <Tags className="h-4 w-4" />
            <span className="text-sm">Categories</span>
          </div>
        </Link>
        
        <Link href="/settings">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/settings") 
              ? "bg-primary text-white dark:text-[#0f172a] font-medium shadow-sm" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"}
          `}>
            <SettingsIcon className="h-4 w-4" />
            <span className="text-sm">Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
