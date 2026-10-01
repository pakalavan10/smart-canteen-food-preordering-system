import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user: contextUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Resolve user from context or current tab's sessionStorage
  let user = contextUser;
  if (!user) {
    const sessionUserStr = sessionStorage.getItem('user');
    if (sessionUserStr) {
      try { user = JSON.parse(sessionUserStr); } catch (e) {}
    }
  }

  if (!user) {
    const targetRole = allowedRoles?.[0] || 'student';
    return <Navigate to={`/${targetRole}/login`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const targetRole = allowedRoles?.[0] || 'student';
    return <Navigate to={`/${targetRole}/login`} replace />;
  }

  return children;
};

export default ProtectedRoute;
