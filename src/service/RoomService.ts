interface Room {
  id: string;
  players: Array<{ id: string; name: string }>;
}

class RoomService {
  private static instance: RoomService;
  private rooms: Map<string, Room>;

  private constructor() {
    this.rooms = new Map<string, Room>();
  }

  public static getInstance(): RoomService {
    if (!RoomService.instance) {
      RoomService.instance = new RoomService();
    }
    return RoomService.instance;
  }

  public createRoom(roomId: string): Room {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { id: roomId, players: [] });
    }
    return this.rooms.get(roomId)!;
  }

  public addPlayerToRoom(roomId: string, playerId: string, playerName: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players.push({ id: playerId, name: playerName });
      return room;
    }
    return null;
  }

  public removePlayerFromRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players = room.players.filter((player) => player.id !== playerId);
      if (room.players.length === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  public getRoomPlayers(roomId: string): Array<{ id: string; name: string }> {
    return this.rooms.get(roomId)?.players || [];
  }
}

export default RoomService.getInstance();
