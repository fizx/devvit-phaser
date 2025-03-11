import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Get the directory path of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface VersionInfo {
  devvitPhaser: string;
  mcpServer: string;
  devvitApi?: string;
  node: string;
  dependencies: Record<string, string>;
}

/**
 * Manager class for retrieving version information
 */
export class VersionManager {
  /**
   * Get version information for devvit-phaser and its dependencies
   */
  async getVersionInfo(): Promise<VersionInfo> {
    try {
      // Read devvit-phaser package.json
      const packageJsonPath = path.resolve(__dirname, '../../../package.json');
      const packageData = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      // Read devvit API version from dependencies
      const devvitApiVersion = packageData.devDependencies['@devvit/public-api'] || 
                            packageData.peerDependencies['@devvit/public-api'] || 
                            'Unknown';
      
      // Create version info object
      const versionInfo: VersionInfo = {
        devvitPhaser: packageData.version,
        mcpServer: packageData.version, // Use same version as main package
        devvitApi: devvitApiVersion,
        node: process.version,
        dependencies: {
          "typescript": packageData.devDependencies.typescript,
          "phaser": packageData.peerDependencies.phaser,
          "playwright": packageData.dependencies.playwright,
          "mcp-sdk": packageData.dependencies['@modelcontextprotocol/sdk']
        }
      };
      
      return versionInfo;
    } catch (error) {
      console.error('Error getting version information:', error);
      // Return basic version info if there's an error
      return {
        devvitPhaser: 'Unknown',
        mcpServer: 'Unknown',
        node: process.version,
        dependencies: {}
      };
    }
  }
}