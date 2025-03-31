import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { useDarkMode } from "@/hooks/useDarkMode";

interface CategoryDistributionChartProps {
  data: Array<{
    id: number;
    name: string;
    color: string;
    total: number;
  }>;
}

export default function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  const { isDarkMode } = useDarkMode();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Format for the chart
  const chartData = data.map(category => ({
    name: category.name,
    value: category.total,
    color: category.color
  }));

  // Calculate total to use for percentages
  const totalSpending = chartData.reduce((sum, category) => sum + category.value, 0);

  // Calculate percentage for each category
  const chartDataWithPercentage = chartData.map(item => ({
    ...item,
    percentage: totalSpending > 0 ? Math.round((item.value / totalSpending) * 100) : 0
  }));

  // Sort from highest to lowest total
  chartDataWithPercentage.sort((a, b) => b.value - a.value);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ 
    cx, cy, midAngle, innerRadius, outerRadius, percent, index 
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show percentage labels for segments over 5%
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        className="drop-shadow-md"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700"
          style={{ 
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: payload[0].payload.color }}
            />
            <p className="font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
          </div>
          <p className="text-primary font-bold text-lg">
            {formatCurrency(payload[0].value)}
          </p>
          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${(payload[0].value / totalSpending * 100).toFixed(1)}%`,
                backgroundColor: payload[0].payload.color,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {`${(payload[0].value / totalSpending * 100).toFixed(1)}% of total spending`}
          </p>
        </motion.div>
      );
    }
    return null;
  };

  // Custom legend that matches the design
  const CustomLegend = () => (
    <div className="flex flex-col gap-2">
      {chartDataWithPercentage.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex items-center gap-3 cursor-pointer p-1"
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {entry.name}
          </span>
          <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-auto">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartDataWithPercentage}
          cx="35%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={85}
          innerRadius={50}
          paddingAngle={2}
          dataKey="value"
          stroke="transparent"
          activeIndex={activeIndex as number | undefined}
        >
          {chartDataWithPercentage.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          content={<CustomLegend />} 
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ right: 0, width: '65%', top: '50%', transform: 'translateY(-50%)' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
