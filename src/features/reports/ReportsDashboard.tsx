import React, { useState } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FileDown, Calendar, TrendingDown, ClipboardList } from 'lucide-react';

const cancelRateData = [
  { name: 'Mon', rate: 2 },
  { name: 'Tue', rate: 5 },
  { name: 'Wed', rate: 1 },
  { name: 'Thu', rate: 8 },
  { name: 'Fri', rate: 3 },
  { name: 'Sat', rate: 11 },
  { name: 'Sun', rate: 4 }
];

const paymentRatioData = [
  { name: 'Momo QR', value: 45 },
  { name: 'VNPAY QR', value: 20 },
  { name: 'Cash', value: 25 },
  { name: 'Visa/Master', value: 10 }
];

const staffPerformance = [
  { name: 'Michael Cook', role: 'Chef', processed: 412, speed: '12m/order', errorRate: '0.5%' },
  { name: 'Jenny Cash', role: 'Cashier', processed: 620, speed: '45s/bill', errorRate: '0%' },
  { name: 'Tom Waiter', role: 'Waiter', processed: 320, speed: '2m/serving', errorRate: '1.2%' },
];

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444'];

const ReportsDashboard: React.FC = () => {
  const [reportPeriod, setReportPeriod] = useState('Month');

  const handleExport = (format: 'pdf' | 'excel') => {
    alert(`Generating ${format.toUpperCase()} report...`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Export high-fidelity spreadsheets and metrics reports</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={reportPeriod} 
              onChange={(e) => setReportPeriod(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 appearance-none shadow-lg"
            >
              <option value="Day">Daily Report</option>
              <option value="Week">Weekly Report</option>
              <option value="Month">Monthly Report</option>
              <option value="Year">Yearly Report</option>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl h-80 flex flex-col lg:col-span-2 shadow-xl">
          <div className="mb-4 flex items-center gap-2">
            <TrendingDown className="text-red-500" size={20} />
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Order Cancellation Rate</h3>
              <p className="text-xs text-slate-400 mt-0.5">Weekly cancellation index monitoring</p>
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cancelRateData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCancel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                <XAxis dataKey="name" stroke="#64748B" tickLine={false} axisLine={false} dy={8} style={{ fontSize: '11px' }} />
                <YAxis stroke="#64748B" tickLine={false} axisLine={false} dx={-8} tickFormatter={(v) => `${v}%`} style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="rate" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCancel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl h-80 flex flex-col shadow-xl">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white tracking-tight">Payment Gateways Ratio</h3>
            <p className="text-xs text-slate-400 mt-0.5">Transaction split by payment gateways</p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px', color: '#fff' }} formatter={(v: any) => [`${v}%`, 'Tỷ lệ']} />
                <Pie data={paymentRatioData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                  {paymentRatioData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
          <ClipboardList className="text-blue-500" size={20} />
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Staff Efficiency Audit</h3>
            <p className="text-xs text-slate-400 mt-0.5">Performance indices by roles and execution speed</p>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Employee</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Items Processed</th>
                <th className="pb-3">Avg Execution Speed</th>
                <th className="pb-3 text-right">Error Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {staffPerformance.map((staff, idx) => (
                <tr key={idx} className="hover:bg-slate-800/10 transition duration-150">
                  <td className="py-4 font-semibold text-white">{staff.name}</td>
                  <td className="py-4 text-slate-400">{staff.role}</td>
                  <td className="py-4 text-slate-200 font-semibold">{staff.processed}</td>
                  <td className="py-4 text-blue-500 font-mono font-bold">{staff.speed}</td>
                  <td className="py-4 text-red-500 font-mono text-right">{staff.errorRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;