import express from "express";
import http from "http";
import cors from "cors";
import SocketServer from "./controller/socket";

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

SocketServer.init(server)

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
