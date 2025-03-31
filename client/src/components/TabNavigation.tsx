import { Link, useLocation } from "wouter";
import { ReceiptText, Tags, Settings as SettingsIcon, PieChart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

// Define navigation items outside the component
const navItemsData = [
  { path: "/", label: "Home", Icon: PieChart },
  { path: "/receipts", label: "Receipts", Icon: ReceiptText },
  { path: "/categories", label: "Categories", Icon: Tags },
  { path: "/settings", label: "Settings", Icon: SettingsIcon },
];

export default function TabNavigation() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const isActive = (path: string) => location === path;
  
  // Find active index
  const activeIndex = navItemsData.findIndex(item => item.path === location);
  
  // Mobile navigation - using CSS only
  if (isMobile) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 glass-effect shadow-lg rounded-full pb-safe">
        <div className="flex items-center justify-between relative">
          {/* Background indicator - pure CSS */}
          <div 
            className="absolute top-1 h-[calc(100%-8px)] bg-primary/10 dark:bg-primary/20 rounded-full -z-10 transition-all duration-300" 
            style={{
              left: `${activeIndex * 25}%`,
              width: '25%',
            }}
          />
          
          {navItemsData.map((item) => (
            <Link key={item.path} href={item.path} className="w-1/4">
              <div className={`flex flex-col items-center py-3 ${
                isActive(item.path) ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"
              }`}>
                <item.Icon className="h-5 w-5" />
                <span className="text-[11px] mt-1.5 font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  
  // Desktop navigation - with fixed equal widths and increased spacing
  return (
    <div className="mb-8 flex justify-center sm:justify-start">
      <div className="glass-effect rounded-full p-2 flex items-center shadow-md relative">
        {/* Background indicator - using percentages for positioning */}
        <div 
          className="absolute h-[calc(100%-16px)] top-2 bg-primary rounded-full transition-all duration-300 ease-out"
          style={{
            left: `calc(${activeIndex * 25}% + 8px)`,
            width: 'calc(25% - 16px)',
            opacity: 1,
            zIndex: 0,
          }}
        />
        
        <div className="flex items-center justify-between relative z-10 w-full">
          {navItemsData.map((item, index) => (
            <Link key={item.path} href={item.path} className="w-[145px] text-center">
              <div 
                className={`
                  flex items-center justify-center gap-2 py-3 rounded-full transition-colors duration-200
                  ${isActive(item.path) 
                    ? "text-white dark:text-[#0f172a] font-medium" 
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}
                `}
              >
                <item.Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
