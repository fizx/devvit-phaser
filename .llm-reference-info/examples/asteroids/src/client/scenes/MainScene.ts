import { Asteroid } from "../objects/Asteroid";
import { Ship } from "../objects/Ship";
import { SyncedDataManager } from "../../lib/client/SyncedDataManager";

export class MainScene extends Phaser.Scene {
  private player!: Ship;
  private asteroids!: Phaser.GameObjects.Group;
  private otherPlayers: Map<string, Ship> = new Map();

  private readonly RECENT_THRESHOLD = 15000; // 15 seconds
  private readonly TURN_SPEED = 6;
  private readonly THRUST = 800;
  private readonly DRAG = 0.98;
  private readonly MAX_SPEED = 300;
  private readonly BOUNCE_FACTOR = 0.5;

  private playersSync?: SyncedDataManager;
  private asteroidsSync?: SyncedDataManager;

  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    this.physics.world.setFPS(60);
    this.cameras.main.setBackgroundColor("#000000");
    this.data.set("name", "mark");

    // Initialize sync managers
    this.playersSync = new SyncedDataManager("players", this);
    this.asteroidsSync = new SyncedDataManager("asteroids", this);

    console.log("attaching to me", window.me);

    const setUsername = () => {
      const screenId = window.me?.get("screenId") as string | undefined;
      if (screenId) {
        this.player.setUsername(this.playersSync?.get(screenId)?.username);
      }
    };
    window.me.events.on(Phaser.Data.Events.SET_DATA, setUsername);
    this.events.on("ready", setUsername);

    const border = this.add.graphics({
      lineStyle: { width: 2, color: 0xffffff },
    });
    border.strokeRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // Create player
    this.player = new Ship(this, this.scale.width / 2, this.scale.height / 2);
    this.player.body.setCircle(15);
    this.player.body.setBounce(this.BOUNCE_FACTOR);
    this.player.body.setDrag(this.DRAG);
    this.player.body.setMaxVelocity(this.MAX_SPEED);
    this.player.angle = -90;

    // Create asteroids group
    this.asteroids = this.add.group();

    // Setup asteroid sync events
    this.asteroidsSync.events.on("ready", (dm: SyncedDataManager) => {
      if (dm.id.id !== "asteroids") return;
      const savedAsteroids = this.asteroidsSync?.get("positions");
      console.log("asteroids ready", savedAsteroids);
      if (!savedAsteroids || savedAsteroids.length === 0) {
        console.log("creating initial asteroids");
        this.createInitialAsteroids();
      } else {
        console.log("syncing asteroids", savedAsteroids);
        this.syncAsteroids(savedAsteroids);
      }
    });

    this.asteroidsSync.events.on("change", (key: string, value: any) => {
      if (key === "positions" && value && value.length > 0) {
        this.syncAsteroids(value);
      }
    });

    this.playersSync?.events.on("ready", (dm: SyncedDataManager) => {
      if (dm.id.id !== "players") return;
      this.playersSync?.each((_parent, key, value) => {
        this.maybeUpdate(key, value);
      });
    });

    // Setup player sync events
    this.playersSync.events.on(
      Phaser.Data.Events.CHANGE_DATA,
      (_parent: typeof this, key: string, value: any) => {
        console.log("maybe update", key, value);
        if (key === window.me?.get("screenId")) return; // Skip our own updates
        this.maybeUpdate(key, value);
      }
    );

    this.playersSync.events.on(
      Phaser.Data.Events.SET_DATA,
      (_parent: typeof this, key: string, value: any) => {
        console.log("maybe update", key, value);
        if (key === window.me?.get("screenId")) return; // Skip our own updates
        this.maybeUpdate(key, value);
      }
    );

