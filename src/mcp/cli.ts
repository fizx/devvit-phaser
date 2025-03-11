#!/usr/bin/env node
import { Command } from 'commander';
import { startServer } from './server.js';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

// Get package version from package.json
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.resolve(__dirname, '../../package.json');

async function getPackageVersion(): Promise<string> {
  try {
    const packageData = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    return packageData.version;
  } catch (error) {
    console.error('Error reading package.json:', error);
    return '0.0.0';
  }
}

// Common server startup logic
async function runServer() {
  console.error(chalk.blue('Starting Devvit-Phaser MCP server'));
  console.error(chalk.gray('Use --help to see available options'));
  try {
    await startServer();
  } catch (error) {
    console.error(chalk.red('Error starting MCP server:'), error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  // Check for explicit help request
  const isHelpRequested = process.argv.slice(2).some(arg => 
    arg === '--help' || arg === '-h' || arg === 'help'
  );

  // If help is requested, use Commander normally
  if (isHelpRequested) {
    const version = await getPackageVersion();
    const program = new Command();
    
    program
      .name('devvit-phaser-mcp')
      .description('MCP server for testing Devvit-Phaser games')
      .version(version);
    
    program
      .command('start', { isDefault: true })
      .description('Start the MCP server')
      .action(async () => {
        await runServer();
      });
    
    // Add description of the MCP tools
    program.addHelpText('after', `
Available MCP Tools:
  Browser Tools:
    - browser-launch - Launch a new browser instance
    - browser-navigate - Navigate to a URL
    - browser-interact - Interact with a page element
    - browser-evaluate - Execute JavaScript in the page context
    - devvit-iframe-eval - Execute JavaScript in the Devvit iframe
    - browser-close - Close the browser

  Playtest Tools:
    - start-playtest - Start a Devvit playtest
    - restart-playtest - Restart the current playtest
    - stop-playtest - Stop the current playtest
    - tail-logs - Get logs from the playtest
    - version - Get version information
`);
    
    program.parse(process.argv);
  } else {
    // Just start the server by default
    await runServer();
  }
}

// Run the application
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});