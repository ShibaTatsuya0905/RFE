import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  sparklineData: { value: number }[];
  gradientColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, value, change, isPositive, icon, sparklineData, gradientColor 
}) => {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex flex-col justify-between hover:border-slate-700 hover:scale-[1.01] transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-sm font-medium text-slate-400">{title}</span>
          <h3 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-slate-400">
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between mt-2">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center p-1 rounded-lg text-xs font-semibold ${
            isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {change}
          </span>
          <span className="text-xs text-slate-400">vs yesterday</span>
        </div>

        <div className="h-10 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={gradientColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={gradientColor} 
                strokeWidth={1.5} 
                fillOpacity={1} 
                fill={`url(#grad-${title})`} 
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;