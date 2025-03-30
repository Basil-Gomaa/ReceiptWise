import { Link, useLocation } from "wouter";
import { BarChart, ReceiptText, Tags, Settings as SettingsIcon, PieChart } from "lucide-react";

export default function TabNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <div className="mb-8 flex justify-center sm:justify-start">
      <div className="glass-effect rounded-full p-1.5 flex items-center justify-between gap-1 shadow-sm">
        <Link href="/">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/") 
              ? "active-nav-item" 
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}
          `}>
            <PieChart className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Dashboard</span>
          </div>
        </Link>
        
        <Link href="/receipts">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/receipts") 
              ? "active-nav-item" 
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}
          `}>
            <ReceiptText className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Receipts</span>
          </div>
        </Link>
        
        <Link href="/categories">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/categories") 
              ? "active-nav-item" 
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}
          `}>
            <Tags className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Categories</span>
          </div>
        </Link>
        
        <Link href="/settings">
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
            ${isActive("/settings") 
              ? "active-nav-item" 
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}
          `}>
            <SettingsIcon className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
