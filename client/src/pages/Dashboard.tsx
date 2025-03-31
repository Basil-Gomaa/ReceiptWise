import { useQuery } from "@tanstack/react-query";
import { BarChart, Calendar, DollarSign, Tag, TrendingUp, Receipt, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MonthlySpendingChart from "@/components/charts/MonthlySpendingChart";
import CategoryDistributionChart from "@/components/charts/CategoryDistributionChart";
import FinancialMoodIndicator from "@/components/FinancialMoodIndicator";
import { formatCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define types for the comparison data
interface MonthlyComparison {
  currentMonthTotal: number;
  lastMonthTotal: number;
  percentageChangeTotal: number;
  currentMonthCount: number;
  lastMonthCount: number;
  percentageChangeCount: number;
}

// Dashboard tab containing summary cards, charts, and recent activity
export default function Dashboard() {
  const isMobile = useIsMobile();
  
  const { data: receipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ["/api/receipts"],
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["/api/analytics/monthly"],
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["/api/analytics/categories"],
  });
  
  const { data: comparisonData, isLoading: comparisonLoading } = useQuery<MonthlyComparison>({
    queryKey: ["/api/analytics/monthly-comparison"],
  });

  // Calculate total expenses
  const totalExpenses = receipts && Array.isArray(receipts) ? 
    receipts.reduce((sum: number, receipt: any) => sum + Number(receipt.total), 0) : 0;

  // Get top category
  const topCategory = categoryData && Array.isArray(categoryData) && categoryData.length > 0 ? 
    categoryData.reduce((max: any, current: any) => (max.total > current.total ? max : current), { total: 0 })
    : null;

  return (
    <div className="dashboard-tab">
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* Total Expenses Card */}
        <Card className="stat-card-primary text-white shadow-md overflow-hidden">
          <CardContent className={`p-4 ${isMobile ? 'pb-3' : 'pb-4'}`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white/90 font-medium text-sm">Total Expenses</h3>
              <span className="text-white/90 rounded-full bg-white/20 p-1">
                <DollarSign className="h-4 w-4" />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              {receiptsLoading || comparisonLoading ? (
                <Skeleton className="h-9 w-32 bg-white/20" />
              ) : (
                <h2 className="text-2xl sm:text-3xl font-bold">{formatCurrency(totalExpenses)}</h2>
              )}
              {comparisonData && !comparisonLoading && (comparisonData as MonthlyComparison).percentageChangeTotal !== 0 && (
                <Badge 
                  variant="outline" 
                  className={`${(comparisonData as MonthlyComparison).percentageChangeTotal > 0 
                    ? 'bg-green-500/20 text-green-100 border-green-500/30' 
                    : 'bg-red-500/20 text-red-100 border-red-500/30'} text-xs gap-0.5 font-normal`}
                >
                  {(comparisonData as MonthlyComparison).percentageChangeTotal > 0 
                    ? <TrendingUp className="h-3 w-3" /> 
                    : <TrendingUp className="h-3 w-3 rotate-180" />}
                  {Math.abs((comparisonData as MonthlyComparison).percentageChangeTotal)}%
                </Badge>
              )}
            </div>
            
            <p className="text-white/60 text-xs">vs last month</p>
          </CardContent>
        </Card>
        
        {/* Receipts Card */}
        <Card className="stat-card-secondary text-white shadow-md overflow-hidden">
          <CardContent className={`p-4 ${isMobile ? 'pb-3' : 'pb-4'}`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white/90 font-medium text-sm">Receipts Scanned</h3>
              <span className="text-white/90 rounded-full bg-white/20 p-1">
                <Receipt className="h-4 w-4" />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              {receiptsLoading || comparisonLoading ? (
                <Skeleton className="h-9 w-16 bg-white/20" />
              ) : (
                <h2 className="text-2xl sm:text-3xl font-bold">{Array.isArray(receipts) ? receipts.length : 0}</h2>
              )}
              {comparisonData && !comparisonLoading && (comparisonData as MonthlyComparison).percentageChangeCount !== 0 && (
                <Badge 
                  variant="outline" 
                  className={`${(comparisonData as MonthlyComparison).percentageChangeCount > 0 
                    ? 'bg-green-500/20 text-green-100 border-green-500/30' 
                    : 'bg-red-500/20 text-red-100 border-red-500/30'} text-xs gap-0.5 font-normal`}
                >
                  {(comparisonData as MonthlyComparison).percentageChangeCount > 0 
                    ? <TrendingUp className="h-3 w-3" /> 
                    : <TrendingUp className="h-3 w-3 rotate-180" />}
                  {Math.abs((comparisonData as MonthlyComparison).percentageChangeCount)}%
                </Badge>
              )}
            </div>
            
            <p className="text-white/60 text-xs">vs last month</p>
          </CardContent>
        </Card>
        
        {/* Top Category Card */}
        <Card className="bg-gradient-to-br from-[#1e3a8a] to-[#1e40af] dark:from-[#0f172a] dark:to-[#172554] text-white shadow-md overflow-hidden">
          <CardContent className={`p-4 ${isMobile ? 'pb-3' : 'pb-4'}`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white/90 font-medium text-sm">Top Category</h3>
              <span className="text-white/90 rounded-full bg-white/20 p-1">
                <Tag className="h-4 w-4" />
              </span>
            </div>
            
            {categoryLoading ? (
              <Skeleton className="h-9 w-full bg-white/20" />
            ) : topCategory && topCategory.total > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: topCategory.color }}
                  ></span>
                  <h2 className="text-lg sm:text-xl font-semibold truncate">{topCategory.name}</h2>
                </div>
                <p className="text-white/70 text-xs">
                  {formatCurrency(topCategory.total)} 
                  ({totalExpenses > 0 ? Math.round((topCategory.total / totalExpenses) * 100) : 0}%)
                </p>
              </>
            ) : (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">No data yet</h2>
                <p className="text-white/70 text-xs">Add receipts to see stats</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Mood Indicator */}
      <div className="mb-6">
        <FinancialMoodIndicator
          monthlySpending={comparisonData?.currentMonthTotal || 0}
          previousMonthSpending={comparisonData?.lastMonthTotal || 0}
          recentExpenses={Array.isArray(receipts) ? receipts : []}
          isLoading={receiptsLoading || comparisonLoading}
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Spending Chart */}
        <Card className="shadow-md bg-white dark:bg-[#0f172a]/80 border-0">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Monthly Spending</CardTitle>
              <Select defaultValue="6months">
                <SelectTrigger className="h-8 text-xs w-[110px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last Year</SelectItem>
                  <SelectItem value="alltime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 px-2">
            <div className="h-[240px]">
              {monthlyLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="w-full h-[180px]" />
                </div>
              ) : monthlyData && Array.isArray(monthlyData) && monthlyData.length > 0 ? (
                <MonthlySpendingChart data={monthlyData} />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-400">
                  <BarChart className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm">No spending data available</p>
                  <p className="text-xs">Add receipts to see your monthly trends</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Category Distribution Chart */}
        <Card className="shadow-md bg-white dark:bg-[#0f172a]/80 border-0">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Expense Categories</CardTitle>
              <Select defaultValue="thismonth">
                <SelectTrigger className="h-8 text-xs w-[110px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thismonth">This Month</SelectItem>
                  <SelectItem value="lastmonth">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 px-2">
            <div className="h-[240px]">
              {categoryLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="w-full h-[180px]" />
                </div>
              ) : categoryData && Array.isArray(categoryData) && categoryData.length > 0 ? (
                <CategoryDistributionChart data={categoryData} />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-400">
                  <PieChartIcon className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm">No category data available</p>
                  <p className="text-xs">Add and categorize receipts to see distribution</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <Card className="shadow-md bg-white dark:bg-[#0f172a]/80 border-0 mb-8">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
              <CardDescription>Your latest receipt scans and entries</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                Sort ↑↓
              </button>
              <Select defaultValue="all">
                <SelectTrigger className="h-8 text-xs w-[100px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="food">Food & Dining</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <div className="divide-y divide-border">
          {receiptsLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="px-4 py-3 flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          ) : receipts && Array.isArray(receipts) && receipts.length > 0 ? (
            receipts.slice(0, 3).map((receipt: any) => (
              <div key={receipt.id} className="px-4 py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground flex items-center justify-center shadow-sm">
                  <Receipt className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{receipt.merchantName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(receipt.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: '2-digit'})}
                    {receipt.categoryId && <span> • Categorized</span>}
                  </p>
                </div>
                
                <div className="text-sm font-semibold">
                  {formatCurrency(receipt.total)}
                </div>
                
                <button className="text-muted-foreground opacity-50 hover:opacity-100">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3.5C8.28 3.5 8.5 3.72 8.5 4V12C8.5 12.28 8.28 12.5 8 12.5C7.72 12.5 7.5 12.28 7.5 12V4C7.5 3.72 7.72 3.5 8 3.5Z" fill="currentColor"/>
                    <path d="M12 8.5C12.28 8.5 12.5 8.28 12.5 8C12.5 7.72 12.28 7.5 12 7.5L4 7.5C3.72 7.5 3.5 7.72 3.5 8C3.5 8.28 3.72 8.5 4 8.5L12 8.5Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <Receipt className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">No transactions yet</p>
                <p className="text-xs text-muted-foreground/80 max-w-xs mx-auto mt-1">
                  Upload your first receipt by clicking the "Scan Receipt" button on the Receipts page
                </p>
              </div>
            </div>
          )}
        </div>
        
        <CardFooter className="px-4 py-2 justify-center">
          <button className="text-primary text-xs font-medium hover:underline">
            View All Transactions →
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
