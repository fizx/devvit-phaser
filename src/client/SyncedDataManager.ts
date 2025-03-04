import Phaser from "phaser";
import {
  DataManagerId,
  DataManagerMutation,
  DataManagerSubscription,
} from "../types";
import { JSONValue } from "@devvit/public-api";

declare global {
  interface Window {
    me: Phaser.Data.DataManager;
  }
}

const router: { [id: string]: WeakRef<SyncedDataManager> } = {};
window.me = new Phaser.Data.DataManager(new Phaser.Events.EventEmitter());

// Set up global message handler
console.log("adding message listener");
window.addEventListener("message", (event) => {
  console.log("Received message", event.data);

  const screenId = (event.data.data.message.screenId ||
    event.data.data.message?.data?.screenId) as string | undefined;
  if (screenId) {
    console.log("Received screenId", screenId);
    window.me.set("screenId", screenId);
    return;
  }

  try {
    const mutation =
      event.data.data.message.mutation ||
      (event.data.data.message.data.mutation as
        | DataManagerMutation
        | undefined);
    if (!mutation || !mutation?.dataManagerId?.id) return;

    const targetRef = router[mutation.dataManagerId.id];
    const target = targetRef?.deref();
    if (target) {
      console.log("applying mutation", mutation);
      target.applyMutation(mutation, event.data.data.message.ready);
    } else {
      console.warn("No target found for mutation", mutation);
    }
  } catch (e) {
    console.error("Error processing message", e);
  }
});

export class SyncedDataManager extends Phaser.Data.DataManager {
  public id: DataManagerId;
  ready: boolean = false;

  constructor(
    id: string | DataManagerId,
    parent: Phaser.Scene | Phaser.GameObjects.GameObject,
    emitter?: Phaser.Events.EventEmitter
  ) {
    super(parent, emitter);
    this.id = typeof id === "string" ? { id } : id;
    router[this.id.id] = new WeakRef(this);
    this.postSubscriptions([this.id]);
  }

  private postSubscriptions(
    add: DataManagerId[] = [],
    remove: DataManagerId[] = []
  ) {
    const subscriptions: DataManagerSubscription = {
      add,
      remove,
    };
    console.log("Posting subscriptions", subscriptions);
    window.parent.postMessage({ subscriptions }, "*");
  }

  applyMutation(mutation: DataManagerMutation, setReady: boolean) {
    Object.entries(mutation.updates || {}).forEach(([key, value]) => {
      console.log("setting", key, value);
      super.set(key, value);
    });

    (mutation.deletes || []).forEach((key) => {
      super.remove(key);
    });

    Object.entries(mutation.increments || {}).forEach(([key, value]) => {
      super.inc(key, value);
    });
    if (!this.ready && setReady) {
      console.log("Emitting ready");
      this.events.emit("ready", this);
      this.ready = true;
    }
  }

  override set(key: string, value: JSONValue): this {
    super.set(key, value);
    this.postMutation({
      updates: { [key]: value },
      deletes: [],
      increments: {},
    });
    return this;
  }

  override remove(key: string): this {
    super.remove(key);
    this.postMutation({
      updates: {},
      deletes: [key],
      increments: {},
    });
    return this;
  }

  inc(key: string, value: number = 1): this {
    const current = (super.get(key) as number) || 0;
    super.set(key, current + value);
    this.postMutation({
      updates: {},
      deletes: [],
      increments: { [key]: value },
    });
    return this;
  }

  private postMutation(partial: Omit<DataManagerMutation, "dataManagerId">) {
    const mutation: DataManagerMutation = {
      dataManagerId: this.id,
      ...partial,
    };
    console.log("Posting mutation", mutation);
    window.parent.postMessage({ mutation }, "*");
  }

  override destroy(): void {
    delete router[this.id.id];
    super.destroy();
    this.postSubscriptions([], [this.id]);
  }
}