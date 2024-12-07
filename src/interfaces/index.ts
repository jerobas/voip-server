export interface Player {
    id: string;
    name: string;
    peerId: string;
  }
  
export interface Room {
    id: string;
    players: Player[];
}