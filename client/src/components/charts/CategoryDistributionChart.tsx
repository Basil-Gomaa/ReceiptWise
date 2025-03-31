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
    color: category.color,
    // Add a shadow color for hover effects
    shadowColor: `${category.color}80`
  }));

  // Calculate total to use for percentages
  const totalSpending = chartData.reduce((sum, category) => sum + category.value, 0);

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

  // Custom legend that responds to hover
  const CustomLegend = () => (
    <div className="flex flex-col gap-2 pr-2">
      {chartData.map((entry, index) => (
        <motion.div
          key={`legend-${index}`}
          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg"
          whileHover={{ 
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            scale: 1.02,
            transition: { duration: 0.2 } 
          }}
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <div 
            className="w-3.5 h-3.5 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {entry.name}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
            {formatCurrency(entry.value, false)}
          </span>
        </motion.div>
      ))}
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
          {chartData.map((entry, index) => (
            <filter key={`shadow-${index}`} id={`shadow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={entry.color} floodOpacity="0.5" />
            </filter>
          ))}
        </defs>
        <Pie
          data={chartData}
          cx="40%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={110}
          innerRadius={55}
          paddingAngle={3}
          dataKey="value"
          stroke={isDarkMode ? "#1a202c" : "#ffffff"}
          strokeWidth={2}
          activeIndex={activeIndex}
          activeShape={(props) => {
            const RADIAN = Math.PI / 180;
            const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
            
            return (
              <g filter={`url(#shadow-${activeIndex})`}>
                <path 
                  d={`M ${cx},${cy} L ${cx + outerRadius * Math.cos(-startAngle * RADIAN)},${cy + outerRadius * Math.sin(-startAngle * RADIAN)} A ${outerRadius},${outerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0},0 ${cx + outerRadius * Math.cos(-endAngle * RADIAN)},${cy + outerRadius * Math.sin(-endAngle * RADIAN)} L ${cx},${cy}`} 
                  fill={fill} 
                  stroke={isDarkMode ? "#1a202c" : "#ffffff"}
                  strokeWidth={2}
                />
                <path 
                  d={`M ${cx},${cy} L ${cx + innerRadius * Math.cos(-startAngle * RADIAN)},${cy + innerRadius * Math.sin(-startAngle * RADIAN)} A ${innerRadius},${innerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0},0 ${cx + innerRadius * Math.cos(-endAngle * RADIAN)},${cy + innerRadius * Math.sin(-endAngle * RADIAN)} L ${cx},${cy}`} 
                  fill={isDarkMode ? "#1a202c" : "#ffffff"} 
                />
              </g>
            );
          }}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
              className="transition-all duration-300"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          content={<CustomLegend />} 
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ right: 0 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
