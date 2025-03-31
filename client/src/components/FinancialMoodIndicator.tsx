import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from 'lucide-react';
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
  const [mood, setMood] = useState<'happy' | 'neutral' | 'sad' | 'unknown'>('unknown');
  
  // Calculate financial mood based on spending patterns and budget
  useEffect(() => {
    if (isLoading || recentExpenses.length === 0) {
      setMood('unknown');
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
      if (projectedMonthly < monthlyBudget * 0.8) {
        setMood('happy');
      } else if (projectedMonthly < monthlyBudget * 1.1) {
        setMood('neutral');
      } else {
        setMood('sad');
      }
    } else {
      // If no budget, compare to previous month
      if (previousMonthSpending === 0) {
        // No previous data to compare
        setMood('neutral');
      } else {
        // Compare to previous month
        const changePercent = ((projectedMonthly - previousMonthSpending) / previousMonthSpending) * 100;
        
        if (changePercent < -10) {
          setMood('happy');
        } else if (changePercent < 15) {
          setMood('neutral');
        } else {
          setMood('sad');
        }
      }
    }
  }, [monthlySpending, previousMonthSpending, monthlyBudget, recentExpenses, isLoading]);

  // Get emoji and color based on mood
  const getMoodEmoji = () => {
    switch (mood) {
      case 'happy':
        return '😄';
      case 'neutral':
        return '😐';
      case 'sad':
        return '😟';
      case 'unknown':
      default:
        return '🤔';
    }
  };

  const getMoodColor = () => {
    switch (mood) {
      case 'happy':
        return 'text-green-500 dark:text-green-400';
      case 'neutral':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'sad':
        return 'text-red-500 dark:text-red-400';
      case 'unknown':
      default:
        return 'text-purple-500 dark:text-purple-400';
    }
  };

  const getMoodAnimation = () => {
    switch (mood) {
      case 'happy':
        return {
          animate: { rotate: [0, 5, 0, -5, 0] },
          transition: { repeat: Infinity, duration: 2.5 }
        };
      case 'neutral':
        return {};
      case 'sad':
        return {
          animate: { y: [0, 3, 0] },
          transition: { repeat: Infinity, duration: 2 }
        };
      case 'unknown':
      default:
        return {
          animate: { rotate: [0, 360] },
          transition: { repeat: Infinity, duration: 20, ease: "linear" }
        };
    }
  };

  const animation = getMoodAnimation();

  return (
    <Card className="shadow-md bg-white dark:bg-[#0f172a]/80 border-0 overflow-hidden">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-medium text-center">Financial Mood</CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center justify-center py-6">
        <motion.div 
          {...animation}
          className="mb-4"
        >
          <span className="text-8xl" role="img" aria-label="Mood Emoji">
            {getMoodEmoji()}
          </span>
        </motion.div>
        
        <div className={`text-xl font-bold ${getMoodColor()} mb-1`}>
          {mood === 'happy' ? 'Happy' : 
           mood === 'neutral' ? 'Neutral' : 
           mood === 'sad' ? 'Sad' : 'Unknown'}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-purple-500 dark:text-purple-400"
        >
          <Sparkles className="h-3 w-3" />
          <span>AI Powered</span>
        </motion.div>
      </CardContent>
    </Card>
  );
}