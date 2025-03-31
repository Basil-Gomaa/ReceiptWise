import { Link, useLocation } from "wouter";
import { BarChart, ReceiptText, Tags, Settings as SettingsIcon, PieChart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef } from "react";
import { animated, useSpring } from "@react-spring/web";

export default function TabNavigation() {
  const [location] = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location === path;
  
  // Mobile navigation with animation
  if (isMobile) {
    const tabRefs = {
      "/": useRef<HTMLDivElement>(null),
      "/receipts": useRef<HTMLDivElement>(null),
      "/categories": useRef<HTMLDivElement>(null),
      "/settings": useRef<HTMLDivElement>(null),
    };

    const [indicatorStyles, api] = useSpring(() => ({
      transform: "translateX(0px) translateY(0px)",
      width: 0,
      height: 0,
      config: { tension: 300, friction: 30 },
    }));

    useEffect(() => {
      const currentTab = tabRefs[location as keyof typeof tabRefs]?.current;
      if (!currentTab) return;

      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = currentTab;
      
      api.start({
        transform: `translateX(${offsetLeft}px) translateY(${offsetTop}px)`,
        width: offsetWidth,
        height: offsetHeight,
        immediate: false,
      });
    }, [location, api]);

    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 glass-effect shadow-lg rounded-full pb-safe">
        <div className="flex items-center justify-around px-4 py-3 relative">
          <animated.div 
            className="absolute bg-primary/10 dark:bg-primary/20 rounded-full -z-10" 
            style={indicatorStyles} 
          />
          
          <Link href="/">
            <div 
              ref={tabRefs["/"]} 
              className={`flex flex-col items-center p-2 ${
                isActive("/") ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <PieChart className="h-5 w-5" />
              <span className="text-[10px] mt-1">Dashboard</span>
            </div>
          </Link>
          
          <Link href="/receipts">
            <div 
              ref={tabRefs["/receipts"]} 
              className={`flex flex-col items-center p-2 ${
                isActive("/receipts") ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <ReceiptText className="h-5 w-5" />
              <span className="text-[10px] mt-1">Receipts</span>
            </div>
          </Link>
          
          <Link href="/categories">
            <div 
              ref={tabRefs["/categories"]} 
              className={`flex flex-col items-center p-2 ${
                isActive("/categories") ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <Tags className="h-5 w-5" />
              <span className="text-[10px] mt-1">Categories</span>
            </div>
          </Link>
          
          <Link href="/settings">
            <div 
              ref={tabRefs["/settings"]} 
              className={`flex flex-col items-center p-2 ${
                isActive("/settings") ? "text-primary font-medium" : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <SettingsIcon className="h-5 w-5" />
              <span className="text-[10px] mt-1">Settings</span>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Desktop navigation with animation
  const tabRefs = {
    "/": useRef<HTMLDivElement>(null),
    "/receipts": useRef<HTMLDivElement>(null),
    "/categories": useRef<HTMLDivElement>(null),
    "/settings": useRef<HTMLDivElement>(null),
  };

  const [indicatorStyles, api] = useSpring(() => ({
    transform: "translateX(0px)",
    width: 0,
    opacity: 0,
    config: { tension: 300, friction: 30 },
  }));

  useEffect(() => {
    const currentTab = tabRefs[location as keyof typeof tabRefs]?.current;
    if (!currentTab) return;

    const { offsetLeft, offsetWidth } = currentTab;
    
    api.start({
      transform: `translateX(${offsetLeft}px)`,
      width: offsetWidth,
      opacity: 1,
      immediate: false,
    });
  }, [location, api]);

  return (
    <div className="mb-8 flex justify-center sm:justify-start">
      <div className="glass-effect rounded-full p-1.5 flex items-center justify-between gap-1 shadow-sm relative">
        <animated.div 
          className="absolute h-[calc(100%-12px)] top-1.5 bg-primary rounded-full -z-0" 
          style={indicatorStyles} 
        />
        
        <Link href="/">
          <div 
            ref={tabRefs["/"]} 
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 relative z-10
              ${isActive("/") 
                ? "text-white dark:text-[#0f172a] font-medium" 
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}
            `}
          >
            <PieChart className="h-4 w-4" />
            <span className="text-sm">Dashboard</span>
          </div>
        </Link>
        
        <Link href="/receipts">
          <div 
            ref={tabRefs["/receipts"]} 
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 relative z-10
              ${isActive("/receipts") 
                ? "text-white dark:text-[#0f172a] font-medium" 
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}
            `}
          >
            <ReceiptText className="h-4 w-4" />
            <span className="text-sm">Receipts</span>
          </div>
        </Link>
        
        <Link href="/categories">
          <div 
            ref={tabRefs["/categories"]} 
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 relative z-10
              ${isActive("/categories") 
                ? "text-white dark:text-[#0f172a] font-medium" 
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}
            `}
          >
            <Tags className="h-4 w-4" />
            <span className="text-sm">Categories</span>
          </div>
        </Link>
        
        <Link href="/settings">
          <div 
            ref={tabRefs["/settings"]} 
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-colors duration-200 relative z-10
              ${isActive("/settings") 
                ? "text-white dark:text-[#0f172a] font-medium" 
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}
            `}
          >
            <SettingsIcon className="h-4 w-4" />
            <span className="text-sm">Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
