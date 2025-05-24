import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import AircraftList from './pages/aircraft/AircraftList';
import AircraftDetail from './pages/aircraft/AircraftDetail';
import AircraftParts from './pages/aircraft/AircraftParts';
import MaintenanceTasks from './pages/maintenance/MaintenanceTasks';
import MaintenanceDetail from './pages/maintenance/MaintenanceDetail';
import WorkOrders from './pages/maintenance/WorkOrders';
import InventoryList from './pages/inventory/InventoryList';
import InventoryDetail from './pages/inventory/InventoryDetail';
import DocumentList from './pages/documents/DocumentList';
import DocumentDetail from './pages/documents/DocumentDetail';
import WorkflowPage from './pages/workflow/WorkflowPage';
import AnalysisPage from './pages/analysis/AnalysisPage';
import AIAssistantPage from './pages/ai/AIAssistantPage';
import AircraftViewer from './pages/viewer/AircraftViewer';
import UserProfile from './pages/user/UserProfile';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/aircraft" element={<AircraftList />} />
        <Route path="/aircraft/:id" element={<AircraftDetail />} />
        <Route path="/aircraft/:id/parts" element={<AircraftParts />} />
        <Route path="/maintenance" element={<MaintenanceTasks />} />
        <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
        <Route path="/workorders" element={<WorkOrders />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/inventory/:id" element={<InventoryDetail />} />
        <Route path="/documents" element={<DocumentList />} />
        <Route path="/documents/:id" element={<DocumentDetail />} />
        <Route path="/workflow" element={<WorkflowPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/ai" element={<AIAssistantPage />} />
        <Route path="/viewer/:id" element={<AircraftViewer />} />
        <Route path="/profile" element={<UserProfile />} />
      </Route>
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
