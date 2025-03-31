import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTheme } from "@/contexts/ExpenseContext";

interface MonthlySpendingChartProps {
  data: Array<{
    month: string;
    total: number;
  }>;
}

export default function MonthlySpendingChart({ data }: MonthlySpendingChartProps) {
  // Get the current theme state
  const { isDarkMode } = useTheme();
  
  // Format data for display
  const chartData = data.map(item => {
    // Convert YYYY-MM to Month abbreviation
    const [year, month] = item.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    return {
      name: `${monthName} ${year}`,
      amount: item.total
    };
  });

  // Sort data by date (ascending)
  chartData.sort((a, b) => {
    const monthA = new Date(data.find(item => `${item.month}` === a.name.split(' ')[0])?.month || '');
    const monthB = new Date(data.find(item => `${item.month}` === b.name.split(' ')[0])?.month || '');
    return monthA.getTime() - monthB.getTime();
  });

  // Calculate the maximum value to set Y-axis
  const maxValue = Math.max(...chartData.map(item => item.amount), 0);
  const yAxisMax = Math.ceil(maxValue / 100) * 100; // Round up to nearest 100

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 20,
        }}
      >
        <CartesianGrid 
          horizontal={true}
          vertical={false} 
          stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 
          strokeDasharray="5 5"
        />
        <XAxis 
          dataKey="name" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: isDarkMode ? "#a0aec0" : "#888" }}
          dy={10}
        />
        <YAxis 
          tickFormatter={(value) => value === 0 ? "$0" : `$${value}`}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: isDarkMode ? "#a0aec0" : "#888" }}
          width={40}
          domain={[0, yAxisMax]}
        />
        <Tooltip 
          formatter={(value) => [formatCurrency(value as number), "Total Spent"]}
          contentStyle={{ 
            borderRadius: '12px',
            backgroundColor: isDarkMode ? '#1a202c' : '#ffffff',
            border: 'none',
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            padding: '10px 14px',
            fontSize: '13px',
            color: isDarkMode ? '#e2e8f0' : '#333333'
          }}
          itemStyle={{
            color: '#0ea5e9',
            fontWeight: 600
          }}
          labelStyle={{
            fontWeight: 500,
            marginBottom: '4px'
          }}
          cursor={{ fill: isDarkMode ? 'rgba(45, 55, 72, 0.4)' : 'rgba(180, 180, 250, 0.1)' }}
        />
        <ReferenceLine 
          y={yAxisMax} 
          stroke={isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 
          strokeDasharray="5 5" 
        />
        <Bar 
          dataKey="amount" 
          fill="#0ea5e9" 
          radius={[4, 4, 0, 0] as any}
          maxBarSize={40}
          animationDuration={1000}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
