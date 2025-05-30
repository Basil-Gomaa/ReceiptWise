import { useQuery } from "@tanstack/react-query";
import { BarChart, Calendar, DollarSign, Tag, TrendingUp, Receipt, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui";
import { Skeleton } from "@/components/ui";
import MonthlySpendingChart from "@/components/charts/MonthlySpendingChart";
import CategoryDistributionChart from "@/components/charts/CategoryDistributionChart";
import FinancialMoodIndicator from "@/components/FinancialMoodIndicator";
import { formatCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui";

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
    <div className="dashboard-tab gradient-bg rounded-xl p-4 min-h-screen">
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* Total Expenses Card */}
        <Card className="stat-card-primary text-white magic-card magic-shine rounded-xl">
          <CardContent className={`p-4 ${isMobile ? 'pb-3' : 'pb-4'} z-10 relative`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white/90 font-medium text-sm">Total Expenses</h3>
              <span className="text-white/90 rounded-full bg-white/20 p-1.5 backdrop-blur-lg">
                <DollarSign className="h-4 w-4" />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 my-1">
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
                    : 'bg-red-500/20 text-red-100 border-red-500/30'} text-xs gap-0.5 font-normal backdrop-blur-sm`}
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
        <Card className="stat-card-secondary text-white magic-card magic-shine rounded-xl">
          <CardContent className={`p-4 ${isMobile ? 'pb-3' : 'pb-4'} z-10 relative`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white/90 font-medium text-sm">Receipts Scanned</h3>
              <span className="text-white/90 rounded-full bg-white/20 p-1.5 backdrop-blur-lg">
                <Receipt className="h-4 w-4" />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 my-1">
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
                    : 'bg-red-500/20 text-red-100 border-red-500/30'} text-xs gap-0.5 font-normal backdrop-blur-sm`}
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
        <Card className="magic-card magic-shine rounded-xl bg-gradient-to-br from-fuchsia-700 to-purple-900 text-white">
          <CardContent className={`p-4 ${isMobile ? 'pb-3' : 'pb-4'} z-10 relative`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-white/90 font-medium text-sm">Top Category</h3>
              <span className="text-white/90 rounded-full bg-white/20 p-1.5 backdrop-blur-lg">
                <Tag className="h-4 w-4" />
              </span>
            </div>
            
            {categoryLoading ? (
              <Skeleton className="h-9 w-full bg-white/20" />
            ) : topCategory && topCategory.total > 0 ? (
              <>
                <div className="flex items-center gap-2 my-1">
                  <span 
                    className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]"
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
        <Card className="magic-card glass-effect overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-white">Monthly Spending</CardTitle>
              <select className="h-8 text-xs w-[110px] rounded-lg border border-white/10 bg-white/5 text-white backdrop-blur-md px-2">
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last Year</option>
                <option value="alltime">All Time</option>
              </select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 px-2 relative z-10">
            <div className="h-[240px]">
              {monthlyLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="w-full h-[180px] bg-white/10" />
                </div>
              ) : monthlyData && Array.isArray(monthlyData) && monthlyData.length > 0 ? (
                <MonthlySpendingChart data={monthlyData} />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center rounded-lg text-gray-300">
                  <div className="relative">
                    <BarChart className="h-12 w-12 mb-2 opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 blur-xl rounded-full opacity-30"></div>
                  </div>
                  <p className="text-sm">No spending data available</p>
                  <p className="text-xs text-gray-400">Add receipts to see your monthly trends</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Category Distribution Chart */}
        <Card className="magic-card glass-effect overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium text-white">Expense Categories</CardTitle>
              <select className="h-8 text-xs w-[110px] rounded-lg border border-white/10 bg-white/5 text-white backdrop-blur-md px-2">
                <option value="thismonth">This Month</option>
                <option value="lastmonth">Last Month</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 px-2 relative z-10">
            <div className="h-[240px]">
              {categoryLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="w-full h-[180px] bg-white/10" />
                </div>
              ) : categoryData && Array.isArray(categoryData) && categoryData.length > 0 ? (
                <CategoryDistributionChart data={categoryData} />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center rounded-lg text-gray-300">
                  <div className="relative">
                    <PieChartIcon className="h-12 w-12 mb-2 opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 blur-xl rounded-full opacity-30"></div>
                  </div>
                  <p className="text-sm">No category data available</p>
                  <p className="text-xs text-gray-400">Add and categorize receipts to see distribution</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <Card className="magic-card glass-effect overflow-hidden mb-8">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-medium text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-300">Your latest receipt scans and entries</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-full backdrop-blur-md transition-colors">
                Sort ↑↓
              </button>
              <select className="h-8 text-xs w-[100px] rounded-lg border border-white/10 bg-white/5 text-white backdrop-blur-md px-2">
                <option value="all">All Types</option>
                <option value="food">Food & Dining</option>
                <option value="shopping">Shopping</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <div className="divide-y divide-white/5 relative z-10">
          {receiptsLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="px-4 py-3 flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-3 bg-white/10" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1 bg-white/10" />
                  <Skeleton className="h-3 w-24 bg-white/10" />
                </div>
                <Skeleton className="h-3 w-16 bg-white/10" />
              </div>
            ))
          ) : receipts && Array.isArray(receipts) && receipts.length > 0 ? (
            receipts.slice(0, 3).map((receipt: any) => (
              <div key={receipt.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600/20 to-purple-600/20 text-white flex items-center justify-center backdrop-blur-md border border-white/10">
                  <Receipt className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-white">{receipt.merchantName}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(receipt.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: '2-digit'})}
                    {receipt.categoryId && <span className="text-gray-400"> • Categorized</span>}
                  </p>
                </div>
                
                <div className="text-sm font-semibold text-white">
                  {formatCurrency(receipt.total)}
                </div>
                
                <button className="text-gray-400 opacity-50 hover:opacity-100 hover:text-white transition-all">
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
                <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-violet-600/20 to-purple-600/20 flex items-center justify-center mb-3 backdrop-blur-md border border-white/10">
                  <Receipt className="h-8 w-8 text-gray-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 blur-xl rounded-full opacity-30"></div>
                </div>
                <p className="text-gray-300 text-sm font-medium">No transactions yet</p>
                <p className="text-xs text-gray-400/80 max-w-xs mx-auto mt-1">
                  Upload your first receipt by clicking the "Scan Receipt" button on the Receipts page
                </p>
              </div>
            </div>
          )}
        </div>
        
        <CardFooter className="px-4 py-3 justify-center relative z-10">
          <button className="magic-button text-xs font-medium backdrop-blur-md">
            View All Transactions →
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
