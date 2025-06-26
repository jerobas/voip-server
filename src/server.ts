import express from "express";
import http from "http";
import cors from "cors";
import SocketServer from "./controller/socket";
import LokiLogger from "logger";

const logger = new LokiLogger({
  jobName: "voip-backend-server",
}).getLogger();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

SocketServer.init(server);

app.get("/status", (req: express.Request, res: express.Response) => {
  res
    .status(200)
    .json({ status: "Socket ok", timestamp: new Date().toISOString() });
});

app.use("*", (req, res) => {
  logger.warn(`Rota desconhecida acessada no socket: ${req.originalUrl}`);
  res.status(404).json({ error: "Rota não encontrada", path: req.originalUrl });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
