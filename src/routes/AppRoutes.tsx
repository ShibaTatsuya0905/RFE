import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CustomerMenu from '../features/menu/CustomerMenu';
import KitchenDashboard from '../features/kitchen/KitchenDashboard';
import CashierDashboard from '../features/cashier/CashierDashboard';
import WaiterDashboard from '../features/waiter/WaiterDashboard';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboard from '../features/dashboard/AdminDashboard';
import OrdersManagement from '../features/orders/OrdersManagement';
import RevenueDashboard from '../features/revenue/RevenueDashboard';
import EmployeeManagement from '../features/employees/EmployeeManagement';
import RestaurantSettings from '../features/settings/RestaurantSettings';
import ReportsDashboard from '../features/reports/ReportsDashboard';
import UserProfile from '../features/profile/UserProfile';
import AdminMenuManagement from '../features/menu/AdminMenuManagement';
import TableManagement from '../features/tables/TableManagement';
import Login from '../features/auth/Login';
import ProtectedRoute from './ProtectedRoute';

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/menu/:tableId" element={<CustomerMenu />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute allowedRoles={['Chef', 'Admin']} />}>
        <Route path="/kitchen" element={<KitchenDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Cashier', 'Admin']} />}>
        <Route path="/cashier" element={<CashierDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Waiter', 'Admin']} />}>
        <Route path="/waiter" element={<WaiterDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['Admin', 'Chef', 'Cashier', 'Waiter']} />}>
        <Route path="/profile" element={<UserProfile />} />
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<OrdersManagement />} />
          <Route path="revenue" element={<RevenueDashboard />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="settings" element={<RestaurantSettings />} />
          <Route path="reports" element={<ReportsDashboard />} />
          <Route path="menu" element={<AdminMenuManagement />} />
          <Route path="tables" element={<TableManagement />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);