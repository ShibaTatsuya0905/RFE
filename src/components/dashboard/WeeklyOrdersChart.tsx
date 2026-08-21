import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyOrdersChartProps {
  data: { name: string; orders: number }[];
}

const WeeklyOrdersChart: React.FC<WeeklyOrdersChartProps> = ({ data }) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-80 flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Weekly Workload</h3>
        <p className="text-xs text-slate-400 mt-0.5">Volume of processed orders this week</p>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
            <XAxis dataKey="name" stroke="#64748B" tickLine={false} axisLine={false} dy={8} style={{ fontSize: '11px' }} />
            <YAxis stroke="#64748B" tickLine={false} axisLine={false} dx={-8} style={{ fontSize: '11px' }} />
            <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', color: '#fff' }} formatter={(v: any) => [`${v} orders`, 'Volume']} />
            <Bar dataKey="orders" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyOrdersChart;