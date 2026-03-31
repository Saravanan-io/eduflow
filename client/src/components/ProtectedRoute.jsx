import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
