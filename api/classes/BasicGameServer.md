[devvit-phaser - v0.1.0](../README.md) / [Exports](../modules.md) / BasicGameServer

# Class: BasicGameServer

This is a basic game server that can be used to create a simple game. Many of the methods are overridable so you can
customize the behavior of the game server. Look at the specific method documentation for more information.

## Hierarchy

- **`BasicGameServer`**

  ↳ [`PhaserGameServer`](PhaserGameServer.md)

## Table of contents

### Constructors

- [constructor](BasicGameServer.md#constructor)

### Properties

- [subscriptions](BasicGameServer.md#subscriptions)
- [setSubscriptions](BasicGameServer.md#setsubscriptions)
- [context](BasicGameServer.md#context)
- [\_userInfo](BasicGameServer.md#_userinfo)

### Accessors

- [redis](BasicGameServer.md#redis)
- [reddit](BasicGameServer.md#reddit)
- [userId](BasicGameServer.md#userid)
- [postId](BasicGameServer.md#postid)
- [userInfo](BasicGameServer.md#userinfo)

### Methods

- [onPostCreated](BasicGameServer.md#onpostcreated)
- [onWebviewMessage](BasicGameServer.md#onwebviewmessage)
- [onReceive](BasicGameServer.md#onreceive)
- [onPlayerJoined](BasicGameServer.md#onplayerjoined)
- [broadcast](BasicGameServer.md#broadcast)
- [sendToCurrentPlayerWebview](BasicGameServer.md#sendtocurrentplayerwebview)
- [subscribePlayer](BasicGameServer.md#subscribeplayer)
- [onTimerEvent](BasicGameServer.md#ontimerevent)
- [unsubscribePlayer](BasicGameServer.md#unsubscribeplayer)
- [cancel](BasicGameServer.md#cancel)
- [setTimeout](BasicGameServer.md#settimeout)
- [setInterval](BasicGameServer.md#setinterval)
- [\_fireTimers](BasicGameServer.md#_firetimers)
- [build](BasicGameServer.md#build)

## Constructors

### constructor

• **new BasicGameServer**(`name`): [`BasicGameServer`](BasicGameServer.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | The name of the game. This is used to create the menu item to create a post. |

#### Returns

[`BasicGameServer`](BasicGameServer.md)

#### Defined in

core/BasicGameServer.tsx:27

## Properties

### subscriptions

• **subscriptions**: `string`[] = `[]`

#### Defined in

core/BasicGameServer.tsx:296

___

### setSubscriptions

• **setSubscriptions**: `StateSetter`\<`string`[]\>

#### Defined in

core/BasicGameServer.tsx:301

___

### context

• **context**: `BaseContext` & `ContextAPIClients`

#### Defined in

core/BasicGameServer.tsx:308

___

### \_userInfo

• **\_userInfo**: [`UserInfo`](../modules.md#userinfo)

#### Defined in

core/BasicGameServer.tsx:313

## Accessors

### redis

• `get` **redis**(): `RedisClient`

This is a helper method to get the Redis client. All of your game state should be stored in Redis.

#### Returns

`RedisClient`

#### Defined in

core/BasicGameServer.tsx:260

___

### reddit

• `get` **reddit**(): `RedditAPIClient`

This is a helper method to get the Reddit API client. You can use this to interact with Reddit.

#### Returns

`RedditAPIClient`

#### Defined in

core/BasicGameServer.tsx:267

___

### userId

• `get` **userId**(): ``null`` \| `string`

This is a helper method to get the current user id. This will be null if the user is not logged in, or if
this is a TimerEvent handler.

#### Returns

``null`` \| `string`

#### Defined in

core/BasicGameServer.tsx:275

___

### postId

• `get` **postId**(): `string`

This is a helper method to get the current post id.

#### Returns

`string`

#### Defined in

core/BasicGameServer.tsx:282

___

### userInfo

• `get` **userInfo**(): [`UserInfo`](../modules.md#userinfo)

This is a helper method to get the current user info.

#### Returns

[`UserInfo`](../modules.md#userinfo)

#### Defined in

core/BasicGameServer.tsx:289

## Methods

### onPostCreated

▸ **onPostCreated**(`post`): `Promise`\<`any`\>

This method is called when a new post is created. You can use this to initialize the game state.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `post` | [`PostInfo`](../modules.md#postinfo) | The post that was created. |

#### Returns

`Promise`\<`any`\>

#### Defined in

core/BasicGameServer.tsx:34

___

### onWebviewMessage

▸ **onWebviewMessage**(`msg`): `Promise`\<`any`\>

This method is called when a message is received from the webview. You can use this to update the game state. By default,
this method will broadcast the message to the postId channel. You can override this method to customize the behavior.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `msg` | `JSONValue` | The message that was sent from the webview. |

#### Returns

`Promise`\<`any`\>

#### Defined in

core/BasicGameServer.tsx:42

___

### onReceive

▸ **onReceive**(`msg`): `Promise`\<`any`\>

This method is called when a message is received from the broadcast channel. By default, this will send the
message to the webview. You can override this method to customize the behavior.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `msg` | [`BroadcastMessage`](../modules.md#broadcastmessage) | The message that was received from the broadcast channel. |

#### Returns

`Promise`\<`any`\>

#### Defined in

core/BasicGameServer.tsx:54

___

### onPlayerJoined

▸ **onPlayerJoined**(): `Promise`\<`any`\>

A player has joined the game. By default, this will

1. broadcast a notification to the postId channel, and
2. subscribe the player to the postId channel.

#### Returns

`Promise`\<`any`\>

#### Defined in

core/BasicGameServer.tsx:64

___

### broadcast

▸ **broadcast**(`channel`, `msg`): `Promise`\<`any`\>

You can use this method to broadcast a message to all of your players.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channel` | `string` |
| `msg` | `JSONValue` |

#### Returns

`Promise`\<`any`\>

#### Defined in

core/BasicGameServer.tsx:75

___

### sendToCurrentPlayerWebview

▸ **sendToCurrentPlayerWebview**(`msg`): `Promise`\<`any`\>

Assuming you're in an individual user's context, you can use this method to send a message to the webview. If you're in
a more global context, like a timer event, there won't be a webview to send a message to, so this will do nothing.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `msg` | `JSONValue` | The message to send to the webview. This should be a JSONable object. |

#### Returns

`Promise`\<`any`\>

#### Defined in

core/BasicGameServer.tsx:89

___

### subscribePlayer

▸ **subscribePlayer**(`channel`): `Promise`\<`any`\>

This subscribes the current player to a channel.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channel` | `string` |

#### Returns

`Promise`\<`any`\>

#### Defined in

core/BasicGameServer.tsx:102

___

### onTimerEvent

▸ **onTimerEvent**(`t`): `Promise`\<`void`\>

This gets called whenever a timer event is triggered. You can use this to update the game state, broadcast
changes, etc. By default, this method broadcasts the timer event to the postId channel.

#### Parameters

| Name | Type |
| :------ | :------ |
| `t` | [`TimerEvent`](../modules.md#timerevent) |

#### Returns

`Promise`\<`void`\>

#### Defined in

core/BasicGameServer.tsx:114

___

### unsubscribePlayer

▸ **unsubscribePlayer**(`channel`): `Promise`\<`any`\>

This unsubscribes the current player from a channel.

#### Parameters

| Name | Type |
| :------ | :------ |
| `channel` | `string` |

#### Returns

`Promise`\<`any`\>

#### Defined in

core/BasicGameServer.tsx:124

___

### cancel

▸ **cancel**(`t`): `Promise`\<`void`\>

Cancels a scheduled timer event

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `t` | [`TimerEvent`](../modules.md#timerevent) | The timer event to cancel |

#### Returns

`Promise`\<`void`\>

#### Defined in

core/BasicGameServer.tsx:134

___

### setTimeout

▸ **setTimeout**(`name`, `millis`, `data?`): `Promise`\<[`TimerEvent`](../modules.md#timerevent)\>

Schedules a one-time timer event. You should prefer this to naive setTimeout, if you want a long-running timer.
This method will handle server restarts and other issues that could cause a naive setTimeout to drift or stop.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Unique identifier for the timer, used for cancellation |
| `millis` | `number` | Delay in milliseconds before the timer fires |
| `data?` | `JSONValue` | Optional data to pass to the timer event |

#### Returns

`Promise`\<[`TimerEvent`](../modules.md#timerevent)\>

A TimerEvent object representing the scheduled timer

**`Throws`**

Error if no postId is present in the context

#### Defined in

core/BasicGameServer.tsx:148

___

### setInterval

▸ **setInterval**(`name`, `millis`, `data?`): `Promise`\<[`TimerEvent`](../modules.md#timerevent)\>

Schedules a recurring timer event on the server. You should prefer this to naive setInterval, if you want a long-running
interval. This method will handle server restarts and other issues that could cause a naive setInterval to drift or stop.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Unique identifier for the timer, used for cancellation |
| `millis` | `number` | Interval in milliseconds between timer events |
| `data?` | `JSONValue` | Optional data to pass to the timer event |

#### Returns

`Promise`\<[`TimerEvent`](../modules.md#timerevent)\>

A TimerEvent object representing the scheduled timer

**`Throws`**

Error if no postId is present in the context

#### Defined in

core/BasicGameServer.tsx:180

___

### \_fireTimers

▸ **_fireTimers**(`context`): `Promise`\<`void`\>

Internal method to process and fire scheduled timer events

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `context` | `BaseContext` | Base context containing Redis connection and other required data |

#### Returns

`Promise`\<`void`\>

#### Defined in

core/BasicGameServer.tsx:210

___

### build

▸ **build**(): typeof `Devvit`

This must be called to build the game server. This will add the game server to the Devvit instance.

#### Returns

typeof `Devvit`

The Devvit instance with the game server added.

#### Defined in

core/BasicGameServer.tsx:324
