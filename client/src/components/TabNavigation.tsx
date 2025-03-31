import { Link, useLocation } from "wouter";
import { BarChart, ReceiptText, Tags, Settings as SettingsIcon, PieChart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";

export default function TabNavigation() {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const isActive = (path: string) => location === path;

  // Navigation items definition 
  const navItems = [
    { path: "/", icon: isMobile ? <PieChart className="h-5 w-5" /> : <PieChart className="h-4 w-4" />, label: "Dashboard" },
    { path: "/receipts", icon: isMobile ? <ReceiptText className="h-5 w-5" /> : <ReceiptText className="h-4 w-4" />, label: "Receipts" },
    { path: "/categories", icon: isMobile ? <Tags className="h-5 w-5" /> : <Tags className="h-4 w-4" />, label: "Categories" },
    { path: "/settings", icon: isMobile ? <SettingsIcon className="h-5 w-5" /> : <SettingsIcon className="h-4 w-4" />, label: "Settings" },
  ];
  
  // Find active index
  const activeIndex = navItems.findIndex(item => item.path === location);
  
  // Mobile navigation
  if (isMobile) {
    // Animation properties for mobile
    const [styles] = useState({
      left: `${activeIndex * 25}%`,
      width: '25%',
    });
    
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 glass-effect shadow-lg rounded-full pb-safe">
        <div className="flex items-center justify-between relative">
          {/* Background indicator */}
          <div 
            className="absolute top-0 h-full bg-primary/10 dark:bg-primary/20 rounded-full -z-10 transition-all duration-300" 
            style={{
              left: `${activeIndex * 25}%`,
              width: '25%',
            }}
          />
          
          {navItems.map((item) => (
            <Link key={item.path} href={item.path} className="w-1/4">
              <div className={`flex flex-col items-center py-3 ${
                isActive(item.path) ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"
              }`}>
                {item.icon}
                <span className="text-[10px] mt-1">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }
  
  // Desktop navigation
  return (
    <div className="mb-8 flex justify-center sm:justify-start">
      <div className="glass-effect rounded-full p-1.5 flex items-center justify-between gap-1 shadow-sm relative">
        {/* Background indicator */}
        <div 
          className="absolute h-[calc(100%-12px)] top-1.5 bg-primary rounded-full -z-0 transition-all duration-300 ease-out"
          style={{
            left: `${8 + (activeIndex * 108)}px`,  // Approximate widths
            width: activeIndex === 0 ? '110px' : activeIndex === 1 ? '104px' : activeIndex === 2 ? '118px' : '108px',
            opacity: 1,
          }}
        />
        
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <div 
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 relative z-10
                ${isActive(item.path) 
                  ? "text-white dark:text-[#0f172a] font-medium" 
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}
              `}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