    this.physics.add.collider(this.player, this.asteroids);
    this.input.on("pointerdown", this.handleClick, this);
  }
  private maybeUpdate(key: string, value: any) {
    const currentTime = Date.now();
    if (value && currentTime - value.t < this.RECENT_THRESHOLD) {
      this.updateOtherPlayer(key, value);
    } else {
      this.removePlayer(key);
    }
  }

  private createInitialAsteroids() {
    const asteroidData = [];
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, this.scale.width - 50);
      const y = Phaser.Math.Between(50, this.scale.height - 50);
      const asteroidInfo = {
        x,
        y,
        angle: 0,
        id: Math.random().toString(36).substr(2, 9),
      };
      asteroidData.push(asteroidInfo);
      this.createAsteroid(asteroidInfo);
    }

    this.asteroidsSync?.set("positions", asteroidData);
  }

  private createAsteroid(data: {
    x: number;
    y: number;
    angle: number;
    id: string;
  }) {
    const asteroid = new Asteroid(this, data.x, data.y);
    asteroid.setAngle(data.angle);
    asteroid.setData("id", data.id);
    asteroid.body.setCircle(20);
    asteroid.body.setImmovable(true);
    this.asteroids.add(asteroid);
    return asteroid;
  }

  private syncAsteroids(
    positions: Array<{ x: number; y: number; angle: number; id: string }>
  ) {
    // Remove all existing asteroids
    this.asteroids.clear(true, true);

    // Create new asteroids from sync data
    positions.forEach((pos) => {
      this.createAsteroid(pos);
    });
  }

  private updateOtherPlayer(id: string, data: any) {
    let otherPlayer = this.otherPlayers.get(id);

    if (!otherPlayer) {
      // Create new player with full physics
      otherPlayer = new Ship(this, data.x, data.y);
      otherPlayer.body.setCircle(15);
      otherPlayer.body.setBounce(this.BOUNCE_FACTOR);
      otherPlayer.body.setDrag(this.DRAG);
      otherPlayer.body.setMaxVelocity(this.MAX_SPEED);
      otherPlayer.setUsername(data.username);
      this.otherPlayers.set(id, otherPlayer);

      // Add collision with asteroids
      this.physics.add.collider(otherPlayer, this.asteroids);
    }

    // Update position, angle and velocity
    otherPlayer.setPosition(data.x, data.y);
    otherPlayer.setAngle(data.angle);
    otherPlayer.body.setVelocity(data.dx, data.dy);
  }

  private removePlayer(id: string) {
    const player = this.otherPlayers.get(id);
    if (player) {
      player.destroy();
      this.otherPlayers.delete(id);
    }
  }

  private handleClick(pointer: Phaser.Input.Pointer) {
    console.log(window.me?.get("screenId"));
    const targetAngle = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      pointer.x,
      pointer.y
    );

    const targetDegrees = Phaser.Math.RadToDeg(targetAngle);
    const angleDiff = Phaser.Math.Angle.ShortestBetween(
      this.player.angle,
      targetDegrees
    );

    const absAngleDiff = Math.abs(angleDiff);

    this.player.angle += Math.sign(angleDiff) * this.TURN_SPEED;

    if (absAngleDiff < 45) {
      const rad = Phaser.Math.DegToRad(this.player.angle);
      this.player.body.velocity.x += Math.cos(rad) * this.THRUST * 0.016;
      this.player.body.velocity.y += Math.sin(rad) * this.THRUST * 0.016;
    } else if (absAngleDiff > 135) {
      const rad = Phaser.Math.DegToRad(this.player.angle);
      this.player.body.velocity.x -= Math.cos(rad) * this.THRUST * 0.016;
      this.player.body.velocity.y -= Math.sin(rad) * this.THRUST * 0.016;
    }
    this.playersSync?.set(window.me?.get("screenId"), {
      x: this.player.x,
      y: this.player.y,
      angle: this.player.angle,
      dx: this.player.body.velocity.x,
      dy: this.player.body.velocity.y,
      t: Date.now(),
      username: this.player.usernameText.text,
    });
  }

  update() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Screen wrapping for main player
    if (
      this.player.x < 0 ||
      this.player.x > width ||
      this.player.y < 0 ||
      this.player.y > height
    ) {
      // Save velocity
      const velocityX = this.player.body.velocity.x;
      const velocityY = this.player.body.velocity.y;

      // Calculate new position
      let newX = this.player.x;
      let newY = this.player.y;

      if (this.player.x < 0) newX = width;
      if (this.player.x > width) newX = 0;
      if (this.player.y < 0) newY = height;
      if (this.player.y > height) newY = 0;

      // Set new position and restore velocity
      this.player.setPosition(newX, newY);
      this.player.body.reset(newX, newY);
      this.player.body.setVelocity(velocityX, velocityY);
    }

    // Remove stale players
    const currentTime = Date.now();
    this.otherPlayers.forEach((player, id) => {
      const playerData = this.playersSync?.get(id);
      if (!playerData || currentTime - playerData.t >= this.RECENT_THRESHOLD) {
        this.removePlayer(id);
      }
    });

    // Screen wrapping for other players
    this.otherPlayers.forEach((otherPlayer) => {
      if (
        otherPlayer.x < 0 ||
        otherPlayer.x > width ||
        otherPlayer.y < 0 ||
        otherPlayer.y > height
      ) {
        // Save velocity
        const velocityX = otherPlayer.body.velocity.x;
        const velocityY = otherPlayer.body.velocity.y;

        // Calculate new position
        let newX = otherPlayer.x;
        let newY = otherPlayer.y;

        if (otherPlayer.x < 0) newX = width;
        if (otherPlayer.x > width) newX = 0;
        if (otherPlayer.y < 0) newY = height;
        if (otherPlayer.y > height) newY = 0;

        // Set new position and restore velocity
        otherPlayer.setPosition(newX, newY);
        otherPlayer.body.reset(newX, newY);
        otherPlayer.body.setVelocity(velocityX, velocityY);
      }
    });

    // Update asteroids rotation
    const currentState = this.asteroids.getChildren().map((asteroid: any) => {
      asteroid.angle += 0.2;
      return {
        x: asteroid.x,
        y: asteroid.y,
        angle: asteroid.angle,
        id: asteroid.getData("id"),
      };
    });
  }
}
