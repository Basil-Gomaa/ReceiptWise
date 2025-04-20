import { useState, useEffect } from 'react';
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
        return '😌';
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
        return 'from-green-500 to-emerald-600 text-white';
      case 'neutral':
        return 'from-cyan-500 to-blue-600 text-white';
      case 'sad':
        return 'from-red-500 to-rose-600 text-white';
      case 'unknown':
      default:
        return 'from-violet-600 to-purple-700 text-white';
    }
  };
  
  const getMoodGlow = () => {
    switch (mood) {
      case 'happy':
        return 'shadow-[0_0_15px_rgba(16,185,129,0.5)]';
      case 'neutral':
        return 'shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      case 'sad':
        return 'shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      case 'unknown':
      default:
        return 'shadow-[0_0_15px_rgba(139,92,246,0.5)]';
    }
  };

  const getMoodAnimation = () => {
    switch (mood) {
      case 'happy':
        return {
          animate: { rotate: [0, 5, 0, -5, 0] },
          transition: { 
            repeat: Infinity, 
            duration: 3.5,
            ease: "easeInOut"
          }
        };
      case 'neutral':
        return {
          animate: { scale: [1, 1.03, 1] },
          transition: { 
            repeat: Infinity, 
            duration: 4,
            ease: "easeInOut"
          }
        };
      case 'sad':
        return {
          animate: { y: [0, 3, 0] },
          transition: { 
            repeat: Infinity, 
            duration: 3,
            ease: "easeInOut"
          }
        };
      case 'unknown':
      default:
        return {
          animate: { rotate: [0, 360] },
          transition: { 
            repeat: Infinity, 
            duration: 20, 
            ease: "linear" 
          }
        };
    }
  };

  const animation = getMoodAnimation();

  return (
    <div className="glass-effect rounded-xl overflow-hidden py-6">
      <h3 className="text-lg font-medium text-center mb-5 text-white">Financial Mood</h3>
      
      <div className="relative">
        {/* Decorative glowing orb behind the emoji */}
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-2xl opacity-40 bg-gradient-to-br ${getMoodColor()}`}></div>
        
        <motion.div 
          {...animation}
          className="mb-4 relative z-10"
        >
          <span 
            className={`block text-9xl ${getMoodGlow()} rounded-full p-2`} 
            role="img" 
            aria-label="Mood Emoji"
          >
            {getMoodEmoji()}
          </span>
        </motion.div>
      </div>
      
      <div className={`text-xl font-bold mb-2 text-center bg-gradient-to-r ${getMoodColor()} bg-clip-text`}>
        {mood === 'happy' ? 'Happy' : 
         mood === 'neutral' ? 'Neutral' : 
         mood === 'sad' ? 'Sad' : 'Unknown'}
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium"
      >
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 backdrop-blur-md border border-white/10">
          <Sparkles className="h-3 w-3 mr-1 text-purple-400" />
          <span className="text-purple-200">AI Powered</span>
        </span>
      </motion.div>
    </div>
  );
}