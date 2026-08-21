import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Grid3X3, Users, Calendar } from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import WeeklyOrdersChart from '../../components/dashboard/WeeklyOrdersChart';
import PopularFoodsChart from '../../components/dashboard/PopularFoodsChart';
import RecentOrders from '../../components/dashboard/RecentOrders';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import apiClient from '../../services/apiClient';

const sparklineMock = [{ value: 30 }, { value: 45 }, { value: 35 }, { value: 60 }, { value: 40 }, { value: 70 }, { value: 90 }];
const ChartComponent = RevenueChart as any;
const WeeklyChartComponent = WeeklyOrdersChart as any;
const PopularChartComponent = PopularFoodsChart as any;
const WorkloadChartComponent = RecentOrders as any;

const AdminDashboard: React.FC = () => {
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

  if (loading || !summary) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Main Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Realtime overview of your restaurant operations</p>
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 appearance-none shadow-lg"
          >
            <option value="Day">Hôm nay (Day)</option>
            <option value="Week">Tuần này (Week)</option>
            <option value="Month">Tháng này (Month)</option>
            <option value="Year">Năm nay (Year)</option>
            <option value="All">Tổng tất cả (All Time)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Revenue Selected" value={`${summary.todayRevenue.toLocaleString()} đ`} change="+12.5%" isPositive={true} icon={<DollarSign size={20} />} sparklineData={sparklineMock} gradientColor="#22C55E" />
        <StatsCard title="Orders Selected" value={summary.ordersToday.toString()} change="+8.3%" isPositive={true} icon={<ShoppingBag size={20} />} sparklineData={sparklineMock} gradientColor="#3B82F6" />
        <StatsCard title="Active Tables" value={`${summary.customers > 0 ? Math.ceil(summary.customers / 3) : 0} / 12`} change="-2%" isPositive={false} icon={<Grid3X3 size={20} />} sparklineData={sparklineMock} gradientColor="#EF4444" />
        <StatsCard title="Customers Served" value={summary.customers.toString()} change="+18.4%" isPositive={true} icon={<Users size={20} />} sparklineData={sparklineMock} gradientColor="#F59E0B" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChartComponent data={summary.monthlyRevenue} period={period} />
        </div>
        <div>
          <WorkloadChartComponent data={summary.kitchenWorkload} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WeeklyChartComponent data={summary.weeklyWorkload} />
        <PopularChartComponent data={summary.popularFoods} />
      </div>

      <RecentTransactions />
    </div>
  );
};

export default AdminDashboard;