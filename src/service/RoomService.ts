import { createClient } from "redis";
import { Room, Player} from '../interfaces/index'

class RoomService {
  private redisClient;
  private static instance: RoomService;

  private constructor() {
    this.redisClient = createClient({ url: "redis://localhost:6379" });
    this.redisClient.on("error", (err) => console.log("Redis erro:", err));
    this.redisClient.connect();
  }

  public static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  public async addPlayerToRoom(
    roomId: string,
    playerId: string,
    playerName: string,
    peerId: string
  ) {
    const room = await this.getRoom(roomId);
    if (room) {
      return room.players.push({ id: playerId, name: playerName, peerId });
    } else {
      const newRoom: Room = {
        id: roomId,
        players: [{ id: playerId, name: playerName, peerId }],
      };
      await this.saveRoom(roomId, newRoom);
      return newRoom;
    }
  }

  public async removePlayer(roomId: string, playerName: string): Promise<void> {
    const room = await this.getRoom(roomId);
    if (room) {
      room.players = room.players.filter(
        (player) => player.name !== playerName
      );

      if (room.players.length === 0) {
        await this.redisClient.del(`room:${roomId}`);
      } else {
        await this.saveRoom(roomId, room);
      }
    }
  }

  public async removePlayerBySocket(socketId: string): Promise<void> {
    const keys = await this.redisClient.keys("room:*");

    for (const key of keys) {
      const roomData = await this.redisClient.get(key);
      const room = roomData ? JSON.parse(roomData) : null;

      if (room) {
        const playerIndex = room.players.findIndex(
          (player: Player) => player.id === socketId
        );

        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);

          if (room.players.length === 0) {
            await this.redisClient.del(key);
          } else {
            await this.redisClient.set(key, JSON.stringify(room));
          }

          break;
        }
      }
    }
  }

  public async getRoomPlayers(roomId: string): Promise<Player[]> {
    const room = await this.getRoom(roomId);
    return room?.players || [];
  }

  private async getRoom(roomId: string): Promise<Room | null> {
    const roomData = await this.redisClient.get(`room:${roomId}`);
    return roomData ? JSON.parse(roomData) : null;
  }

  private async saveRoom(roomId: string, room: Room): Promise<void> {
    await this.redisClient.set(`room:${roomId}`, JSON.stringify(room));
  }
}

export default RoomService.getInstance();
