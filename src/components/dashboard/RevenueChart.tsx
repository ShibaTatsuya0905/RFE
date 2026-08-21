import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: { name: string; revenue: number }[];
  period?: string;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, period = 'Year' }) => {
  const multiplier = ['Day', 'Week', 'Month'].includes(period) ? 1000 : 1000000;
  const label = ['Day', 'Week', 'Month'].includes(period) ? 'K' : 'M';

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-96 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Revenue Analytics</h3>
          <p className="text-xs text-slate-400 mt-0.5">Revenue trends over selected period</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-white">{period}</span>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
            <XAxis dataKey="name" stroke="#64748B" tickLine={false} axisLine={false} dy={10} style={{ fontSize: '11px' }} />
            <YAxis stroke="#64748B" tickLine={false} axisLine={false} dx={-10} tickFormatter={(v) => `${v}${label}`} style={{ fontSize: '11px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', color: '#fff' }}
              labelStyle={{ fontWeight: 'bold', color: '#94A3B8' }}
              itemStyle={{ color: '#3B82F6' }}
              formatter={(v: any) => [`${(v * multiplier).toLocaleString()} đ`, 'Doanh thu']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;