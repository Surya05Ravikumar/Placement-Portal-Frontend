import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/student/Layout';

import Dashboard from './pages/student/dashboard';
import Companies from './pages/student/companies';
import Applications from './pages/student/applications';
import ApplyCompany from './pages/student/applycompany';
import Resources from './pages/student/resources';
import Messages from './pages/student/message';
import Profile from './pages/student/profile';
import ApplicationDetail from './pages/student/applicationview';
import Settings from './pages/student/settings';

import Login from './pages/login/login';

import ProtectedRoute from './components/student/ProtectedRoute';

import AdminDashboard from './pages/admin/admindashboard';
import StudentManagement from './pages/admin/studentmanagement';
import CompanyManagement from './pages/admin/companymanagement';
import AdminLayout from './components/admin/AdminLayout';
import AdminCompanyDetail from './pages/admin/companydetails';
import AddCompany from './pages/admin/addcompany';
import AdminResources from './pages/admin/adminresources';
import AdminMessages from './pages/admin/adminmessage';
import AdminReports from './pages/admin/adminreport';
import AdminProfile from './pages/admin/adminprofile';
import AdminSettings from './pages/admin/adminsettings';
import { AdminProvider } from './context/AdminContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/login" element={<Login />} />

        {/* Student Routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/companies/:id/apply" element={<ApplyCompany />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Admin Routes */}
        <Route element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProvider>
              <AdminLayout />
            </AdminProvider>
          </ProtectedRoute>
        }>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/companies" element={<CompanyManagement />} />
          <Route path="/admin/companies/add" element={<AddCompany />} />
          <Route path="/admin/companies/edit/:id" element={<AddCompany />} />
          <Route path="/admin/companies/:id" element={<AdminCompanyDetail />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>

        {/* Fallback to handle any unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
