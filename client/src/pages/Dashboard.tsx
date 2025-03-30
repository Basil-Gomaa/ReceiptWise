import { useQuery } from "@tanstack/react-query";
import { BarChart, Calendar, DollarSign, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MonthlySpendingChart from "@/components/charts/MonthlySpendingChart";
import CategoryDistributionChart from "@/components/charts/CategoryDistributionChart";
import { formatCurrency } from "@/lib/utils";

// Dashboard tab containing summary cards, charts, and recent activity
export default function Dashboard() {
  const { data: receipts, isLoading: receiptsLoading } = useQuery({
    queryKey: ["/api/receipts"],
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ["/api/analytics/monthly"],
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["/api/analytics/categories"],
  });

  // Calculate total expenses
  const totalExpenses = receipts ? receipts.reduce((sum: number, receipt: any) => sum + Number(receipt.total), 0) : 0;

  // Get top category
  const topCategory = categoryData 
    ? categoryData.reduce((max: any, current: any) => (max.total > current.total ? max : current), { total: 0 })
    : null;

  return (
    <div className="dashboard-tab">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Expenses Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Expenses</h3>
              <span className="text-gray-400">
                <DollarSign className="h-5 w-5" />
              </span>
            </div>
            <div className="flex items-end">
              {receiptsLoading ? (
                <Skeleton className="h-9 w-32" />
              ) : (
                <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
              )}
              <span className="ml-2 text-sm text-green-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>4.5%</span>
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">vs last month</p>
          </CardContent>
        </Card>
        
        {/* Receipts Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Receipts Scanned</h3>
              <span className="text-gray-400">
                <Calendar className="h-5 w-5" />
              </span>
            </div>
            <div className="flex items-end">
              {receiptsLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <p className="text-3xl font-bold">{receipts?.length || 0}</p>
              )}
              <span className="ml-2 text-sm text-green-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>12.8%</span>
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">vs last month</p>
          </CardContent>
        </Card>
        
        {/* Top Category Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Top Category</h3>
              <span className="text-gray-400">
                <Tag className="h-5 w-5" />
              </span>
            </div>
            {categoryLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : topCategory ? (
              <>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: topCategory.color }}
                  ></div>
                  <p className="text-xl font-semibold">{topCategory.name}</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {formatCurrency(topCategory.total)} 
                  ({totalExpenses > 0 ? Math.round((topCategory.total / totalExpenses) * 100) : 0}%)
                </p>
              </>
            ) : (
              <p className="text-xl font-semibold">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Spending Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Monthly Spending</h3>
              <select className="bg-gray-100 dark:bg-gray-700 border-0 rounded-md px-3 py-1 text-sm">
                <option>Last 6 Months</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>
            
            <div className="h-[300px]">
              {monthlyLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <MonthlySpendingChart data={monthlyData || []} />
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Category Distribution Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Expense Categories</h3>
              <select className="bg-gray-100 dark:bg-gray-700 border-0 rounded-md px-3 py-1 text-sm">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
              </select>
            </div>
            
            <div className="h-[300px]">
              {categoryLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <CategoryDistributionChart data={categoryData || []} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity Section */}
      <Card className="mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-lg">Recent Activity</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {receiptsLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="px-6 py-4 flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-4" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))
          ) : receipts && receipts.length > 0 ? (
            receipts.slice(0, 3).map((receipt: any) => (
              <div key={receipt.id} className="px-6 py-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-500 dark:text-blue-300 mr-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Receipt scanned from {receipt.merchantName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(receipt.total)} - {receipt.categoryId ? "Categorized" : "Uncategorized"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(receipt.date).toLocaleDateString()} {new Date(receipt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">No receipts yet. Upload your first receipt to get started!</p>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium">
            View All Activity
          </button>
        </div>
      </Card>
    </div>
  );
}
