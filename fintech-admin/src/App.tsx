import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './PrivateRoute';
import Users from './pages/Users';
import Recharges from './pages/Recharges';
import Transfers from './pages/Transfers';
import Notifications from './pages/Notifications';
import Wallets from './pages/Wallets';
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route path="/users" element={<Users />} />
      <Route path="/recharges" element={<Recharges />} />
      <Route path="/transfers" element={<Transfers />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/wallets" element={<Wallets />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
