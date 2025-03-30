import { Link, useLocation } from "wouter";
import { BarChart, FilePenLine, Tag, Settings as SettingsIcon } from "lucide-react";

export default function TabNavigation() {
  const [location] = useLocation();

  const getTabClassName = (path: string) => {
    const baseClassName = "inline-block p-4 border-b-2 font-medium ";
    const activeClassName = "border-primary-500 text-primary-600 dark:text-primary-400";
    const inactiveClassName = "border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300";
    
    return baseClassName + (location === path ? activeClassName : inactiveClassName);
  };

  return (
    <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
      <ul className="flex flex-wrap -mb-px">
        <li className="mr-2">
          <Link href="/" className={getTabClassName("/")}>
            <span className="flex items-center">
              <BarChart className="h-5 w-5 mr-2" />
              Dashboard
            </span>
          </Link>
        </li>
        
        <li className="mr-2">
          <Link href="/receipts" className={getTabClassName("/receipts")}>
            <span className="flex items-center">
              <FilePenLine className="h-5 w-5 mr-2" />
              Receipts
            </span>
          </Link>
        </li>
        
        <li className="mr-2">
          <Link href="/categories" className={getTabClassName("/categories")}>
            <span className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Categories
            </span>
          </Link>
        </li>
        
        <li className="mr-2">
          <Link href="/settings" className={getTabClassName("/settings")}>
            <span className="flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              Settings
            </span>
          </Link>
        </li>
      </ul>
    </div>
  );
}
