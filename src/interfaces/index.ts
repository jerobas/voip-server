export interface Player {
  id: string;
  name: string;
  peerId: string;
  summonerId: string;
}

export interface Room {
  id: string;
  players: Player[];
}