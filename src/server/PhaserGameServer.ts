import { BasicGameServer } from "../core/BasicGameServer";
import { DataManagerServer } from "./DataManagerServer";
import {
  DataManagerId,
  DataManagerMutation,
  DataManagerSubscription,
} from "../types";
import { JSONValue } from "@devvit/public-api";

export function hi() {
  return "hi";
}

/**
 * A GameServer subclass for Phaser games. This class adds some additional methods for managing synchronized data
 * managers, which are the primary way to do multiplayer communication.
 */
export class PhaserGameServer extends BasicGameServer {
  constructor(gameName: string) {
    super(gameName);
  }

  protected toSubscriptionId(dataManagerId: DataManagerId) {
    return dataManagerId.isGlobal
      ? dataManagerId.id
      : `${this.postId}_${dataManagerId.id}`;
  }

  /**
   * Called when a player creates a synchronized data manager from the client. Override this method to do permission
   * checks or other setup. In particular, you can check this.userId, etc, to see if the player is allowed to view this
   * data. If not, throw an error to prevent the creation.
   *
   * @param dataManagerId
   */
  async onDataManagerSubscribe(_subscriptions: DataManagerSubscription) {}

  /**
   * Called when a player writes to a synchronized data manager from the client. Override this method to do permission
   * checks or other setup. In particular, you can check this.userId, etc, to see if the player is allowed to write to
   * this data. If not, throw an error to prevent the write.
   *
   * @param dataManagerId
   */
  async onDataManagerMutate(_mutation: DataManagerMutation) {
    console.log("onDataManagerMutate", JSON.stringify(_mutation));
  }

  override async onPlayerJoined(): Promise<any> {
    console.log("Player joined", JSON.stringify(this.userInfo));
    const info = new DataManagerServer(this, { id: "players" });
    await info.set(this.userInfo.screenId, this.userInfo);
    await this.subscribePlayerToDataManager(info);
    console.log("inner", this.subscriptions);
    this.sendToCurrentPlayerWebview({ screenId: this.userInfo.screenId });
  }

  async subscribePlayerToDataManager(dataManager: DataManagerServer) {
    await this.processDataManagerSubscription({
      add: [dataManager.id],
    });
  }
  async unsubscribePlayerFromDataManager(dataManager: DataManagerServer) {
    await this.processDataManagerSubscription({
      remove: [dataManager.id],
    });
  }

  async processDataManagerMutation(mutation: DataManagerMutation) {
    await this.onDataManagerMutate(mutation);
    
    // Instead of calling processMutation directly, use the public methods
    const server = new DataManagerServer(this, mutation.dataManagerId);
    
    // Handle updates
    if (mutation.updates && Object.keys(mutation.updates).length > 0) {
      await server.setAll(mutation.updates);
    }
    
    // Handle deletes
    if (mutation.deletes && mutation.deletes.length > 0) {
      for (const key of mutation.deletes) {
        await server.remove(key);
      }
    }
    
    // Handle increments
    if (mutation.increments && Object.keys(mutation.increments).length > 0) {
      for (const [key, value] of Object.entries(mutation.increments)) {
        await server.inc(key, value);
      }
    }
  }

  async processDataManagerSubscription(subscriptions: DataManagerSubscription) {
    await this.onDataManagerSubscribe(subscriptions);
    await Promise.all([
      ...(subscriptions.add || []).map(async (dataManagerId) => {
        const existing = await this.redis.hGetAll(
          this.toSubscriptionId(dataManagerId)
        );
        console.log(
          "hGetAll",
          this.toSubscriptionId(dataManagerId),
          JSON.stringify(existing)
        );
        const updates = Object.fromEntries(
          Object.entries(existing).map(([k, v]) => [k, JSON.parse(v)])
        );
        const mutation: DataManagerMutation = {
          dataManagerId,
          updates,
        };
        console.log("Sending initial data", JSON.stringify(mutation));
        await this.sendToCurrentPlayerWebview({ mutation, ready: true });
        await this.subscribePlayer(this.toSubscriptionId(dataManagerId));
      }),
      ...(subscriptions.remove || []).map((dataManagerId) =>
        this.unsubscribePlayer(this.toSubscriptionId(dataManagerId))
      ),
    ]);
  }

  override async onWebviewMessage(msg: JSONValue): Promise<any> {
    console.log("Webview message received", JSON.stringify(msg));
    const obj = msg as any;
    if (obj.subscriptions) {
      await this.processDataManagerSubscription(obj.subscriptions);
    }
    if (obj.mutation) {
      await this.processDataManagerMutation(obj.mutation);
    }
  }
}