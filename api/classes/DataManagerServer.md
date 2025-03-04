[devvit-phaser - v0.1.0](../README.md) / [Exports](../modules.md) / DataManagerServer

# Class: DataManagerServer

## Table of contents

### Constructors

- [constructor](DataManagerServer.md#constructor)

### Properties

- [id](DataManagerServer.md#id)

### Accessors

- [subscriptionId](DataManagerServer.md#subscriptionid)

### Methods

- [processMutation](DataManagerServer.md#processmutation)
- [set](DataManagerServer.md#set)
- [setAll](DataManagerServer.md#setall)
- [get](DataManagerServer.md#get)
- [getAll](DataManagerServer.md#getall)
- [remove](DataManagerServer.md#remove)
- [inc](DataManagerServer.md#inc)
- [merge](DataManagerServer.md#merge)
- [reset](DataManagerServer.md#reset)
- [delete](DataManagerServer.md#delete)
- [has](DataManagerServer.md#has)
- [keys](DataManagerServer.md#keys)
- [size](DataManagerServer.md#size)
- [clear](DataManagerServer.md#clear)

## Constructors

### constructor

• **new DataManagerServer**(`parent`, `id`): [`DataManagerServer`](DataManagerServer.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `parent` | [`PhaserGameServer`](PhaserGameServer.md) |
| `id` | [`DataManagerId`](../modules.md#datamanagerid) |

#### Returns

[`DataManagerServer`](DataManagerServer.md)

#### Defined in

[server/DataManagerServer.ts:6](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L6)

## Properties

### id

• **id**: [`DataManagerId`](../modules.md#datamanagerid)

#### Defined in

[server/DataManagerServer.ts:6](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L6)

## Accessors

### subscriptionId

• `get` **subscriptionId**(): `string`

#### Returns

`string`

#### Defined in

[server/DataManagerServer.ts:8](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L8)

## Methods

### processMutation

▸ **processMutation**(`mutation`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `mutation` | [`DataManagerMutation`](../modules.md#datamanagermutation) |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/DataManagerServer.ts:25](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L25)

___

### set

▸ **set**(`key`, `value`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `JSONValue` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/DataManagerServer.ts:62](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L62)

___

### setAll

▸ **setAll**(`data`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/DataManagerServer.ts:70](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L70)

___

### get

▸ **get**(`key`): `Promise`\<`undefined` \| `JSONValue`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`\<`undefined` \| `JSONValue`\>

#### Defined in

[server/DataManagerServer.ts:79](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L79)

___

### getAll

▸ **getAll**(): `Promise`\<\{ `[key: string]`: `JSONValue`;  }\>

#### Returns

`Promise`\<\{ `[key: string]`: `JSONValue`;  }\>

#### Defined in

[server/DataManagerServer.ts:84](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L84)

___

### remove

▸ **remove**(`key`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/DataManagerServer.ts:91](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L91)

___

### inc

▸ **inc**(`key`, `value?`): `Promise`\<`number`\>

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `key` | `string` | `undefined` |
| `value` | `number` | `1` |

#### Returns

`Promise`\<`number`\>

#### Defined in

[server/DataManagerServer.ts:97](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L97)

___

### merge

▸ **merge**(`data`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/DataManagerServer.ts:108](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L108)

___

### reset

▸ **reset**(`data`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `Object` |

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/DataManagerServer.ts:117](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L117)

___

### delete

▸ **delete**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/DataManagerServer.ts:124](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L124)

___

### has

▸ **has**(`key`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[server/DataManagerServer.ts:134](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L134)

___

### keys

▸ **keys**(): `Promise`\<`string`[]\>

#### Returns

`Promise`\<`string`[]\>

#### Defined in

[server/DataManagerServer.ts:138](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L138)

___

### size

▸ **size**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Defined in

[server/DataManagerServer.ts:142](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L142)

___

### clear

▸ **clear**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

#### Defined in

[server/DataManagerServer.ts:146](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/server/DataManagerServer.ts#L146)
