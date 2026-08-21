import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', revenue: 45 },
  { name: 'Feb', revenue: 52 },
  { name: 'Mar', revenue: 61 },
  { name: 'Apr', revenue: 58 },
  { name: 'May', revenue: 73 },
  { name: 'Jun', revenue: 81 },
];

const MonthlyRevenueChart: React.FC = () => {
  return (
    <div className="bg-gray-900 p-6 rounded-lg w-full font-sans border border-gray-800">
      <div className="mb-6">
        <h2 className="text-white text-xl font-bold mb-1">Ví dụ biểu đồ doanh thu theo tháng</h2>
        <h3 className="text-white text-lg font-semibold mt-4">Monthly Revenue</h3>
        <p className="text-gray-400 text-sm">Doanh thu theo tháng</p>
      </div>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" />
            <XAxis dataKey="name" stroke="#888888" tick={{ fill: '#cccccc', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis stroke="#888888" tick={{ fill: '#cccccc', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value} TrVNĐ`} domain={[30, 90]} ticks={[30, 45, 60, 75, 90]} width={80} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#3b82f6' }} formatter={(value: any) => [`${value} Triệu VNĐ`, 'Doanh thu']} />
            <Line type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default MonthlyRevenueChart;