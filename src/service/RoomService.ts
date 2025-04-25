import { Room, User } from "../shared/main";

class RoomService {
  private static instance: RoomService;
  private rooms: Map<string, Room> = new Map();
  private playerToRoomMap: Map<string, string> = new Map();

  public static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
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
    let room = this.getRoom(roomId);
    const player = { id: playerId, name: playerName, peerId, summonerId };

    if (room) {
      room.players.push(player);
    } else {
      room = { id: roomId, players: [player] };
      this.rooms.set(`room:${roomId}`, room);
    }

    this.playerToRoomMap.set(playerId, roomId);
    return room;
  }

  public removePlayer(roomId: string, playerName: string): void {
    const room = this.getRoom(roomId);
    if (room) {
      room.players = room.players.filter(
        (player) => player.name !== playerName
      );

      if (room.players.length === 0) {
        this.rooms.delete(`room:${roomId}`);
      }
    }
  }

  public removePlayerBySocket(
    socketId: string
  ): [string | null, string | null] {
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
    }

    return [summonerId, roomId];
  }

  public getRoomPlayers(roomId: string): User[] {
    const room = this.getRoom(roomId);
    return room?.players || [];
  }

  private getRoom(roomId: string): Room | null {
    const roomData = this.rooms.get(`room:${roomId}`);
    return roomData || null;
  }
}

export default RoomService.getInstance();
