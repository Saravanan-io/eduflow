import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token && user) {
      const newSocket = io(window.location.origin, {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('📡 Socket connected');
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        console.log('🔌 Socket disconnected');
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [token, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
