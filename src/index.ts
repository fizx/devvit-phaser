/**
 * DEPRECATED: Importing from 'devvit-phaser' directly is deprecated.
 * Please use specific imports instead:
 * 
 * - For client components: import { SyncedDataManager } from 'devvit-phaser/client'
 * - For server components: import { PhaserGameSrv } from 'devvit-phaser/srv'
 */

// Export all types
export * from './types.js';
export * from './core/types.js';

// Export core components
export { BasicGameSrv } from './core/BasicGameSrv.js';

// Export client components
export { SyncedDataManager } from './client/SyncedDataManager.js';

// Export server components
export { PhaserGameSrv } from './srv/PhaserGameSrv.js';
export { DataManagerSrv } from './srv/DataManagerSrv.js';

// Log warning in development (but not in production to avoid console spam)
if (process.env.NODE_ENV !== 'production') {
  console.warn(
    'DEPRECATED: Importing from "devvit-phaser" directly is deprecated. ' +
    'Please use specific imports instead:\n' +
    '- For client: import { SyncedDataManager } from "devvit-phaser/client"\n' +
    '- For server: import { PhaserGameSrv } from "devvit-phaser/srv"'
  );
}