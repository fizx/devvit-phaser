# Devvit-Phaser 🎮

[![npm version](https://img.shields.io/npm/v/devvit-phaser.svg)](https://www.npmjs.com/package/devvit-phaser)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/fizx/devvit-phaser/actions/workflows/tests.yml/badge.svg)](https://github.com/fizx/devvit-phaser/actions/workflows/tests.yml)

A library to integrate Phaser.js with Reddit's Devvit platform for building interactive multiplayer games. This library provides a simple, yet powerful framework for creating multiplayer games with synchronized state between players.

This package also includes an MCP (Model Context Protocol) server for testing Devvit-Phaser games. See the [MCP Server](#mcp-server) section for more details.

## Installation

```bash
npm install devvit-phaser
```

## Architecture

Devvit-Phaser is built around a few core concepts:

1. **BasicGameServer** - The foundation for all multiplayer Devvit games, handling communication between players, timers, and more.

2. **PhaserGameServer** - Extends BasicGameServer with Phaser-specific functionality for game state synchronization.

3. **SyncedDataManager** - Client-side component that extends Phaser's DataManager, providing synchronized state between all players.

4. **DataManagerServer** - Server-side component that manages the persistent state in Redis and broadcasts changes to all connected players.

## Usage

### Creating a Game Server

```typescript
import { PhaserGameSrv } from 'devvit-phaser/srv';
import { Devvit } from '@devvit/public-api';

// Create a game server with your game name
const gameServer = new PhaserGameSrv('Asteroid Blaster');

// Set up custom handlers if needed
gameServer.onDataManagerSubscribe = async (subscriptions) => {
  console.log('Player subscribed to data managers', subscriptions);
  // Perform authorization checks, etc.
};

gameServer.onDataManagerMutate = async (mutation) => {
  console.log('Player mutated data manager', mutation);
  // Validate mutations if needed
};

// Override methods to handle game-specific logic
gameServer.onPlayerJoined = async () => {
  await super.onPlayerJoined(); // Call the parent method to handle basic setup
  
  // Create a player-specific data manager
  const playerData = new DataManagerSrv(this, { id: `player_${this.userId}` });
  
  // Initialize with default values
  await playerData.setAll({
    score: 0,
    health: 100,
    position: { x: 0, y: 0 }
  });
  
  // Subscribe the player to their data
  await this.subscribePlayerToDataManager(playerData);
};

// Build the game server (sets up Devvit integration)
gameServer.build();
```

### Using Synchronized Data in Phaser

```typescript
import { SyncedDataManager } from 'devvit-phaser/client';
import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  gameState: SyncedDataManager;
  playerState: SyncedDataManager;
  ship: Phaser.GameObjects.Sprite;
  
  create() {
    // Create a global game state all players can see
    this.gameState = new SyncedDataManager('gameState', this);
    
    // Create player-specific state (using the player's ID)
    const screenId = window.me.get('screenId') as string;
    this.playerState = new SyncedDataManager(`player_${screenId}`, this);
    
    // Wait for initial data
    this.playerState.events.once('ready', () => {
      // Create the player's ship
      this.ship = this.add.sprite(
        this.playerState.get('position').x, 
        this.playerState.get('position').y, 
        'ship'
      );
      
      // Update UI
      this.updateScoreDisplay(this.playerState.get('score'));
    });
    
    // Listen for changes in player data
    this.playerState.events.on('changedata-position', (_, position) => {
      // Update ship position when it changes on the server
      this.ship.setPosition(position.x, position.y);
    });
    
    // Listen for changes in game state
    this.gameState.events.on('changedata-asteroids', (_, asteroids) => {
      // Update asteroid positions when they change
      this.updateAsteroids(asteroids);
    });
    
    // Handle ship movement
    this.input.keyboard.on('keydown-W', () => {
      const position = this.playerState.get('position');
      position.y -= 10;
      // This will sync to other players automatically
      this.playerState.set('position', position);
    });
  }
  
  increaseScore(points: number) {
    // Increment the score (synchronized to server and other players)
    this.playerState.inc('score', points);
  }
  
  updateScoreDisplay(score: number) {
    // Update UI based on score changes
  }
  
  updateAsteroids(asteroids: any[]) {
    // Update asteroid display based on server data
  }
}
```

## Advanced Features

### Timers and Scheduled Events

The PhaserGameServer includes reliable timer functions that persist even through server restarts:

```typescript
// One-time event after 5 seconds
gameServer.setTimeout('respawn_player', 5000, { playerId: '12345' });

// Recurring event every 1 second
gameServer.setInterval('spawn_asteroid', 1000);

// Handle timer events
gameServer.onTimerEvent = async (event) => {
  if (event.name === 'spawn_asteroid') {
    const asteroidData = new DataManagerSrv(this, { id: 'asteroids' });
    const asteroids = await asteroidData.get('list') || [];
    
    asteroids.push({
      id: v4(),
      x: Math.random() * 800,
      y: 0,
      size: Math.floor(Math.random() * 3) + 1
    });
    
    await asteroidData.set('list', asteroids);
  }
};
```

### Player Management

Track players joining and leaving:

```typescript
gameServer.onPlayerJoined = async () => {
  await super.onPlayerJoined();
  
  // Get the list of active players
  const playersData = new DataManagerSrv(this, { id: 'players' });
  const players = await playersData.get('active') || [];
  
  // Add the new player
  players.push({
    id: this.userId,
    name: this.userInfo.username,
    joinedAt: Date.now()
  });
  
  await playersData.set('active', players);
  await this.broadcast(this.postId, { 
    type: 'PLAYER_JOINED', 
    player: this.userInfo 
  });
};
```

## MCP Server

Devvit-Phaser includes an MCP (Model Context Protocol) server that facilitates testing of Devvit-Phaser games. This server allows AI assistants and other MCP clients to control browser testing and manage Devvit playtest environments.

### Features

- 🌐 **Browser Testing**: Launch, navigate, and interact with web browsers
- 🚀 **Devvit Playtest**: Start, monitor, and manage Devvit playtest environments
- 📊 **Log Access**: Stream and query Devvit playtest logs

### Running the MCP Server

You can run the MCP server in two ways:

#### Option 1: Global Installation

```bash
# Install devvit-phaser globally
npm install -g devvit-phaser

# When upgrading, uninstall first to avoid conflicts
# npm uninstall -g devvit-phaser
# npm install -g devvit-phaser

# Run the MCP server from anywhere
devvit-phaser-mcp
```

#### Option 2: From the Repository

```bash
# Install dependencies and build
npm run build:mcp

# Start the server
npm run start:mcp
```

The server communicates via stdio, making it compatible with any MCP client.

### Resources and Tools

The MCP server provides:

- Resources for checking browser and playtest status
- Tools for browser automation (launch, navigate, interact)
- Tools for managing Devvit playtest (start, restart, stop)

For more details, see the [MCP README](./mcp/README.md).

## License

MIT