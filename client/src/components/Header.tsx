import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FilePenLine } from "lucide-react";
import { useDarkMode } from "@/hooks/useDarkMode";

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FilePenLine className="h-8 w-8 text-primary-500" />
          <Link href="/">
            <h1 className="text-xl font-bold cursor-pointer">ReceiptScanner</h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full"
          >
            {/* Sun icon for dark mode */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {/* Moon icon for light mode */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              className="flex items-center space-x-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-500">
                <span className="text-sm font-medium">JD</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
