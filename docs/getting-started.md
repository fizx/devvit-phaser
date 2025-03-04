# Getting Started with Devvit-Phaser

This guide will walk you through creating your first Phaser.js game for Reddit's Devvit platform using the devvit-phaser library.

## Prerequisites

Before you begin, make sure you have:

- Node.js 16 or higher
- npm or yarn
- A Reddit developer account
- The Devvit CLI installed (`npm install -g @devvit/cli`)

## Creating a New Project

1. Create a new Devvit project:

```bash
devvit new phaser-game
cd phaser-game
```

2. Install the required dependencies:

```bash
npm install devvit-phaser phaser
```

## Project Structure

A typical Devvit-Phaser project looks like this:

```
my-phaser-game/
├── src/
│   ├── client/                # Client-side code
│   │   ├── assets/            # Game assets
│   │   ├── scenes/            # Phaser scenes
│   │   │   └── MainScene.ts   # Main game scene
│   │   ├── index.html         # HTML entry point
│   │   ├── Game.ts            # Game configuration
│   │   └── index.ts           # Client entry point
│   ├── server/                # Server-side code
│   │   └── GameServer.ts      # Game server
│   └── main.ts                # Devvit entry point
├── devvit.yaml                # Devvit configuration
├── package.json
└── tsconfig.json
```

## Basic Implementation

### 1. Set up the main entry point

Edit `src/main.ts`:

```typescript
import { Devvit } from '@devvit/public-api';
import { GameServer } from './server/GameServer';

// Create the game server
const gameServer = new GameServer('My Phaser Game');

// Build the game (registers with Devvit)
gameServer.build();

export default Devvit;
```

### 2. Create the game server

Create `src/server/GameServer.ts`:

```typescript
import { PhaserGameServer, DataManagerServer } from 'devvit-phaser';
import { v4 as uuidv4 } from 'uuid';

export class GameServer extends PhaserGameServer {
  constructor(gameName: string) {
    super(gameName);
  }

  // Override to handle player joining
  override async onPlayerJoined(): Promise<any> {
    await super.onPlayerJoined();
    
    // Create player data
    const playerData = new DataManagerServer(this, { id: `player_${this.userId}` });
    
    // Check if player exists
    if (!(await playerData.has('initialized'))) {
      // Initialize new player
      await playerData.setAll({
        initialized: true,
        createdAt: Date.now(),
        score: 0,
        health: 100,
        position: { x: 100, y: 100 }
      });
    }
    
    // Subscribe player to their own data
    await this.subscribePlayerToDataManager(playerData);
    
    // Subscribe to global game state
    const gameState = new DataManagerServer(this, { id: 'gameState' });
    if (!(await gameState.has('initialized'))) {
      await gameState.setAll({
        initialized: true,
        startedAt: Date.now(),
        asteroids: []
      });
      
      // Start asteroid spawning
      await this.setInterval('spawn_asteroid', 2000);
    }
    
    await this.subscribePlayerToDataManager(gameState);
  }
  
  // Handle timer events
  override async onTimerEvent(event: any): Promise<void> {
    if (event.name === 'spawn_asteroid') {
      const gameState = new DataManagerServer(this, { id: 'gameState' });
      const asteroids = await gameState.get('asteroids') as any[] || [];
      
      // Limit number of asteroids
      if (asteroids.length < 10) {
        asteroids.push({
          id: uuidv4(),
          x: Math.random() * 800,
          y: 0,
          size: Math.floor(Math.random() * 3) + 1,
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: Math.random() * 2 + 1
          }
        });
        
        await gameState.set('asteroids', asteroids);
      }
    }
  }
}
```

### 3. Create the Phaser game configuration

Create `src/client/Game.ts`:

```typescript
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainScene],
  backgroundColor: '#000000'
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}
```

### 4. Create the main game scene

Create `src/client/scenes/MainScene.ts`:

```typescript
import Phaser from 'phaser';
import { SyncedDataManager } from 'devvit-phaser';

export class MainScene extends Phaser.Scene {
  playerData!: SyncedDataManager;
  gameState!: SyncedDataManager;
  
  ship!: Phaser.GameObjects.Sprite;
  asteroids: Phaser.GameObjects.Sprite[] = [];
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  
  constructor() {
    super({ key: 'MainScene' });
  }
  
  preload() {
    this.load.image('ship', 'assets/ship.png');
    this.load.image('asteroid', 'assets/asteroid.png');
  }
  
  create() {
    // Set up input
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Get player ID from global window object
    const screenId = window.me.get('screenId') as string;
    
    // Connect to player data
    this.playerData = new SyncedDataManager(`player_${screenId}`, this);
    
    // Connect to game state
    this.gameState = new SyncedDataManager('gameState', this);
    
    // Wait for player data to be ready
    this.playerData.events.once('ready', () => {
      // Create ship
      const position = this.playerData.get('position');
      this.ship = this.add.sprite(position.x, position.y, 'ship');
      
      // Add score text
      this.updateScore(this.playerData.get('score') || 0);
    });
    
    // Listen for position changes
    this.playerData.events.on('changedata-position', (_, position) => {
      if (this.ship) {
        this.ship.setPosition(position.x, position.y);
      }
    });
    
    // Listen for score changes
    this.playerData.events.on('changedata-score', (_, score) => {
      this.updateScore(score);
    });
    
    // Listen for asteroid changes
    this.gameState.events.on('changedata-asteroids', (_, asteroids) => {
      this.updateAsteroids(asteroids);
    });
  }
  
  update() {
    if (!this.ship || !this.playerData.ready) return;
    
    // Handle ship movement
    const position = this.playerData.get('position');
    let moved = false;
    
    if (this.cursors.left.isDown) {
      position.x -= 5;
      moved = true;
    }
    else if (this.cursors.right.isDown) {
      position.x += 5;
      moved = true;
    }
    
    if (this.cursors.up.isDown) {
      position.y -= 5;
      moved = true;
    }
    else if (this.cursors.down.isDown) {
      position.y += 5;
      moved = true;
    }
    
    // Keep ship on screen
    position.x = Phaser.Math.Clamp(position.x, 0, 800);
    position.y = Phaser.Math.Clamp(position.y, 0, 600);
    
    // Only update if position changed
    if (moved) {
      this.playerData.set('position', position);
    }
  }
  
  updateScore(score: number) {
    // Update score display
  }
  
  updateAsteroids(asteroidData: any[]) {
    // Update asteroid sprites based on server data
    // This would typically involve destroying old sprites and creating new ones
  }
}
```

### 5. Create the HTML entry point

Create `src/client/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Phaser Game</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    canvas {
      max-width: 100%;
      max-height: 100%;
    }
  </style>
</head>
<body>
  <div id="game"></div>
  <script type="module" src="./index.ts"></script>
</body>
</html>
```

### 6. Create the client entry point

Create `src/client/index.ts`:

```typescript
import { Game, config } from './Game';

document.addEventListener('DOMContentLoaded', () => {
  new Game(config);
});
```

## Running Your Game

1. Build and start your Devvit app:

```bash
npm run dev
```

2. In another terminal, install the app to your subreddit:

```bash
devvit install
```

3. Create a new game post in your subreddit using the menu item.

## Next Steps

- Add collision detection between the ship and asteroids
- Implement shooting mechanics
- Add sound effects and visual polish
- Create a leaderboard using a global data manager

Check out the [API Reference](./api/index.html) for more details on the available components and methods.