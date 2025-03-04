# Understanding Data Flow in Devvit-Phaser

This guide explains how data flows between clients and the server in the Devvit-Phaser architecture.

## Architecture Overview

Devvit-Phaser uses a synchronized data model that keeps all clients updated with the latest game state. The key components of this architecture are:

```
                    ┌────────────────────────────────────┐
                    │           Redis Database           │
                    │ (Persistent Storage for Game Data) │
                    └───────────────┬────────────────────┘
                                    │
                                    │ Read/Write
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                             Devvit Server                                │
│                                                                          │
│  ┌──────────────────────┐         ┌─────────────────────────────────┐   │
│  │    PhaserGameServer  │         │       DataManagerServer         │   │
│  │                      │ Creates │ (Manages Data & Subscriptions)  │   │
│  │ (Handles Game Logic) ├────────►│                                 │   │
│  └──────────┬───────────┘         └─────────────────┬───────────────┘   │
│             │                                       │                    │
│             │ Player Events                         │ Data Mutations     │
│             │                                       │                    │
└─────────────┼───────────────────────────────────────┼────────────────────┘
              │                                       │
              │                                       │
              ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                               Realtime                                  │
│                    (Websocket Communication Layer)                      │
└─────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  │ Messages
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                             Client Browser                               │
│                                                                          │
│  ┌───────────────────┐            ┌────────────────────────────────┐    │
│  │    Phaser Game    │            │      SyncedDataManager         │    │
│  │                   │◄───────────┤  (Syncs with Server State)     │    │
│  │ (Renders & Input) │   Updates  │                                │    │
│  └───────────────────┘            └────────────────────────────────┘    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Steps

1. **Initialization**:
   - When a player joins, the `PhaserGameServer` creates `DataManagerServer` instances for:
     - Game-wide state (shared by all players)
     - Player-specific state (unique to each player)
   - The server subscribes the player to these data managers

2. **Client Connection**:
   - The client creates `SyncedDataManager` instances that match the server's data managers
   - The client sends subscription requests to the server
   - The server sends the current state of each data manager to the client

3. **Player Actions**:
   - A player performs an action (e.g., moves their character)
   - The Phaser game calls `SyncedDataManager.set()` to update a value
   - The `SyncedDataManager` sends a mutation message to the server
   - The client's local data is updated immediately

4. **Server Processing**:
   - The server receives the mutation
   - The `PhaserGameServer` validates the mutation (optional)
   - The `DataManagerServer` updates the data in Redis
   - The server broadcasts the mutation to all subscribed clients

5. **Client Updates**:
   - Other clients receive the mutation
   - Their local `SyncedDataManager` applies the mutation
   - The Phaser `changedata` event is triggered
   - Handlers update the game display based on the new data

## Data Manager Types

### 1. Player-Specific Data Managers

Each player has their own data manager for things like:
- Position and movement
- Health and status
- Score and achievements
- Input state

This data is typically only modified by the owning player but may be read by others.

```typescript
// Server side - Creating player data
const playerData = new DataManagerServer(gameServer, { 
  id: `player_${userId}` 
});

// Client side - Connecting to your own data
const myData = new SyncedDataManager(`player_${myId}`, this);
```

### 2. Game-Wide Data Managers

Shared data that affects all players, such as:
- World state
- Environment objects
- NPC positions
- Match status

This data is typically controlled by the server or game logic.

```typescript
// Server side - Creating game state
const gameState = new DataManagerServer(gameServer, { 
  id: 'gameState' 
});

// Client side - Connecting to game state
const gameState = new SyncedDataManager('gameState', this);
```

### 3. Global Data Managers (Across Posts)

Data that persists beyond a single game instance:
- High scores
- Player statistics
- Unlocked achievements

```typescript
// Server side - Creating global data
const highScores = new DataManagerServer(gameServer, { 
  id: 'highScores',
  isGlobal: true
});

// Client side - Connecting to global data
const highScores = new SyncedDataManager({ 
  id: 'highScores',
  isGlobal: true 
}, this);
```

## Optimizing Data Flow

### Batch Updates

When making multiple changes, batch them to reduce network traffic:

```typescript
// Instead of:
playerData.set('health', 90);
playerData.set('shield', 50);
playerData.set('ammo', 25);

// Do this:
const updates = {
  health: 90,
  shield: 50,
  ammo: 25
};
await dataManager.setAll(updates);
```

### Throttle Updates

For rapidly changing values like positions during movement, throttle updates:

```typescript
// In your update loop
update() {
  this.updateCounter = (this.updateCounter || 0) + 1;
  
  // Only send position updates every 3 frames
  if (this.updateCounter % 3 === 0) {
    this.playerData.set('position', {
      x: this.ship.x,
      y: this.ship.y
    });
  }
}
```

### Data Structure Design

Organize your data for efficient updates:

```typescript
// Bad: Requires sending the entire array for one asteroid change
gameState.set('asteroids', asteroids);

// Better: Using IDs as keys for individual updates
gameState.set(`asteroids.${asteroidId}.position`, { x: 100, y: 200 });
```

## Events and Reactions

The `SyncedDataManager` extends Phaser's `DataManager`, providing the same event system:

```typescript
// Listen for any data change
playerData.events.on('changedata', (parent, key, value, prev) => {
  console.log(`Data changed: ${key} from ${prev} to ${value}`);
});

// Listen for a specific value change
playerData.events.on('changedata-health', (parent, value, prev) => {
  if (value < prev) {
    this.playDamageAnimation();
  }
});

// One-time event when data is first loaded
playerData.events.once('ready', () => {
  this.initializePlayer();
});
```

## Conclusion

The Devvit-Phaser data flow architecture provides a seamless way to create multiplayer games where all clients stay in sync with minimal code. By understanding how data moves between clients and the server, you can optimize your game's performance and create responsive multiplayer experiences.