# Devvit-Phaser Documentation

Welcome to the Devvit-Phaser documentation! This library helps you build multiplayer Phaser.js games for Reddit's Devvit platform with minimal effort.

## Getting Started

- [Installation & Setup](./getting-started.md) - Create your first Devvit-Phaser game
- [Understanding Data Flow](./data-flow.md) - Learn how data synchronization works

## API Reference

- [API Documentation](./api/index.html) - Complete reference for all classes and types

## Components

### Core Components

- **BasicGameServer** - The foundation for Devvit games with player management and realtime communication
- **PhaserGameServer** - Extends BasicGameServer with Phaser-specific synchronization features

### Client-Side Components

- **SyncedDataManager** - Client component that extends Phaser's DataManager with server synchronization

### Server-Side Components

- **DataManagerServer** - Server component for persisting and broadcasting game state

## Tutorials

- [Getting Started](./getting-started.md) - Build a simple multiplayer asteroids game
- [Data Flow](./data-flow.md) - Deep dive into how data flows between clients and the server

## Examples

Check out the [examples directory](https://github.com/fizx/devvit-phaser/tree/main/examples) in the repository for complete working examples:

- **Asteroids** - A multiplayer asteroids game
- **Chess** - Turn-based game example
- **Platformer** - Side-scrolling platformer with multiplayer

## GitHub Repository

Visit the [GitHub repository](https://github.com/fizx/devvit-phaser) for:

- Source code
- Issue tracking
- Pull requests
- Contributing guidelines

## npm Package

Install from npm:

```bash
npm install devvit-phaser
```

[View on npm](https://www.npmjs.com/package/devvit-phaser)