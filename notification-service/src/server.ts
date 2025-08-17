import http from "http";
import app from "./app";
import { initSocket } from "./config/socket";
import { env } from "./config/env";

const server = http.createServer(app);
const io = initSocket(server);
io.listen(6001)

server.listen(env.PORT, () => {
  console.log(`Notification service running on port ${env.PORT}`);
});
