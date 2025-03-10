#!/usr/bin/env node
import { Command } from 'commander';
import { startServer } from './server.js';
import chalk from 'chalk';

// Check for explicit help request
const isHelpRequested = process.argv.slice(2).some(arg => 
  arg === '--help' || arg === '-h' || arg === 'help'
);

// If help is requested, use Commander normally
if (isHelpRequested) {
  const program = new Command();
  
  program
    .name('devvit-phaser-mcp')
    .description('MCP server for testing Devvit-Phaser games')
    .version('0.1.1');
  
  program
    .command('start', { isDefault: true })
    .description('Start the MCP server')
    .action(async () => {
      await runServer();
    });
  
  program.parse(process.argv);
} else {
  // Just start the server by default
  runServer();
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