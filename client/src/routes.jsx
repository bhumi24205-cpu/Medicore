import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientNew from './pages/PatientNew';
import PatientDetail from './pages/PatientDetail';
import Doctors from './pages/Doctors';
import Departments from './pages/Departments';
import Appointments from './pages/Appointments';
import AppointmentNew from './pages/AppointmentNew';
import AppointmentDetail from './pages/AppointmentDetail';
import Admissions from './pages/Admissions';
import Billing from './pages/Billing';
import Pharmacy from './pages/Pharmacy';
import LabOrders from './pages/LabOrders';
import PatientMap from './pages/PatientMap';
import Reports from './pages/Reports';
import QueryExplorer from './pages/QueryExplorer';
import RuleLab from './pages/RuleLab';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center">Loading session...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/new" element={<PatientNew />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="departments" element={<Departments />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="appointments/new" element={<AppointmentNew />} />
        <Route path="appointments/:id" element={<AppointmentDetail />} />
        <Route path="admissions" element={<Admissions />} />
        <Route path="billing" element={<Billing />} />
        <Route path="pharmacy" element={<Pharmacy />} />
        <Route path="lab" element={<LabOrders />} />
        <Route path="map" element={<PatientMap />} />
        <Route path="reports" element={<Reports />} />
        <Route path="lab-tools/query-explorer" element={<QueryExplorer />} />
        <Route path="lab-tools/rule-tests" element={<RuleLab />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
