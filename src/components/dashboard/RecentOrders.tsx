import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface RecentOrdersProps {
  data: { name: string; load: number }[];
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ data }) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-96 flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Kitchen Workload</h3>
        <p className="text-xs text-slate-400 mt-0.5">Realtime kitchen capacity percentage</p>
      </div>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWorkload" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', color: '#fff' }} />
            <Area type="monotone" dataKey="load" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorWorkload)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
        <span className="text-slate-400">Peak hour expected:</span>
        <span className="text-yellow-500 font-bold">18:00 - 19:30</span>
      </div>
    </div>
  );
};

export default RecentOrders;