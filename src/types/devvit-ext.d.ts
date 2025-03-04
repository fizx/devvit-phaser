/**
 * Type declarations to extend Devvit typings
 */

import { StateSetter } from "@devvit/public-api";

declare module "@devvit/public-api" {
  export function useChannel(options: { name: string, onMessage: (msg: any) => void }): UseChannelResult;
  export interface UseChannelResult {
    subscribe: () => void;
    unsubscribe: () => void;
  }

  export interface UIClient {
    webView: {
      postMessage: (id: string, msg: any) => Promise<void>;
    }
  }

  export interface AsyncOptions {
    depends?: any[];
    finally?: (data: any, error: any) => Promise<void>;
  }
}