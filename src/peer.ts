import express from "express";
import { ExpressPeerServer } from "peer";

const app = express();
import cors from "cors";
import logger from "./utils/logger";

app.use(cors());
app.use(express.json());

const PORT = 3002;

app.use("/peerjs", (req, res, next) => {
  next();
});

app.get("/status", (req: express.Request, res: express.Response) => {
  res
    .status(200)
    .json({ status: "Peer ok", timestamp: new Date().toISOString() });
});

app.use("*", (req, res) => {
  logger.warn(`Rota desconhecida acessada no peer: ${req.originalUrl}`);
  res.status(404).json({ error: "Rota não encontrada", path: req.originalUrl });
});

const peerServer = ExpressPeerServer(
  app.listen(PORT, () => {
    console.log(`PeerJS Server running on http://localhost:${PORT}`);
  }),
  {
    path: "/peerjs",
  }
);

app.use("/", peerServer);
