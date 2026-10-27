import express, { Express } from "express";
import notificationRoutes from "../../src/routes/notificationRoutes";
import { errorHandler, notFoundHandler } from "../../src/middleware";

/**
 * Builds the same express pipeline as src/app.ts but without the side effects
 * (mongoose.connect / connectBroker) and without listening.
 * `extra` lets a test register additional routes before the 404 handler.
 */
export function buildTestApp(extra?: (app: Express) => void): Express {
  const app = express();
  app.use(express.json());
  app.use("/api/notifications", notificationRoutes);
  extra?.(app);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

// ---------- real in-process socket.io helpers (ephemeral port, loopback only) ----------
import http from "http";
import jwt from "jsonwebtoken";
import { io as ioClient, Socket } from "socket.io-client";
import { initSocket } from "../../src/config/socket";

export const signToken = (sub: string, secret = "test-secret") => jwt.sign({ sub }, secret);

export async function startSocketServer() {
  const server = http.createServer();
  const io = initSocket(server);
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const port = (server.address() as any).port as number;
  const clients: Socket[] = [];

  const connect = (opts: any = {}) =>
    new Promise<Socket>((resolve, reject) => {
      const s = ioClient(`http://127.0.0.1:${port}`, {
        forceNew: true, reconnection: false, transports: ["websocket"], ...opts,
      });
      clients.push(s);
      s.on("connect", () => resolve(s));
      s.on("connect_error", (e) => reject(e));
    });

  const close = async () => {
    clients.forEach((c) => c.close());
    io.close();
    await new Promise((r) => server.close(r as any));
  };
  return { port, connect, close, io };
}

export const once = <T = any>(s: Socket, ev: string) => new Promise<T>((r) => s.once(ev, r));
