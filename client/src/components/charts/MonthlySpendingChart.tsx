import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthlySpendingChartProps {
  data: Array<{
    month: string;
    total: number;
  }>;
}

export default function MonthlySpendingChart({ data }: MonthlySpendingChartProps) {
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          left: 10,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          dy={10}
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value, false)}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={60}
        />
        <Tooltip 
          formatter={(value) => [formatCurrency(value as number), "Amount"]}
          contentStyle={{ 
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Bar 
          dataKey="amount" 
          fill="hsl(217, 91%, 60%)" 
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
