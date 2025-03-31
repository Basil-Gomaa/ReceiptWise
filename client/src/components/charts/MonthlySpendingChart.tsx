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
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#888" }}
          dy={10}
        />
        <YAxis 
          tickFormatter={(value) => formatCurrency(value, false)}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#888" }}
          width={60}
        />
        <Tooltip 
          formatter={(value) => [formatCurrency(value as number), "Total Spent"]}
          contentStyle={{ 
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: 'none',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#333333'
          }}
          itemStyle={{
            color: 'hsl(265, 85%, 50%)',
            fontWeight: 600
          }}
          labelStyle={{
            fontWeight: 500,
            marginBottom: '4px'
          }}
          cursor={{ fill: 'rgba(180, 180, 250, 0.1)' }}
        />
        <Bar 
          dataKey="amount" 
          fill="hsl(265, 85%, 50%)" 
          radius={[8, 8, 0, 0] as any}
          maxBarSize={45}
          background={{ fill: '#f5f5f5' }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
