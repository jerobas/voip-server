import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io"
import { SOCKET_CLIENT_EVENTS, SOCKET_SERVER_EVENTS, User } from "../shared/main";
import RoomService from '../service/RoomService'

type Handler = (socket: Socket, params: any, callback?: (callbackParams: any) => void) => void;
type Emitter = (params: any) => void

class SocketServer {
    private static _instance: SocketIOServer;

    private static eventHandlers: Record<SOCKET_SERVER_EVENTS, Handler> = {
        [SOCKET_SERVER_EVENTS.DISCONNECT]: this._onDisconnect,
        [SOCKET_SERVER_EVENTS.USER_JOIN]: this._onUserJoin,
        [SOCKET_SERVER_EVENTS.USER_LEAVE]: this._onUserLeave,
    };

    private static eventEmitters: Record<SOCKET_CLIENT_EVENTS, Emitter> = {
        [SOCKET_CLIENT_EVENTS.USER_JOINED]: ({ roomId, player }: { roomId: string, player: User }) => this.io.to(roomId).emit(SOCKET_CLIENT_EVENTS.USER_JOINED, player),
        [SOCKET_CLIENT_EVENTS.USER_LEFT]: ({ roomId, player }: { roomId: string, player: string }) => this.io.to(roomId).emit(SOCKET_CLIENT_EVENTS.USER_LEFT, player)
    }

    static init(httpServer: HTTPServer): SocketIOServer {
        if (!this._instance) {
            this._instance = new SocketIOServer(httpServer, {
                cors: {
                    origin: "*",
                    methods: ["GET", "POST"]
                }
            });

            this._instance.on("connection", this._onConnection.bind(this));
        }

        return this._instance;
    }

    private static get io(): SocketIOServer {
        if (!this._instance) throw new Error("SocketServer not initialized.");
        return this._instance;
    }

    private static emit<E extends SOCKET_CLIENT_EVENTS>(
        event: E,
        data: Parameters<typeof this.eventEmitters[E]>[0]
    ) {
        this.eventEmitters[event]?.(data);
    }

    private static _onConnection(socket: Socket) {
        Object.entries(this.eventHandlers).forEach(([key, handler]) =>
            socket.on(key, (params, callback) =>
                handler.call(this, socket, params, callback))
        )
    }

    private static _onUserJoin(socket: Socket, {
        roomId,
        playerName,
        peerId,
        summonerId,
    }: {
        roomId: string;
        playerName: string;
        peerId: string;
        summonerId: string;
    }, callback?: (players: User[]) => void) {
        const room = RoomService.addPlayerToRoom(
            roomId,
            socket.id,
            playerName,
            peerId,
            summonerId
        );
        if (room) {
            socket.join(roomId);
            let players = RoomService.getRoomPlayers(roomId);
            callback?.(players)
            socket.to(roomId).emit(SOCKET_CLIENT_EVENTS.USER_JOINED, {
                id: socket.id,
                peerId,
                summonerId,
                playerName,
            });
        } else {
            socket.emit("error", { message: "Room does not exist" });
        }
    }

    private static _onUserLeave(socket: Socket, { roomId, playerName }: { roomId: string; playerName: string }) {
        RoomService.removePlayer(roomId, playerName);
        socket.leave(roomId);
    }

    private static _onDisconnect(socket: Socket) {
        const [disconnectedPlayer, roomId] = RoomService.removePlayerBySocket(
            socket.id
        );
        if (!disconnectedPlayer || !roomId) return;
        this.emit(SOCKET_CLIENT_EVENTS.USER_LEFT, { roomId, disconnectedPlayer });
    }
}

export default SocketServer;