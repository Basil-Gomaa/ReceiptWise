import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingDown, TrendingUp, AlertCircle, HelpCircle, Laugh, Smile, Meh, Frown, Wind } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';

interface FinancialMoodIndicatorProps {
  monthlySpending?: number;
  previousMonthSpending?: number;
  monthlyBudget?: number;
  recentExpenses: any[]; // Recent receipt data
  isLoading: boolean;
}

export default function FinancialMoodIndicator({
  monthlySpending = 0,
  previousMonthSpending = 0,
  monthlyBudget = 0,
  recentExpenses = [],
  isLoading = false
}: FinancialMoodIndicatorProps) {
  const [mood, setMood] = useState<'excellent' | 'good' | 'neutral' | 'concerned' | 'unknown'>('unknown');
  const [moodReason, setMoodReason] = useState<string>('');
  
  // Calculate financial mood based on spending patterns and budget
  useEffect(() => {
    if (isLoading || recentExpenses.length === 0) {
      setMood('unknown');
      setMoodReason('No financial data available yet.');
      return;
    }

    // Calculate spend rate (last 7 days)
    const last7DaysDate = new Date();
    last7DaysDate.setDate(last7DaysDate.getDate() - 7);
    
    const recentTotal = recentExpenses
      .filter(exp => new Date(exp.date) >= last7DaysDate)
      .reduce((sum, exp) => sum + Number(exp.total), 0);
    
    // Daily average from recent expenses
    const dailyRate = recentTotal / 7;
    
    // Projected monthly spend based on current rate
    const projectedMonthly = dailyRate * 30;
    
    // Determine mood based on financial patterns
    if (monthlyBudget > 0) {
      // If budget is set, use that for comparison
      if (projectedMonthly < monthlyBudget * 0.7) {
        setMood('excellent');
        setMoodReason('You\'re well under your monthly budget - great job!');
      } else if (projectedMonthly < monthlyBudget * 0.9) {
        setMood('good');
        setMoodReason('You\'re keeping your spending under budget.');
      } else if (projectedMonthly < monthlyBudget * 1.1) {
        setMood('neutral');
        setMoodReason('You\'re close to your monthly budget.');
      } else {
        setMood('concerned');
        setMoodReason('You\'re trending to exceed your monthly budget.');
      }
    } else {
      // If no budget, compare to previous month
      if (previousMonthSpending === 0) {
        // No previous data to compare
        if (recentTotal > 0) {
          setMood('neutral');
          setMoodReason('Tracking your first month of expenses.');
        } else {
          setMood('unknown');
          setMoodReason('No financial data available yet.');
        }
      } else {
        // Compare to previous month
        const changePercent = ((projectedMonthly - previousMonthSpending) / previousMonthSpending) * 100;
        
        if (changePercent < -15) {
          setMood('excellent');
          setMoodReason('You\'ve significantly reduced your spending from last month!');
        } else if (changePercent < -5) {
          setMood('good');
          setMoodReason('You\'re spending less than last month.');
        } else if (changePercent < 10) {
          setMood('neutral');
          setMoodReason('Your spending is similar to last month.');
        } else {
          setMood('concerned');
          setMoodReason('Your spending is higher than last month.');
        }
      }
    }
  }, [monthlySpending, previousMonthSpending, monthlyBudget, recentExpenses, isLoading]);

  // Render the appropriate emoji based on mood
  const renderMoodEmoji = () => {
    switch (mood) {
      case 'excellent':
        return (
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1, rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 3 }}
            className="text-6xl bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center text-green-500 dark:text-green-400"
          >
            <Laugh className="w-12 h-12" />
          </motion.div>
        );
      case 'good':
        return (
          <motion.div 
            initial={{ y: 0 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
            className="text-6xl bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center text-blue-500 dark:text-blue-400"
          >
            <Smile className="w-12 h-12" />
          </motion.div>
        );
      case 'neutral':
        return (
          <div className="text-6xl bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center text-yellow-500 dark:text-yellow-400">
            <Meh className="w-12 h-12" />
          </div>
        );
      case 'concerned':
        return (
          <motion.div 
            animate={{ rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-6xl bg-red-100 dark:bg-red-900/30 w-20 h-20 rounded-full flex items-center justify-center text-red-500 dark:text-red-400"
          >
            <Frown className="w-12 h-12" />
          </motion.div>
        );
      case 'unknown':
      default:
        return (
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="text-6xl bg-purple-100 dark:bg-purple-900/30 w-20 h-20 rounded-full flex items-center justify-center text-purple-500 dark:text-purple-400"
          >
            <HelpCircle className="w-12 h-12" />
          </motion.div>
        );
    }
  };

  // Get trend indicator
  const getTrendIndicator = () => {
    if (isLoading || previousMonthSpending === 0) return null;
    
    const isIncreasing = monthlySpending > previousMonthSpending;
    const changeAmount = Math.abs(monthlySpending - previousMonthSpending);
    const changePercent = previousMonthSpending > 0 
      ? Math.round((changeAmount / previousMonthSpending) * 100) 
      : 0;
    
    return (
      <div className={`flex items-center gap-1 text-sm ${isIncreasing ? 'text-red-500' : 'text-green-500'}`}>
        {isIncreasing ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span>{changePercent}% {isIncreasing ? 'more' : 'less'} than last month</span>
      </div>
    );
  };

  return (
    <Card className="shadow-md bg-white dark:bg-[#0f172a]/80 border-0 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Financial Mood</CardTitle>
            <CardDescription>How your spending looks right now</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>This shows your financial mood based on your recent spending patterns, comparing to your previous month or budget (if set).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent className="flex justify-between items-center py-4">
        <div className="max-w-[60%]">
          <div className="mb-2">
            <h3 className={`text-xl font-bold ${
              mood === 'excellent' ? 'text-green-500 dark:text-green-400' :
              mood === 'good' ? 'text-blue-500 dark:text-blue-400' :
              mood === 'neutral' ? 'text-yellow-500 dark:text-yellow-400' :
              mood === 'concerned' ? 'text-red-500 dark:text-red-400' :
              'text-purple-500 dark:text-purple-400'
            }`}>
              {mood === 'excellent' ? 'Excellent!' :
               mood === 'good' ? 'Looking Good' :
               mood === 'neutral' ? 'Steady' :
               mood === 'concerned' ? 'Watch Out' :
               'Getting Started'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{moodReason}</p>
          </div>
          
          {!isLoading && <div className="text-lg font-semibold">{formatCurrency(monthlySpending)} <span className="text-sm font-normal text-gray-500">this month</span></div>}
          {getTrendIndicator()}
        </div>
        
        <div className="flex flex-col items-center justify-center">
          {renderMoodEmoji()}
          
          {mood !== 'unknown' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-purple-500 dark:text-purple-400"
            >
              <Sparkles className="h-3 w-3" />
              <span>AI Powered</span>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}