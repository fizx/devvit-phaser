import { PhaserGameServer, hi } from "./lib/server/PhaserGameServer.js";
hi();

const server = new PhaserGameServer("Asteroids");

export default server.build();
