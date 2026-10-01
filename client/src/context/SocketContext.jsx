import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { getActiveToken } from '../api/axios';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Connect to Socket.IO server with JWT auth so the server can verify the user
    const socketInstance = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      auth: { token: getActiveToken() },
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to Socket.IO Server:', socketInstance.id);
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket auth error:', err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Join appropriate rooms when user logs in or changes
  useEffect(() => {
    if (socket && connected && user) {
      // Join user-specific room
      socket.emit('join_user_room', user._id);

      if (user.role === 'vendor') {
        socket.emit('join_vendor_room', user._id);
      } else if (user.role === 'admin') {
        socket.emit('join_admin_room');
      }
    }
  }, [socket, connected, user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
