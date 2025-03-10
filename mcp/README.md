# Devvit-Phaser MCP Testing Server

This package provides a [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for testing Devvit-Phaser games. It allows LLM applications to control browser testing and manage Devvit playtesting.

## Features

- 🌐 **Browser Testing**: Launch, navigate, and interact with web browsers
- 🚀 **Devvit Playtest**: Start, monitor, and manage Devvit playtest environments
- 📊 **Log Access**: Stream and query Devvit playtest logs
- 🧩 **MCP Integration**: Use with any MCP-compatible client

## Installation

```bash
# Install the package dependencies
cd mcp
npm install

# Build the package
npm run build
```

## Usage

### Starting the Server

```bash
# Start the MCP server
node dist/cli.js
```

The server communicates via stdio, making it easy to integrate with MCP clients.

### MCP Resources

| Resource | Description |
|----------|-------------|
| `browser://status` | Current browser status (running, URL, title) |
| `playtest://status` | Current playtest status (running, community, uptime) |
| `logs://devvit` | Recent logs from the Devvit playtest process |

### MCP Tools

#### Browser Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `browser-launch` | `headless` (optional boolean) | Launch a new browser instance |
| `browser-navigate` | `url` (string) | Navigate to a URL |
| `browser-interact` | `action` ("click", "type", "press"), `selector` (string), `value` (optional string) | Interact with a page element |
| `browser-evaluate` | `script` (string) | Evaluate JavaScript in the page context |
| `browser-close` | - | Close the browser |

#### Playtest Tools

| Tool | Parameters | Description |
|------|------------|-------------|
| `start-playtest` | `community` (string), `path` (optional string) | Start a Devvit playtest for a community |
| `restart-playtest` | - | Restart the current playtest |
| `stop-playtest` | - | Stop the current playtest |

## Example Queries

Here are some example MCP queries to use with this server:

```json
{
  "method": "read_resource",
  "params": {
    "uri": "browser://status"
  }
}
```

```json
{
  "method": "call_tool",
  "params": {
    "name": "browser-launch",
    "arguments": {
      "headless": false
    }
  }
}
```

```json
{
  "method": "call_tool",
  "params": {
    "name": "start-playtest",
    "arguments": {
      "community": "reddit_dev"
    }
  }
}
```

## Integration with LLMs

This MCP server is designed to be used with LLM applications that support the Model Context Protocol. It allows LLMs to control and monitor testing processes for Devvit-Phaser games.

## Requirements

- Node.js 18+
- Playwright (for browser automation)
- Devvit CLI (for playtest functionality)