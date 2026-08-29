import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import StudentDashboardPage from './pages/student/StudentDashboardPage';
import ResourceListPage from './pages/student/ResourceListPage';
import ResourceDetailPage from './pages/student/ResourceDetailPage';
import CreateBookingPage from './pages/student/CreateBookingPage';
import MyBookingsPage from './pages/student/MyBookingsPage';
import ProfilePage from './pages/student/ProfilePage';
import UndertakingPage from './pages/student/UndertakingPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageResourcesPage from './pages/admin/ManageResourcesPage';
import AddResourcePage from './pages/admin/AddResourcePage';
import EditResourcePage from './pages/admin/EditResourcePage';
import AllBookingsPage from './pages/admin/AllBookingsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';

import NotFoundPage from './pages/NotFoundPage';

import {
  LayoutDashboard,
  Compass,
  CalendarCheck,
  User,
  Boxes,
  ClipboardList,
  Users,
  ScrollText,
} from 'lucide-react';

const studentNavLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/resources', label: 'Browse Resources', icon: Compass },
  { to: '/student/bookings', label: 'My Bookings', icon: CalendarCheck },
  { to: '/student/profile', label: 'Profile', icon: User },
];

const adminNavLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/resources', label: 'Manage Resources', icon: Boxes },
  { to: '/admin/bookings', label: 'All Bookings', icon: ClipboardList },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route element={<DashboardLayout navLinks={studentNavLinks} />}>
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/resources" element={<ResourceListPage />} />
            <Route path="/student/resources/:id" element={<ResourceDetailPage />} />
            <Route path="/student/resources/:id/book" element={<CreateBookingPage />} />
            <Route path="/student/bookings" element={<MyBookingsPage />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Route>
          <Route path="/student/bookings/:id/undertaking" element={<UndertakingPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<DashboardLayout navLinks={adminNavLinks} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/resources" element={<ManageResourcesPage />} />
            <Route path="/admin/resources/new" element={<AddResourcePage />} />
            <Route path="/admin/resources/:id/edit" element={<EditResourcePage />} />
            <Route path="/admin/bookings" element={<AllBookingsPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;