# VoIP Backend Server

Este projeto é o backend de um sistema de comunicação via WebRTC, utilizando `Socket.IO`, `PeerJS` e `Express`. Ele gerencia salas de voz, adiciona e remove jogadores, e emite eventos em tempo real. O sistema também possui logging com Loki e Winston.

## 🧱 Tecnologias Utilizadas

- Node.js
- TypeScript
- Express
- Socket.IO
- PeerJS
- Winston + Loki
- CORS
- HTTP

## 📁 Estrutura do Projeto

```
├── controller/
│   └── socket.ts        # Gerencia conexões e eventos WebSocket
├── service/
│   └── RoomService.ts   # Gerenciamento de salas e jogadores
├── shared/
│   └── main.ts          # Tipagens e enums compartilhados
├── utils/
│   └── logger.ts        # Logger configurado com Loki
├── peer.ts              # Servidor PeerJS
├── server.ts            # Servidor principal com Socket.IO
```

## 🚀 Como Executar

### 1. Clonar o projeto

```bash
git clone https://github.com/seu-usuario/voip-backend.git
cd voip-backend
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar em modo desenvolvimento

```bash
npm run dev
```

Isso iniciará tanto o servidor Socket quanto o PeerJS.

### 4. Rodar build para produção

```bash
npm run build
```

### 5. Iniciar servidor de produção

```bash
node dist/server.js
```

## 🌐 Endpoints

### Socket Server (porta 3001)

- `GET /status`: Retorna o status do servidor de sockets
- `*`: Qualquer rota não reconhecida retorna 404 e é registrada no Loki

### Peer Server (porta 3002)

- `GET /status`: Retorna o status do servidor PeerJS
- `*`: Qualquer rota não reconhecida retorna 404 e é registrada no Loki

## ⚙️ Logging

Todos os logs são enviados ao Loki na URL configurada (`http://localhost:3100`), com labels específicas para cada evento.

## 🔐 CORS

Habilitado globalmente com suporte para métodos `GET` e `POST` de qualquer origem.

## 🧪 Eventos de Socket.IO

### Eventos recebidos (Server)

- `USER_JOIN`
- `USER_LEAVE`
- `DISCONNECT`

### Eventos emitidos (Client)

- `USER_JOINED`
- `USER_LEFT`

## 📦 Scripts disponíveis

```json
"scripts": {
  "socket": "ts-node-dev --respawn --transpile-only src/server.ts",
  "peerjs": "ts-node-dev --respawn --transpile-only src/peer.ts",
  "dev": "concurrently \"npm run peerjs\" \"npm run socket\"",
  "build": "tsc"
}
```

---

## 📄 Licença

Este projeto está licenciado sob os termos da licença MIT.