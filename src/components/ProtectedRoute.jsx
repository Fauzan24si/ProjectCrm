import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

/**
 * Guard route berdasar status login dan role.
 *
 * Pemakaian:
 *   <Route element={<ProtectedRoute />}>...</Route>                  // hanya butuh login
 *   <Route element={<ProtectedRoute role="admin" />}>...</Route>     // hanya admin
 *   <Route element={<ProtectedRoute role="user" />}>...</Route>      // hanya member biasa
 */
function ProtectedRoute({ role }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Role salah → arahkan ke dashboard sesuai role pengguna.
    const fallback = user.role === 'admin' ? '/admin/dashboard' : '/member';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
