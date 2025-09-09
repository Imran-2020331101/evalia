import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { env } from "./env";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, { 
    cors: { 
      origin: `${process.env.FRONTEND_URL}` || 'http://localhost:3000', 
      credentials: true,
      allowedHeaders: ["authorization", "content-type"]
    } 
  });

  io.use((socket, next) => {

    let token = socket.handshake.auth?.token;
    
    // If not found, try to extract from Authorization header (Bearer token)
    if (!token) {
      const authHeader = socket.handshake.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
    
    // If still not found, try to extract from cookie
    if (!token) {
      const cookieHeader = socket.handshake.headers.cookie;
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }
    }
    
    
    console.log('Extracted token:', token ? 'Found' : 'Not found');
    
    if (!token) return next(new Error("Authentication required"));
    try {
      const user = jwt.verify(token, env.JWT_SECRET) as any;
      socket.data.userId = user.sub;
      socket.join(user.sub); 
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.data.userId}`);
  });

  return io;
};

// Global notification methods

export const notifyUser = (userId: string, notification: any) => {
  if (io) {
    io.to(userId).emit("notification", notification);
    console.log(`General notification emitted to user: ${userId}`);
  } else {
    console.warn("Socket.IO instance not available for real-time notification");
  }
};

export const notifyMultipleUsers = (userIds: string[], notification: any) => {
  if (io) {
    userIds.forEach(userId => {
      io.to(userId).emit("notification", notification);
    });
    console.log(`General notification emitted to ${userIds.length} users`);
  } else {
    console.warn("Socket.IO instance not available for real-time notification");
  }
};

export const broadcastNotification = (notification: any) => {
  if (io) {
    io.emit("notification", notification);
    console.log("General notification broadcasted to all connected users");
  } else {
    console.warn("Socket.IO instance not available for real-time notification");
  }
};

export const notifyInterviewUpdate = (userId: string, interviewNotification: any) => {
  if (io) {
    io.to(userId).emit("interview-notification", interviewNotification);
    console.log(`Interview notification emitted to user: ${userId}`);
  } else {
    console.warn("Socket.IO instance not available for real-time interview notification");
  }
};

export { io };
