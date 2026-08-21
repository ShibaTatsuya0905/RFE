import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, FileDown, ShoppingBag, CreditCard, TrendingUp, Calendar } from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import apiClient from '../../services/apiClient';

const COLORS = [
  '#3B82F6', 
  '#10B981', 
  '#F59E0B', 
  '#F43F5E', 
  '#8B5CF6', 
  '#06B6D4', 
  '#EC4899', 
  '#6366F1', 
  '#F97316', 
  '#84CC16'
];

const sparklineMock = [{ value: 30 }, { value: 45 }, { value: 35 }, { value: 60 }, { value: 40 }, { value: 70 }, { value: 90 }];
const ChartComponent = RevenueChart as any;

const RevenueDashboard: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Month');

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/dashboard/summary?period=${period}`)
      .then(res => {
        setSummary(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  const handleExport = (format: string) => {
    alert(`Generating ${format.toUpperCase()} report with live database values...`);
  };

  if (loading || !summary) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Revenue Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Deep analysis of restaurant performance and sales data</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="Day">Hôm nay (Day)</option>
              <option value="Week">Tuần này (Week)</option>
              <option value="Month">Tháng này (Month)</option>
              <option value="Year">Năm nay (Year)</option>
              <option value="All">Tổng tất cả (All Time)</option>
            </select>
          </div>
          <button onClick={() => handleExport('excel')} className="bg-[#1E293B]/40 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-xl font-bold text-xs text-slate-300 hover:text-white flex items-center gap-2 transition">
            <FileDown size={16} /> Export Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition shadow-lg shadow-blue-500/10">
            <FileDown size={16} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Revenue Selected" value={`${summary.todayRevenue.toLocaleString()} đ`} change="+12.5%" isPositive={true} icon={<DollarSign size={20} />} sparklineData={sparklineMock} gradientColor="#22C55E" />
        <StatsCard title="Orders Selected" value={summary.ordersToday.toString()} change="+8.3%" isPositive={true} icon={<ShoppingBag size={20} />} sparklineData={sparklineMock} gradientColor="#3B82F6" />
        <StatsCard title="Customers Served" value={summary.customers.toString()} change="+18.4%" isPositive={true} icon={<TrendingUp size={20} />} sparklineData={sparklineMock} gradientColor="#F59E0B" />
        <StatsCard title="Average Bill" value={`${summary.averageBill.toLocaleString()} đ`} change="+2.1%" isPositive={true} icon={<CreditCard size={20} />} sparklineData={sparklineMock} gradientColor="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartComponent data={summary.monthlyRevenue} period={period} />
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl h-96 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Revenue by Food Variant</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sales contribution by food items</p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            {summary.revenueByCategory.length === 0 ? (
              <p className="text-slate-500 text-sm">No sales data recorded yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', color: '#fff' }} formatter={(v: any) => [`${v.toLocaleString()} đ`, 'Doanh thu']} />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                  <Pie data={summary.revenueByCategory} cx="40%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                    {summary.revenueByCategory.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;