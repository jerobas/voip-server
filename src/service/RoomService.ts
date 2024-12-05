interface Room {
  id: string;
  players: Array<{ id: string; name: string; peerId: string }>;
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

  public addPlayerToRoom(
    roomId: string,
    playerId: string,
    playerName: string,
    peerId: string
  ) {
    const room = this.rooms.get(roomId);
    if (room) {
      return room.players.push({ id: playerId, name: playerName, peerId });
    } else {
      return this.rooms.set(roomId, {
        id: roomId,
        players: [{ id: playerId, name: playerName, peerId }],
      });
    }
  }

  public removePlayer(roomID: string, playerName: string): void {
    const room = this.rooms.get(roomID);
    if (room) {
      room.players = room.players.filter(
        (player) => player.name !== playerName
      );

      if (room.players.length === 0) {
        this.rooms.delete(roomID);
      }
    }
  }

  public getRoomPlayers(
    roomId: string
  ): Array<{ id: string; name: string; peerId: string }> {
    return this.rooms.get(roomId)?.players || [];
  }
}

export default RoomService.getInstance();
