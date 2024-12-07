import express from "express";
import { ExpressPeerServer } from "peer";

const app = express();
import cors from "cors";

app.use(cors());
app.use(express.json());

const PORT = 3002;

app.use("/peerjs", (req, res, next) => {
  next();
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
