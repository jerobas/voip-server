import RoomService from "../service/RoomService";
jest.mock("../utils/logger.ts");

describe("RoomService", () => {
  beforeEach(() => {
    // @ts-ignore
    RoomService["instance"] = undefined;
  });

  it("should create a new room with a player", () => {
    const service = RoomService;
    const room = service.addPlayerToRoom(
      "room1",
      "player1",
      "John",
      "peer1",
      "summ1"
    );

    expect(room?.id).toBe("room1");
    expect(room?.players.length).toBe(1);
    expect(room?.players[0].name).toBe("John");
  });

  it("should add a second player to the same room", () => {
    const service = RoomService;
    service.addPlayerToRoom("room2", "player1", "Alice", "peer1", "sum1");
    const room = service.addPlayerToRoom(
      "room2",
      "player2",
      "Bob",
      "peer2",
      "sum2"
    );

    expect(room?.players.length).toBe(2);
    expect(room?.players[1].name).toBe("Bob");
  });

  it("should remove a player by name", () => {
    const service = RoomService;
    service.addPlayerToRoom("room3", "player1", "Carlos", "peer1", "sum1");
    service.removePlayer("room3", "Carlos");
    const roomPlayers = service.getRoomPlayers("room3");

    expect(roomPlayers.length).toBe(0);
  });

  it("should remove player by socket ID and delete room if last player", () => {
    const service = RoomService;
    service.addPlayerToRoom("room4", "sock1", "Danny", "peer1", "summ4");
    const [summonerId, roomId] = service.removePlayerBySocket("sock1");

    expect(summonerId).toBe("summ4");
    expect(roomId).toBe("room4");
    expect(service.getRoomPlayers("room4").length).toBe(0);
  });

  it("should get empty array for unknown room", () => {
    const service = RoomService;
    const players = service.getRoomPlayers("unknown");
    expect(players).toEqual([]);
  });

  afterEach(() => {
    // @ts-ignore
    RoomService["instance"] = undefined;
  });
});
