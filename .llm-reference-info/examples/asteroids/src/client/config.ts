import Phaser from "phaser";
import { MainScene } from "./scenes/MainScene";

// src/config.ts
export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "game-container",
    width: window.innerWidth * (1 / window.devicePixelRatio),
    height: window.innerHeight * (1 / window.devicePixelRatio),
    autoRound: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false, // Let's see the physics boundaries
    },
  },
  scene: MainScene,
};
