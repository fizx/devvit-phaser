import { JSONValue } from "@devvit/public-api";

/**
 * Represents a Devvit post in the context of a game.
 * 
 * This is a simplified version of a Reddit Post. For more comprehensive post data,
 * you should use the Reddit API Client.
 * 
 * @example
 * ```typescript
 * const post: PostInfo = { postId: "t3_abc123" };
 * ```
 */
export type PostInfo = {
  /** The Reddit post ID (t3_XXXXX format) */
  postId: string;
};

/**
 * Represents a user in the context of a Devvit game.
 * 
 * This is a simplified version of a Reddit User. For more comprehensive user data,
 * you should use the Reddit API Client.
 * 
 * @example
 * ```typescript
 * const user: UserInfo = {
 *   userId: "t2_abc123",
 *   username: "RedditUser123",
 *   screenId: "unique-session-id"
 * };
 * ```
 */
export type UserInfo = {
  /** The Reddit user ID (t2_XXXXX format) */
  userId: string;
  
  /** The Reddit username */
  username: string;

  /** 
   * A unique ID for the specific app instance.
   * If the user refreshes the page, they'll get a new screenId.
   */
  screenId: string;
};

/**
 * Represents a scheduled timer event in the game.
 * 
 * Timer events can be one-time events or recurring intervals.
 * They are persisted in Redis and survive server restarts.
 * 
 * @example
 * ```typescript
 * // One-time event
 * const event: TimerEvent = {
 *   postId: "t3_abc123",
 *   name: "respawn_player",
 *   id: "unique-uuid",
 *   data: { playerId: "t2_xyz789" }
 * };
 * 
 * // Recurring event
 * const interval: TimerEvent = {
 *   postId: "t3_abc123",
 *   name: "spawn_asteroid",
 *   id: "unique-uuid",
 *   interval: 1000, // milliseconds
 *   data: { maxAsteroids: 10 }
 * };
 * ```
 */
export type TimerEvent = {
  /** The Reddit post ID where this timer belongs */
  postId: string;
  
  /** 
   * A name to identify the timer type
   * Used for event handling logic
   */
  name: string;
  
  /** Unique identifier for this specific timer instance */
  id: string;
  
  /** 
   * If present, makes the timer recurring with this interval (in milliseconds)
   * If not present, the timer fires only once
   */
  interval?: number;
  
  /** 
   * Optional data to associate with the timer event 
   * This is passed to the onTimerEvent handler
   */
  data?: JSONValue;
};

/**
 * Represents a message broadcast through the realtime system.
 * 
 * BroadcastMessages are sent via channels (usually the postId) to all
 * subscribed players.
 * 
 * @example
 * ```typescript
 * const message: BroadcastMessage = {
 *   from: userInfo,
 *   channel: "t3_abc123",
 *   data: { type: "MOVE", playerId: "t2_xyz789", position: { x: 100, y: 200 } }
 * };
 * ```
 */
export type BroadcastMessage = {
  /** The user who sent the message */
  from: UserInfo;

  /** 
   * The channel this message was sent on
   * Typically this is the postId, but you can create your own channels
   */
  channel: string;

  /** 
   * The payload of the message
   * Can be any serializable data
   */
  data: any;
};