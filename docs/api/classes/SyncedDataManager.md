[devvit-phaser - v0.1.0](../README.md) / [Exports](../modules.md) / SyncedDataManager

# Class: SyncedDataManager

## Hierarchy

- `DataManager`

  ↳ **`SyncedDataManager`**

## Table of contents

### Constructors

- [constructor](SyncedDataManager.md#constructor)

### Properties

- [id](SyncedDataManager.md#id)
- [ready](SyncedDataManager.md#ready)

### Methods

- [applyMutation](SyncedDataManager.md#applymutation)
- [set](SyncedDataManager.md#set)
- [remove](SyncedDataManager.md#remove)
- [inc](SyncedDataManager.md#inc)
- [destroy](SyncedDataManager.md#destroy)

## Constructors

### constructor

• **new SyncedDataManager**(`id`, `parent`, `emitter?`): [`SyncedDataManager`](SyncedDataManager.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` \| [`DataManagerId`](../modules.md#datamanagerid) |
| `parent` | `Scene` \| `GameObject` |
| `emitter?` | `EventEmitter` |

#### Returns

[`SyncedDataManager`](SyncedDataManager.md)

#### Overrides

Phaser.Data.DataManager.constructor

#### Defined in

[client/SyncedDataManager.ts:55](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/client/SyncedDataManager.ts#L55)

## Properties

### id

• **id**: [`DataManagerId`](../modules.md#datamanagerid)

#### Defined in

[client/SyncedDataManager.ts:52](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/client/SyncedDataManager.ts#L52)

___

### ready

• **ready**: `boolean` = `false`

#### Defined in

[client/SyncedDataManager.ts:53](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/client/SyncedDataManager.ts#L53)

## Methods

### applyMutation

▸ **applyMutation**(`mutation`, `setReady`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `mutation` | [`DataManagerMutation`](../modules.md#datamanagermutation) |
| `setReady` | `boolean` |

#### Returns

`void`

#### Defined in

[client/SyncedDataManager.ts:78](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/client/SyncedDataManager.ts#L78)

___

### set

▸ **set**(`key`, `value`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `JSONValue` |

#### Returns

`this`

#### Overrides

Phaser.Data.DataManager.set

#### Defined in

[client/SyncedDataManager.ts:98](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/client/SyncedDataManager.ts#L98)

___

### remove

▸ **remove**(`key`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`this`

#### Overrides

Phaser.Data.DataManager.remove

#### Defined in

[client/SyncedDataManager.ts:108](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/client/SyncedDataManager.ts#L108)

___

### inc

▸ **inc**(`key`, `value?`): `this`

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `key` | `string` | `undefined` |
| `value` | `number` | `1` |

#### Returns

`this`

#### Overrides

Phaser.Data.DataManager.inc

#### Defined in

[client/SyncedDataManager.ts:118](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/client/SyncedDataManager.ts#L118)

___

### destroy

▸ **destroy**(): `void`

#### Returns

`void`

#### Overrides

Phaser.Data.DataManager.destroy

#### Defined in

[client/SyncedDataManager.ts:138](https://github.com/fizx/devvit-phaser/blob/412a642a3a98a03bf90214530acba9c58185c5cb/src/client/SyncedDataManager.ts#L138)
