import { Link, useLocation } from "wouter";
import { ReceiptText, Tags, Settings as SettingsIcon, PieChart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Navigation items
const navItems = [
  { path: "/", label: "Home", Icon: PieChart },
  { path: "/receipts", label: "Receipts", Icon: ReceiptText },
  { path: "/categories", label: "Categories", Icon: Tags },
  { path: "/settings", label: "Settings", Icon: SettingsIcon },
];

export default function TabNavigation() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  
  // Mobile navigation
  if (isMobile) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 glass-effect shadow-lg rounded-full">
        <nav className="flex justify-between">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className="w-1/4 text-center py-3"
              >
                <div 
                  className={`flex flex-col items-center ${
                    isActive 
                      ? "text-primary font-medium" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <item.Icon className="h-5 w-5" />
                  <span className="text-[10px] mt-1">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }
  
  // Desktop navigation - much simpler approach
  return (
    <div className="mb-8 flex justify-center">
      <div className="glass-effect shadow-md rounded-full px-2 py-1">
        <nav className="flex items-center">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className="px-3"
              >
                <div 
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-full
                    ${isActive ? "bg-primary text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}
                  `}
                >
                  <item.Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
