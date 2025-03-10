#!/usr/bin/env node
import { Command } from 'commander';
import { startServer } from './server.js';
import chalk from 'chalk';

const program = new Command();

program
  .name('devvit-phaser-mcp')
  .description('MCP server for testing Devvit-Phaser games')
  .version('0.1.0');

program
  .command('start')
  .description('Start the MCP server')
  .action(async () => {
    console.log(chalk.blue('Starting Devvit-Phaser MCP server'));
    try {
      await startServer();
    } catch (error) {
      console.error(chalk.red('Error starting MCP server:'), error);
      process.exit(1);
    }
  });

program.parse(process.argv);

// Default to the start command if no command is specified
if (!process.argv.slice(2).length) {
  program.commands.find(c => c.name() === 'start')?.action();
}