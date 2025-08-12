import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import { env } from "./env";

let io: Server;

export const initSocket = (server: http.Server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const user = jwt.verify(token, env.JWT_SECRET) as any;
      socket.data.userId = user.id;
      socket.join(user.id); // join private room
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
