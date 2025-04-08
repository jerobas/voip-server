import { Room, Player } from '../interfaces/index'

class RoomService {
  private static instance: RoomService;
  private rooms: Map<string, Room> = new Map();

  private constructor() {
    // setInterval(() => {
    //   console.log(this.rooms)
    // }, 1000);
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
    peerId: string,
    summonerId: string
  ) {
    const room = this.getRoom(roomId);
    if (room) {
      const updatedRoom = room.players.push({ id: playerId, name: playerName, peerId, summonerId });
      return updatedRoom;
    } else {
      const newRoom: Room = {
        id: roomId,
        players: [{ id: playerId, name: playerName, peerId, summonerId }],
      };
      this.rooms.set(`room:${roomId}`, newRoom);
      return newRoom;
    }
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

  public removePlayerBySocket(socketId: string): [string | null, string | null] {
    let disconnectedPlayer, roomId;

    this.rooms.forEach((room: Room, key: string) => {
      const playerIndex = room.players.findIndex(
        (player: Player) => player.id === socketId
      );

      if (playerIndex !== -1) {
        disconnectedPlayer = room.players[playerIndex].summonerId;
        roomId = room.id;
        room.players.splice(playerIndex, 1);

        if (room.players.length === 0) {
          this.rooms.delete(`room:${room.id}`);
        }
      }
    });

    return [disconnectedPlayer || null, roomId || null];
  }

  public getRoomPlayers(roomId: string): Player[] {
    const room = this.getRoom(roomId);
    return room?.players || [];
  }

  private getRoom(roomId: string): Room | null {
    const roomData = this.rooms.get(`room:${roomId}`);
    return roomData || null;
  }
}

export default RoomService.getInstance();
