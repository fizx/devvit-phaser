[devvit-phaser - v0.1.0](../README.md) / [Exports](../modules.md) / PhaserGameServer

# Class: PhaserGameServer

A GameServer subclass for Phaser games. This class adds some additional methods for managing synchronized data
managers, which are the primary way to do multiplayer communication.

## Hierarchy

- [`BasicGameServer`](BasicGameServer.md)

  ↳ **`PhaserGameServer`**

## Table of contents

### Constructors

- [constructor](PhaserGameServer.md#constructor)

### Properties

- [subscriptions](PhaserGameServer.md#subscriptions)
- [setSubscriptions](PhaserGameServer.md#setsubscriptions)
- [context](PhaserGameServer.md#context)
- [\_userInfo](PhaserGameServer.md#_userinfo)

### Accessors

- [redis](PhaserGameServer.md#redis)
- [reddit](PhaserGameServer.md#reddit)
- [userId](PhaserGameServer.md#userid)
- [postId](PhaserGameServer.md#postid)
- [userInfo](PhaserGameServer.md#userinfo)

### Methods

- [onPostCreated](PhaserGameServer.md#onpostcreated)
- [onReceive](PhaserGameServer.md#onreceive)
- [broadcast](PhaserGameServer.md#broadcast)
- [sendToCurrentPlayerWebview](PhaserGameServer.md#sendtocurrentplayerwebview)
- [subscribePlayer](PhaserGameServer.md#subscribeplayer)
- [onTimerEvent](PhaserGameServer.md#ontimerevent)
- [unsubscribePlayer](PhaserGameServer.md#unsubscribeplayer)
- [cancel](PhaserGameServer.md#cancel)
- [setTimeout](PhaserGameServer.md#settimeout)
- [setInterval](PhaserGameServer.md#setinterval)
- [\_fireTimers](PhaserGameServer.md#_firetimers)
- [build](PhaserGameServer.md#build)
- [toSubscriptionId](PhaserGameServer.md#tosubscriptionid)
- [onDataManagerSubscribe](PhaserGameServer.md#ondatamanagersubscribe)
- [onDataManagerMutate](PhaserGameServer.md#ondatamanagermutate)
- [onPlayerJoined](PhaserGameServer.md#onplayerjoined)
- [subscribePlayerToDataManager](PhaserGameServer.md#subscribeplayertodatamanager)
- [unsubscribePlayerToDataManager](PhaserGameServer.md#unsubscribeplayertodatamanager)
- [processDataManagerMutation](PhaserGameServer.md#processdatamanagermutation)
- [processDataManagerSubscription](PhaserGameServer.md#processdatamanagersubscription)
- [onWebviewMessage](PhaserGameServer.md#onwebviewmessage)

## Constructors

### constructor

• **new PhaserGameServer**(`gameName`): [`PhaserGameServer`](PhaserGameServer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `gameName` | `string` |

#### Returns

[`PhaserGameServer`](PhaserGameServer.md)

#### Overrides

[BasicGameServer](BasicGameServer.md).[constructor](BasicGameServer.md#constructor)

#### Defined in

[server/PhaserGameServer.ts:19](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/server/PhaserGameServer.ts#L19)

## Properties

### subscriptions

• **subscriptions**: `string`[] = `[]`

#### Inherited from

[BasicGameServer](BasicGameServer.md).[subscriptions](BasicGameServer.md#subscriptions)

#### Defined in

[core/BasicGameServer.tsx:296](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L296)

___

### setSubscriptions

• **setSubscriptions**: `StateSetter`\<`string`[]\>

#### Inherited from

[BasicGameServer](BasicGameServer.md).[setSubscriptions](BasicGameServer.md#setsubscriptions)

#### Defined in

[core/BasicGameServer.tsx:301](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L301)

___

### context

• **context**: `BaseContext` & `ContextAPIClients`

#### Inherited from

[BasicGameServer](BasicGameServer.md).[context](BasicGameServer.md#context)

#### Defined in

[core/BasicGameServer.tsx:308](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L308)

___

### \_userInfo

• **\_userInfo**: [`UserInfo`](../modules.md#userinfo)

#### Inherited from

[BasicGameServer](BasicGameServer.md).[_userInfo](BasicGameServer.md#_userinfo)

#### Defined in

[core/BasicGameServer.tsx:313](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L313)

## Accessors

### redis

• `get` **redis**(): `RedisClient`

This is a helper method to get the Redis client. All of your game state should be stored in Redis.

#### Returns

`RedisClient`

#### Inherited from

BasicGameServer.redis

#### Defined in

[core/BasicGameServer.tsx:260](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L260)

___

### reddit

• `get` **reddit**(): `RedditAPIClient`

This is a helper method to get the Reddit API client. You can use this to interact with Reddit.

#### Returns

`RedditAPIClient`

#### Inherited from

BasicGameServer.reddit

#### Defined in

[core/BasicGameServer.tsx:267](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L267)

___

### userId

• `get` **userId**(): ``null`` \| `string`

This is a helper method to get the current user id. This will be null if the user is not logged in, or if
this is a TimerEvent handler.

#### Returns

``null`` \| `string`

#### Inherited from

BasicGameServer.userId

#### Defined in

[core/BasicGameServer.tsx:275](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L275)

___

### postId

• `get` **postId**(): `string`

This is a helper method to get the current post id.

#### Returns

`string`

#### Inherited from

BasicGameServer.postId

#### Defined in

[core/BasicGameServer.tsx:282](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L282)

___

### userInfo

• `get` **userInfo**(): [`UserInfo`](../modules.md#userinfo)

This is a helper method to get the current user info.

#### Returns

[`UserInfo`](../modules.md#userinfo)

#### Inherited from

BasicGameServer.userInfo

#### Defined in

[core/BasicGameServer.tsx:289](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L289)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[onPostCreated](BasicGameServer.md#onpostcreated)

#### Defined in

[core/BasicGameServer.tsx:34](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L34)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[onReceive](BasicGameServer.md#onreceive)

#### Defined in

[core/BasicGameServer.tsx:54](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L54)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[broadcast](BasicGameServer.md#broadcast)

#### Defined in

[core/BasicGameServer.tsx:75](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L75)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[sendToCurrentPlayerWebview](BasicGameServer.md#sendtocurrentplayerwebview)

#### Defined in

[core/BasicGameServer.tsx:89](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L89)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[subscribePlayer](BasicGameServer.md#subscribeplayer)

#### Defined in

[core/BasicGameServer.tsx:102](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L102)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[onTimerEvent](BasicGameServer.md#ontimerevent)

#### Defined in

[core/BasicGameServer.tsx:114](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L114)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[unsubscribePlayer](BasicGameServer.md#unsubscribeplayer)

#### Defined in

[core/BasicGameServer.tsx:124](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L124)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[cancel](BasicGameServer.md#cancel)

#### Defined in

[core/BasicGameServer.tsx:134](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L134)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[setTimeout](BasicGameServer.md#settimeout)

#### Defined in

[core/BasicGameServer.tsx:148](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L148)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[setInterval](BasicGameServer.md#setinterval)

#### Defined in

[core/BasicGameServer.tsx:180](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L180)

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

#### Inherited from

[BasicGameServer](BasicGameServer.md).[_fireTimers](BasicGameServer.md#_firetimers)

#### Defined in

[core/BasicGameServer.tsx:210](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L210)

___

### build

▸ **build**(): typeof `Devvit`

This must be called to build the game server. This will add the game server to the Devvit instance.

#### Returns

typeof `Devvit`

The Devvit instance with the game server added.

#### Inherited from

[BasicGameServer](BasicGameServer.md).[build](BasicGameServer.md#build)

#### Defined in

[core/BasicGameServer.tsx:324](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/core/BasicGameServer.tsx#L324)

___

### toSubscriptionId

▸ **toSubscriptionId**(`dataManagerId`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `dataManagerId` | [`DataManagerId`](../modules.md#datamanagerid) |

#### Returns

`string`

#### Defined in

[server/PhaserGameServer.ts:23](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/server/PhaserGameServer.ts#L23)

___

### onDataManagerSubscribe

▸ **onDataManagerSubscribe**(`_subscriptions`): `Promise`\<`void`\>

Called when a player creates a synchronized data manager from the client. Override this method to do permission
checks or other setup. In particular, you can check this.userId, etc, to see if the player is allowed to view this
data. If not, throw an error to prevent the creation.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_subscriptions` | [`DataManagerSubscription`](../modules.md#datamanagersubscription) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/PhaserGameServer.ts:36](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/server/PhaserGameServer.ts#L36)

___

### onDataManagerMutate

▸ **onDataManagerMutate**(`_mutation`): `Promise`\<`void`\>

Called when a player writes to a synchronized data manager from the client. Override this method to do permission
checks or other setup. In particular, you can check this.userId, etc, to see if the player is allowed to write to
this data. If not, throw an error to prevent the write.

#### Parameters

| Name | Type |
| :------ | :------ |
| `_mutation` | [`DataManagerMutation`](../modules.md#datamanagermutation) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/PhaserGameServer.ts:45](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/server/PhaserGameServer.ts#L45)

___

### onPlayerJoined

▸ **onPlayerJoined**(): `Promise`\<`any`\>

A player has joined the game. By default, this will

1. broadcast a notification to the postId channel, and
2. subscribe the player to the postId channel.

#### Returns

`Promise`\<`any`\>

#### Overrides

[BasicGameServer](BasicGameServer.md).[onPlayerJoined](BasicGameServer.md#onplayerjoined)

#### Defined in

[server/PhaserGameServer.ts:49](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/server/PhaserGameServer.ts#L49)

___

### subscribePlayerToDataManager

▸ **subscribePlayerToDataManager**(`dataManager`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dataManager` | [`DataManagerServer`](DataManagerServer.md) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/PhaserGameServer.ts:58](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/server/PhaserGameServer.ts#L58)

___

### unsubscribePlayerToDataManager

▸ **unsubscribePlayerToDataManager**(`dataManager`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `dataManager` | [`DataManagerServer`](DataManagerServer.md) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/PhaserGameServer.ts:63](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/server/PhaserGameServer.ts#L63)

___

### processDataManagerMutation

▸ **processDataManagerMutation**(`mutation`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `mutation` | [`DataManagerMutation`](../modules.md#datamanagermutation) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/PhaserGameServer.ts:69](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/server/PhaserGameServer.ts#L69)

___

### processDataManagerSubscription

▸ **processDataManagerSubscription**(`subscriptions`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `subscriptions` | [`DataManagerSubscription`](../modules.md#datamanagersubscription) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/PhaserGameServer.ts:75](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/server/PhaserGameServer.ts#L75)

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

#### Overrides

[BasicGameServer](BasicGameServer.md).[onWebviewMessage](BasicGameServer.md#onwebviewmessage)

#### Defined in

[server/PhaserGameServer.ts:104](https://github.com/fizx/devvit-phaser/blob/da39dfcea76f95c889f53fe4da2d1357fdd14986/src/server/PhaserGameServer.ts#L104)
