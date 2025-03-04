[devvit-phaser - v0.1.0](README.md) / Exports

# devvit-phaser - v0.1.0

## Table of contents

### Classes

- [SyncedDataManager](classes/SyncedDataManager.md)
- [BasicGameServer](classes/BasicGameServer.md)
- [DataManagerServer](classes/DataManagerServer.md)
- [PhaserGameServer](classes/PhaserGameServer.md)

### Type Aliases

- [PostInfo](modules.md#postinfo)
- [UserInfo](modules.md#userinfo)
- [TimerEvent](modules.md#timerevent)
- [BroadcastMessage](modules.md#broadcastmessage)
- [DataManagerId](modules.md#datamanagerid)
- [DataManagerMutation](modules.md#datamanagermutation)
- [DataManagerSubscription](modules.md#datamanagersubscription)

## Type Aliases

### PostInfo

Ƭ **PostInfo**: `Object`

Represents a Devvit post in the context of a game.

This is a simplified version of a Reddit Post. For more comprehensive post data,
you should use the Reddit API Client.

**`Example`**

```typescript
const post: PostInfo = { postId: "t3_abc123" };
```

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `postId` | `string` | The Reddit post ID (t3_XXXXX format) |

#### Defined in

[core/types.ts:14](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/types.ts#L14)

___

### UserInfo

Ƭ **UserInfo**: `Object`

Represents a user in the context of a Devvit game.

This is a simplified version of a Reddit User. For more comprehensive user data,
you should use the Reddit API Client.

**`Example`**

```typescript
const user: UserInfo = {
  userId: "t2_abc123",
  username: "RedditUser123",
  screenId: "unique-session-id"
};
```

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `userId` | `string` | The Reddit user ID (t2_XXXXX format) |
| `username` | `string` | The Reddit username |
| `screenId` | `string` | A unique ID for the specific app instance. If the user refreshes the page, they'll get a new screenId. |

#### Defined in

[core/types.ts:34](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/types.ts#L34)

___

### TimerEvent

Ƭ **TimerEvent**: `Object`

Represents a scheduled timer event in the game.

Timer events can be one-time events or recurring intervals.
They are persisted in Redis and survive server restarts.

**`Example`**

```typescript
// One-time event
const event: TimerEvent = {
  postId: "t3_abc123",
  name: "respawn_player",
  id: "unique-uuid",
  data: { playerId: "t2_xyz789" }
};

// Recurring event
const interval: TimerEvent = {
  postId: "t3_abc123",
  name: "spawn_asteroid",
  id: "unique-uuid",
  interval: 1000, // milliseconds
  data: { maxAsteroids: 10 }
};
```

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `postId` | `string` | The Reddit post ID where this timer belongs |
| `name` | `string` | A name to identify the timer type Used for event handling logic |
| `id` | `string` | Unique identifier for this specific timer instance |
| `interval?` | `number` | If present, makes the timer recurring with this interval (in milliseconds) If not present, the timer fires only once |
| `data?` | `JSONValue` | Optional data to associate with the timer event This is passed to the onTimerEvent handler |

#### Defined in

[core/types.ts:74](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/types.ts#L74)

___

### BroadcastMessage

Ƭ **BroadcastMessage**: `Object`

Represents a message broadcast through the realtime system.

BroadcastMessages are sent via channels (usually the postId) to all
subscribed players.

**`Example`**

```typescript
const message: BroadcastMessage = {
  from: userInfo,
  channel: "t3_abc123",
  data: { type: "MOVE", playerId: "t2_xyz789", position: { x: 100, y: 200 } }
};
```

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `from` | [`UserInfo`](modules.md#userinfo) | The user who sent the message |
| `channel` | `string` | The channel this message was sent on Typically this is the postId, but you can create your own channels |
| `data` | `any` | The payload of the message Can be any serializable data |

#### Defined in

[core/types.ts:115](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/types.ts#L115)

___

### DataManagerId

Ƭ **DataManagerId**: `Object`

Identifies a DataManager instance uniquely within the game.

Each DataManager (client or server) has a unique ID that can be used
to synchronize state between clients and the server.

**`Example`**

```typescript
// A game-specific data manager
const gameStateId: DataManagerId = { id: "gameState" };

// A player-specific data manager
const playerStateId: DataManagerId = { id: `player_${userId}` };

// A global data manager (shared across all posts)
const globalHighScoresId: DataManagerId = { 
  id: "global_high_scores",
  isGlobal: true
};
```

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `isGlobal?` | `boolean` | If true, this data manager is global across all posts. If false or undefined, this data manager is specific to a single post. |
| `id` | `string` | The unique identifier for this data manager. Should be descriptive of its purpose. |

#### Defined in

[types.ts:24](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/types.ts#L24)

___

### DataManagerMutation

Ƭ **DataManagerMutation**: `Object`

Represents a batch of changes to a DataManager.

Mutations are sent from clients to the server or from the server to clients
to keep all data managers synchronized.

**`Example`**

```typescript
// Setting values
const setMutation: DataManagerMutation = {
  dataManagerId: { id: "gameState" },
  updates: { 
    score: 100,
    level: 5,
    gameActive: true
  }
};

// Deleting values
const deleteMutation: DataManagerMutation = {
  dataManagerId: { id: "player_123" },
  deletes: ["powerup", "shield"]
};

// Incrementing values
const incrementMutation: DataManagerMutation = {
  dataManagerId: { id: "player_123" },
  increments: { score: 10, lives: -1 }
};
```

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `dataManagerId` | [`DataManagerId`](modules.md#datamanagerid) | The data manager this mutation applies to |
| `updates?` | \{ `[key: string]`: `JSONValue`;  } | Key-value pairs to set in the data manager. These will overwrite existing values. |
| `deletes?` | `string`[] | Keys to remove from the data manager. |
| `increments?` | \{ `[key: string]`: `number`;  } | Key-value pairs to increment in the data manager. The values are the amount to increment by (can be negative). |

#### Defined in

[types.ts:69](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/types.ts#L69)

___

### DataManagerSubscription

Ƭ **DataManagerSubscription**: `Object`

Used to subscribe or unsubscribe to data manager changes.

When a client connects, it subscribes to data managers it wants to sync with.
The server then sends initial data and keeps the client updated with changes.

**`Example`**

```typescript
// Subscribing to data managers
const subscription: DataManagerSubscription = {
  add: [
    { id: "gameState" },
    { id: `player_${userId}` }
  ]
};

// Unsubscribing from data managers
const unsubscription: DataManagerSubscription = {
  remove: [{ id: "temporaryEvent" }]
};
```

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `add?` | [`DataManagerId`](modules.md#datamanagerid)[] | Data managers to subscribe to |
| `remove?` | [`DataManagerId`](modules.md#datamanagerid)[] | Data managers to unsubscribe from |

#### Defined in

[types.ts:113](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/types.ts#L113)
