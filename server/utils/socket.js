const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

// Authenticate socket connections via JWT (passed in handshake auth)
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication token missing'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id || !decoded.role) {
      return next(new Error('Invalid token payload'));
    }
    socket.user = { id: decoded.id.toString(), role: decoded.role };
    next();
  } catch (err) {
    return next(new Error(err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'));
  }
};

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const { id, role } = socket.user;

    // Auto-join role scoped room after authenticated handshake
    socket.join(`role_${role}`);
    console.log(`⚡ Socket connected: ${socket.id} (${role})`);

    // Only allow joining your own user room
    socket.on('join_user_room', (userId) => {
      if (userId && userId.toString() === id) {
        socket.join(`user_${id}`);
      }
    });

    // Only allow a vendor to join their own vendor room
    socket.on('join_vendor_room', (vendorId) => {
      if (role === 'vendor' && vendorId && vendorId.toString() === id) {
        socket.join(`vendor_${id}`);
      }
    });

    // Only admins may join the admin room (already joined role_admin above)
    socket.on('join_admin_room', () => {
      if (role === 'admin') {
        socket.join('role_admin');
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
