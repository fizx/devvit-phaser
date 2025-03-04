import { JSONValue } from "@devvit/public-api";

export type DataManagerId = {
  isGlobal?: boolean;
  id: string;
};

export type DataManagerMutation = {
  dataManagerId: DataManagerId;
  updates?: { [key: string]: JSONValue };
  deletes?: string[];
  increments?: { [key: string]: number };
};

export type DataManagerSubscription = {
  add?: DataManagerId[];
  remove?: DataManagerId[];
};
