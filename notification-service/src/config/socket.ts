import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { env } from "./env";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, { 
    cors: { 
      origin: "http://localhost:3000", 
      credentials: true,
      allowedHeaders: ["authorization", "content-type"]
    } 
  });

  io.use((socket, next) => {
    // First try to get token from auth (manual passing)
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

export { io };
