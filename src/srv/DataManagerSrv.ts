import { DataManagerId, DataManagerMutation } from "../types.js";
import { JSONValue } from "@devvit/public-api";
import { PhaserGameSrv } from "./PhaserGameSrv.js";

export class DataManagerSrv {
  constructor(private parent: PhaserGameSrv, public id: DataManagerId) {}

  get subscriptionId() {
    // Use a more public-facing method to get the channel
    // Ensure the ID is valid for useChannel (only letters, numbers, and underscores)
    const sanitizedId = this.id.id.replace(/[^a-zA-Z0-9_]/g, '_');
    return this.id.isGlobal
      ? sanitizedId
      : `${this.parent.postId}_${sanitizedId}`;
  }

  private createMutation(
    updates: { [key: string]: JSONValue } = {},
    deletes: string[] = [],
    increments: { [key: string]: number } = {}
  ): DataManagerMutation {
    return {
      dataManagerId: this.id,
      updates,
      deletes,
      increments,
    };
  }

  private async processMutation(mutation: DataManagerMutation): Promise<void> {
    const promises: Promise<any>[] = [];
    console.log("processing mutation", mutation);
    // Process updates
    if (Object.keys(mutation.updates || {}).length > 0) {
      const stringified = Object.fromEntries(
        Object.entries(mutation.updates || {}).map(([k, v]) => [
          k,
          JSON.stringify(v),
        ])
      );
      promises.push(this.parent.redis.hSet(this.subscriptionId, stringified));
    }

    // Process deletes
    if ((mutation.deletes || []).length > 0) {
      promises.push(
        this.parent.redis.hDel(this.subscriptionId, mutation.deletes || [])
      );
    }

    // Process increments
    if (Object.keys(mutation.increments || {}).length > 0) {
      promises.push(
        ...Object.entries(mutation.increments || {}).map(([key, value]) =>
          this.parent.redis.hIncrBy(this.subscriptionId, key, value)
        )
      );
    }

    // Wait for all Redis operations to complete
    await Promise.all(promises);

    // Broadcast the mutation to all subscribers
    this.parent.broadcast(this.subscriptionId, { mutation });
  }

  async set(key: string, value: JSONValue) {
    await this.parent.redis.hSet(this.subscriptionId, {
      [key]: JSON.stringify(value),
    });
    const mutation = this.createMutation({ [key]: value });
    this.parent.broadcast(this.subscriptionId, { mutation });
  }

  async setAll(data: { [key: string]: JSONValue }) {
    const stringified = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, JSON.stringify(v)])
    );
    await this.parent.redis.hSet(this.subscriptionId, stringified);
    const mutation = this.createMutation(data);
    this.parent.broadcast(this.subscriptionId, { mutation });
  }

  async get(key: string): Promise<JSONValue | undefined> {
    const value = await this.parent.redis.hGet(this.subscriptionId, key);
    return value ? JSON.parse(value) : undefined;
  }

  async getAll(): Promise<{ [key: string]: JSONValue }> {
    const data = await this.parent.redis.hGetAll(this.subscriptionId);
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, JSON.parse(v)])
    );
  }

  async remove(key: string) {
    await this.parent.redis.hDel(this.subscriptionId, [key]);
    const mutation = this.createMutation({}, [key]);
    this.parent.broadcast(this.subscriptionId, { mutation });
  }

  async inc(key: string, value: number = 1) {
    const result = await this.parent.redis.hIncrBy(
      this.subscriptionId,
      key,
      value
    );
    const mutation = this.createMutation({}, [], { [key]: value });
    this.parent.broadcast(this.subscriptionId, { mutation });
    return result;
  }

  async merge(data: { [key: string]: JSONValue }) {
    const stringified = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, JSON.stringify(v)])
    );
    await this.parent.redis.hSet(this.subscriptionId, stringified);
    const mutation = this.createMutation(data);
    this.parent.broadcast(this.subscriptionId, { mutation });
  }

  async reset(data: { [key: string]: JSONValue }) {
    await this.parent.redis.del(this.subscriptionId);
    if (Object.keys(data).length > 0) {
      await this.merge(data);
    }
  }

  async delete() {
    const keys = await this.parent.redis.hKeys(this.subscriptionId);
    if (keys.length > 0) {
      const mutation = this.createMutation({}, keys);
      this.parent.broadcast(this.subscriptionId, { mutation });
    }
    await this.parent.redis.del(this.subscriptionId);
  }

  // Utilities
  async has(key: string): Promise<boolean> {
    return !!(await this.parent.redis.hGet(this.subscriptionId, key));
  }

  async keys(): Promise<string[]> {
    return this.parent.redis.hKeys(this.subscriptionId);
  }

  async size(): Promise<number> {
    return this.parent.redis.hLen(this.subscriptionId);
  }

  async clear() {
    const keys = await this.keys();
    if (keys.length > 0) {
      const mutation = this.createMutation({}, keys);
      this.parent.broadcast(this.subscriptionId, { mutation });
    }
    await this.parent.redis.del(this.subscriptionId);
  }
}