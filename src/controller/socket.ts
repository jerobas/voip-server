import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import {
  SOCKET_CLIENT_EVENTS,
  SOCKET_SERVER_EVENTS,
  User,
} from "../shared/main";
import RoomService from "../service/RoomService";
import logger from "../utils/logger";

type Handler = (
  socket: Socket,
  params: any,
  callback?: (callbackParams: any) => void
) => void;
type Emitter = (params: any) => void;

class SocketServer {
  private static _instance: SocketIOServer;

  private static eventHandlers: Record<SOCKET_SERVER_EVENTS, Handler> = {
    [SOCKET_SERVER_EVENTS.DISCONNECT]: this._onDisconnect,
    [SOCKET_SERVER_EVENTS.USER_JOIN]: this._onUserJoin,
    [SOCKET_SERVER_EVENTS.USER_LEAVE]: this._onUserLeave,
  };

  private static eventEmitters: Record<SOCKET_CLIENT_EVENTS, Emitter> = {
    [SOCKET_CLIENT_EVENTS.USER_JOINED]: ({
      roomId,
      player,
    }: {
      roomId: string;
      player: User;
    }) => this.io.to(roomId).emit(SOCKET_CLIENT_EVENTS.USER_JOINED, player),
    [SOCKET_CLIENT_EVENTS.USER_LEFT]: ({
      roomId,
      summonerId,
    }: {
      roomId: string;
      summonerId: string;
    }) => this.io.to(roomId).emit(SOCKET_CLIENT_EVENTS.USER_LEFT, summonerId),
  };

  static init(httpServer: HTTPServer): SocketIOServer {
    if (!this._instance) {
      this._instance = new SocketIOServer(httpServer, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
        pingInterval: 5000,
        pingTimeout: 7000
      });

      this._instance.on("connection", this._onConnection.bind(this));

      logger.info("Socket.IO server initialized");
    }

    return this._instance;
  }

  private static get io(): SocketIOServer {
    if (!this._instance) throw new Error("SocketServer not initialized.");
    return this._instance;
  }

  private static emit<E extends SOCKET_CLIENT_EVENTS>(
    event: E,
    data: Parameters<(typeof this.eventEmitters)[E]>[0]
  ) {
    this.eventEmitters[event]?.(data);
  }

  private static _onConnection(socket: Socket) {
    Object.entries(this.eventHandlers).forEach(([key, handler]) =>
      socket.on(key, (params, callback) =>
        handler.call(this, socket, params, callback)
      )
    );
  }

  private static _onUserJoin(
    socket: Socket,
    {
      roomId,
      playerName,
      peerId,
      summonerId,
    }: {
      roomId: string;
      playerName: string;
      peerId: string;
      summonerId: string;
    },
    callback?: (players: User[]) => void
  ) {
    const room = RoomService.addPlayerToRoom(
      roomId,
      socket.id,
      playerName,
      peerId,
      summonerId
    );
    try {
      if (room) {
        socket.join(roomId);
        let players = RoomService.getRoomPlayers(roomId);
        callback?.(players);
        socket.to(roomId).emit(SOCKET_CLIENT_EVENTS.USER_JOINED, {
          id: socket.id,
          peerId,
          summonerId,
          name: playerName,
        });
        logger.info("User joined", {
          socketId: socket.id,
          playerName,
          roomId,
        });
      } else {
        socket.emit("error", { message: "Room does not exist" });
        logger.warn("Attempt to join nonexistent room", {
          socketId: socket.id,
          playerName,
          roomId,
        });
      }
    } catch (error) {
      logger.error("Error on user join", {
        error,
        socketId: socket.id,
        playerName,
        roomId,
      });
    }
  }

  private static _onUserLeave(
    socket: Socket,
    { roomId, playerName }: { roomId: string; playerName: string }
  ) {
    RoomService.removePlayer(roomId, playerName);
    socket.leave(roomId);

    logger.info("User left", {
      socketId: socket.id,
      playerName,
      roomId,
    });
  }

  private static _onDisconnect(socket: Socket) {
    const [disconnectedPlayer, roomId] = RoomService.removePlayerBySocket(
      socket.id
    );
    if (!disconnectedPlayer || !roomId) return;
    this.emit(SOCKET_CLIENT_EVENTS.USER_LEFT, { roomId, summonerId: disconnectedPlayer });

    logger.info("User disconnected", {
      socketId: socket.id,
      summonerId: disconnectedPlayer,
      roomId,
    });
  }
}

export default SocketServer;
