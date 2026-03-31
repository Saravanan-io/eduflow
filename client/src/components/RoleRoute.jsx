import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

export default RoleRoute;
