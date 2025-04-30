import { Room, User } from "../shared/main";
import logger from "../utils/logger";

class RoomService {
  private static instance: RoomService;
  private rooms: Map<string, Room> = new Map();
  private playerToRoomMap: Map<string, string> = new Map();

  public static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
      logger.info("RoomService initialized");
    }
    return RoomService.instance;
  }

  public addPlayerToRoom(
    roomId: string,
    playerId: string,
    playerName: string,
    peerId: string,
    summonerId: string
  ) {
    try {
      let room = this.getRoom(roomId);
      const player = { id: playerId, name: playerName, peerId, summonerId };

      if (room) {
        room.players.push(player);
        logger.info("Player added to existing room", { roomId, playerName });
      } else {
        room = { id: roomId, players: [player] };
        this.rooms.set(`room:${roomId}`, room);
        logger.info("New room created with player", { roomId, playerName });
      }

      this.playerToRoomMap.set(playerId, roomId);
      return room;
    } catch (error) {
      logger.error("Error adding player to room", { roomId, playerId, error });
      return null;
    }
  }

  public removePlayer(roomId: string, playerName: string): void {
    try {
      const room = this.getRoom(roomId);
      if (room) {
        room.players = room.players.filter(
          (player) => player.name !== playerName
        );

        if (room.players.length === 0) {
          this.rooms.delete(`room:${roomId}`);
          logger.info("Room deleted after last player left", { roomId });
        } else {
          logger.info("Player removed from room", { roomId, playerName });
        }
      }
    } catch (error) {
      logger.error("Error removing player from room", {
        roomId,
        playerName,
        error,
      });
    }
  }

  public removePlayerBySocket(
    socketId: string
  ): [string | null, string | null] {
    try {
      const roomId = this.playerToRoomMap.get(socketId);
      if (!roomId) return [null, null];

      const room = this.getRoom(roomId);
      if (!room) return [null, null];

      const playerIndex = room.players.findIndex((p) => p.id === socketId);
      if (playerIndex === -1) return [null, null];

      const summonerId = room.players[playerIndex].summonerId;
      room.players.splice(playerIndex, 1);
      this.playerToRoomMap.delete(socketId);

      if (room.players.length === 0) {
        this.rooms.delete(`room:${roomId}`);
        logger.info("Room deleted after socket disconnected", { roomId });
      } else {
        logger.info("Player removed by socket ID", { roomId, socketId });
      }

      return [summonerId, roomId];
    } catch (error) {
      logger.error("Error removing player by socket", { socketId, error });
      return [null, null];
    }
  }

  public getRoomPlayers(roomId: string): User[] {
    try {
      const room = this.getRoom(roomId);
      return room?.players || [];
    } catch (error) {
      logger.error("Error getting room players", { roomId, error });
      return [];
    }
  }

  private getRoom(roomId: string): Room | null {
    const roomData = this.rooms.get(`room:${roomId}`);
    return roomData || null;
  }
}

export default RoomService.getInstance();
