import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PopularFoodsChartProps {
  data: { name: string; value: number }[];
}

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', 
  '#06B6D4', '#EC4899', '#6366F1', '#F97316', '#84CC16',
  '#0EA5E9', '#D946EF', '#EAB308', '#EF4444', '#22C55E', 
  '#A855F7', '#34D399', '#F472B6', '#FB923C', '#4ADE80', 
  '#60A5FA', '#A78BFA', '#F87171', '#FB7185', '#38BDF8', 
  '#C084FC', '#FBBF24', '#A3E635', '#2DD4BF', '#EC4899'
];

const PopularFoodsChart: React.FC<PopularFoodsChartProps> = ({ data }) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-80 flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-white tracking-tight">Popular Foods</h3>
        <p className="text-xs text-slate-400 mt-0.5">Most sold menu items distribution</p>
      </div>
      <div className="flex-1 w-full flex items-center justify-center">
        {data.length === 0 ? (
          <p className="text-slate-500 text-sm">No sales data recorded yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', color: '#fff' }} />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
              <Pie data={data} cx="40%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PopularFoodsChart;