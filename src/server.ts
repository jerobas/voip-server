import express from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";
import cors from "cors";
import RoomService from "./service/RoomService";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

io.on("connection", (socket: Socket) => {
  socket.on(
    "joinRoom",
    async ({
      roomId,
      playerName,
      peerId,
    }: {
      roomId: string;
      playerName: string;
      peerId: string;
    }) => {
      const room = await RoomService.addPlayerToRoom(
        roomId,
        socket.id,
        playerName,
        peerId
      );
      if (room) {
        socket.join(roomId);
        let players = await RoomService.getRoomPlayers(roomId);
        io.to(roomId).emit("userJoined", players);
      } else {
        socket.emit("error", { message: "Room does not exist" });
      }
    }
  );

  socket.on(
    "leaveRoom",
    async ({ roomId, playerName }: { roomId: string; playerName: string }) => {
      await RoomService.removePlayer(roomId, playerName);
      socket.leave(roomId);
    }
  );

  socket.on("disconnect", async () => {
    await RoomService.removePlayerBySocket(socket.id)
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
