import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ExpenseContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Receipts from "@/pages/Receipts";
import Categories from "@/pages/Categories";
import SettingsPage from "@/pages/Settings";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

function Router() {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Header />
      <main className={`container mx-auto px-4 py-6 ${isMobile ? 'pb-20' : ''}`}>
        {!isMobile && <TabNavigation />}
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/receipts" component={Receipts} />
          <Route path="/categories" component={Categories} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      {isMobile && <TabNavigation />}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
