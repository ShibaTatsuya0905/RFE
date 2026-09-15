import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface FeedbackChartProps {
  data: any[];
}

const FeedbackChart: React.FC<FeedbackChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-500 text-sm py-10">Chưa có đánh giá nào</div>;
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-80 flex flex-col shadow-xl">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-white tracking-tight">Customer Satisfaction</h3>
        <p className="text-xs text-slate-400 mt-0.5">Average ratings based on 4 key metrics</p>
      </div>
      <div className="flex-1 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748B', fontSize: 10 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
            />
            <Radar name="Rating" dataKey="score" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeedbackChart;