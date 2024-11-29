import express, { Request, Response } from "express";
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

app.post("/api/create-room", (req: Request, res: Response) => {
  const { roomId } = req.body;

  if (!roomId) {
    return res.status(400).json({ error: "Room ID is required" });
  }

  const room = RoomService.createRoom(roomId);
  return res.json({ success: true, room });
});

io.on("connection", (socket: Socket) => {
  console.log("User connected");

  socket.on(
    "joinRoom",
    ({ roomId, playerName }: { roomId: string; playerName: string }) => {
      const room = RoomService.addPlayerToRoom(roomId, socket.id, playerName);
      if (room) {
        socket.join(roomId);
        console.log(`${playerName} joined room ${roomId}`);
        io.to(roomId).emit("userJoined", RoomService.getRoomPlayers(roomId));
      } else {
        socket.emit("error", { message: "Room does not exist" });
      }
    }
  );

  socket.on(
    "signal",
    ({ roomId, signal, to }: { roomId: string; signal: any; to: string }) => {
      io.to(to).emit("signal", { signal, from: socket.id });
    }
  );

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    RoomService.getRoomPlayers("").forEach((room) => {
      RoomService.removePlayerFromRoom(room.id, socket.id);
      io.to(room.id).emit("userJoined", RoomService.getRoomPlayers(room.id));
    });
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
