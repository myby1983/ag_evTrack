import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VehicleProvider, useVehicle } from './context/VehicleContext';
import Login from './pages/Login';
import VehicleForm from './pages/VehicleForm';
import TripLog from './pages/TripLog';
import ChargingLog from './pages/ChargingLog';
import MaintenanceLog from './pages/MaintenanceLog';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Garage from './pages/Garage';
import BottomNav from './components/BottomNav';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Vehicle Check Wrapper
const VehicleGuard = ({ children }) => {
  const { vehicles, loading } = useVehicle();
  if (loading) return <div>Loading...</div>;
  if (vehicles.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <VehicleProvider>
        <Router>
          <div className="app-layout">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={
                <ProtectedRoute>
                  <VehicleForm />
                </ProtectedRoute>
              } />
              <Route path="/trip-log" element={
                <ProtectedRoute>
                  <VehicleGuard>
                    <TripLog />
                  </VehicleGuard>
                </ProtectedRoute>
              } />
              <Route path="/charging-log" element={
                <ProtectedRoute>
                  <VehicleGuard>
                    <ChargingLog />
                  </VehicleGuard>
                </ProtectedRoute>
              } />
              <Route path="/maintenance-log" element={
                <ProtectedRoute>
                  <VehicleGuard>
                    <MaintenanceLog />
                  </VehicleGuard>
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <VehicleGuard>
                    <History />
                  </VehicleGuard>
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <VehicleGuard>
                    <Dashboard />
                  </VehicleGuard>
                </ProtectedRoute>
              } />
              <Route path="/garage" element={
                <ProtectedRoute>
                  <VehicleGuard>
                    <Garage />
                  </VehicleGuard>
                </ProtectedRoute>
              } />
            </Routes>
            <ProtectedRoute>
              <VehicleGuard>
                <BottomNav />
              </VehicleGuard>
            </ProtectedRoute>
          </div>
        </Router>
      </VehicleProvider>
    </AuthProvider>
  );
}

export default App;
