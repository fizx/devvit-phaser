import { JSONValue } from "@devvit/public-api";

/**
 * Identifies a DataManager instance uniquely within the game.
 * 
 * Each DataManager (client or server) has a unique ID that can be used
 * to synchronize state between clients and the server.
 * 
 * @example
 * ```typescript
 * // A game-specific data manager
 * const gameStateId: DataManagerId = { id: "gameState" };
 * 
 * // A player-specific data manager
 * const playerStateId: DataManagerId = { id: `player_${userId}` };
 * 
 * // A global data manager (shared across all posts)
 * const globalHighScoresId: DataManagerId = { 
 *   id: "global_high_scores",
 *   isGlobal: true
 * };
 * ```
 */
export type DataManagerId = {
  /**
   * If true, this data manager is global across all posts.
   * If false or undefined, this data manager is specific to a single post.
   */
  isGlobal?: boolean;
  
  /**
   * The unique identifier for this data manager.
   * Should be descriptive of its purpose.
   */
  id: string;
};

/**
 * Represents a batch of changes to a DataManager.
 * 
 * Mutations are sent from clients to the server or from the server to clients
 * to keep all data managers synchronized.
 * 
 * @example
 * ```typescript
 * // Setting values
 * const setMutation: DataManagerMutation = {
 *   dataManagerId: { id: "gameState" },
 *   updates: { 
 *     score: 100,
 *     level: 5,
 *     gameActive: true
 *   }
 * };
 * 
 * // Deleting values
 * const deleteMutation: DataManagerMutation = {
 *   dataManagerId: { id: "player_123" },
 *   deletes: ["powerup", "shield"]
 * };
 * 
 * // Incrementing values
 * const incrementMutation: DataManagerMutation = {
 *   dataManagerId: { id: "player_123" },
 *   increments: { score: 10, lives: -1 }
 * };
 * ```
 */
export type DataManagerMutation = {
  /** The data manager this mutation applies to */
  dataManagerId: DataManagerId;
  
  /** 
   * Key-value pairs to set in the data manager.
   * These will overwrite existing values.
   */
  updates?: { [key: string]: JSONValue };
  
  /**
   * Keys to remove from the data manager.
   */
  deletes?: string[];
  
  /**
   * Key-value pairs to increment in the data manager.
   * The values are the amount to increment by (can be negative).
   */
  increments?: { [key: string]: number };
};

/**
 * Used to subscribe or unsubscribe to data manager changes.
 * 
 * When a client connects, it subscribes to data managers it wants to sync with.
 * The server then sends initial data and keeps the client updated with changes.
 * 
 * @example
 * ```typescript
 * // Subscribing to data managers
 * const subscription: DataManagerSubscription = {
 *   add: [
 *     { id: "gameState" },
 *     { id: `player_${userId}` }
 *   ]
 * };
 * 
 * // Unsubscribing from data managers
 * const unsubscription: DataManagerSubscription = {
 *   remove: [{ id: "temporaryEvent" }]
 * };
 * ```
 */
export type DataManagerSubscription = {
  /** Data managers to subscribe to */
  add?: DataManagerId[];
  
  /** Data managers to unsubscribe from */
  remove?: DataManagerId[];
};