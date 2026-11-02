import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

// `npm start` mengirim flag --prod (cross-platform, tanpa NODE_ENV=... di script)
const dev = !process.argv.includes("--prod") && process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    socket.on("send_msg", (payload) => {
      const { roomId, chatData } = payload;
      
      io.to(roomId).emit("receive_msg", chatData);
    });

    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error("HTTP Server Error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});