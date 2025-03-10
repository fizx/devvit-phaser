import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Service managers
import { BrowserManager } from "./services/browser.js";
import { PlaytestManager } from "./services/playtest.js";

// MCP server for Devvit-Phaser testing
export async function createServer() {
  // Initialize service managers
  const browserManager = new BrowserManager();
  const playtestManager = new PlaytestManager();

  // Create MCP server with explicit capabilities
  const server = new McpServer({
    name: "Devvit-Phaser Tester",
    version: "0.6.5", // Match the parent package version
    description: "Tools for testing Devvit-Phaser games"
  }, {
    capabilities: {
      tools: {}, // Enable tools capability
      resources: {} // Enable resources capability
    }
  });

  // Register resources
  registerResources(server, { browserManager, playtestManager });
  
  // Register tools
  registerTools(server, { browserManager, playtestManager });

  // Return the configured server
  return server;
}

// Start the MCP server with stdio transport
export async function startServer() {
  console.error("Starting Devvit-Phaser MCP server...");
  
  const server = await createServer();
  const transport = new StdioServerTransport();
  
  console.error("MCP server ready, waiting for connections");
  await server.connect(transport);
}

// Register all server resources
function registerResources(
  server: McpServer, 
  { browserManager, playtestManager }: { 
    browserManager: BrowserManager, 
    playtestManager: PlaytestManager 
  }
) {
  // Browser status resource
  server.resource(
    "browser-status",
    "browser://status",
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify(await browserManager.getStatus(), null, 2)
      }]
    })
  );

  // Playtest status resource
  server.resource(
    "playtest-status",
    "playtest://status",
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify(await playtestManager.getStatus(), null, 2)
      }]
    })
  );

  // Devvit logs resource
  server.resource(
    "devvit-logs",
    "logs://devvit",
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: await playtestManager.getLogs()
      }]
    })
  );
}

// Register all server tools
function registerTools(
  server: McpServer, 
  { browserManager, playtestManager }: { 
    browserManager: BrowserManager, 
    playtestManager: PlaytestManager 
  }
) {
  // Browser tools
  server.tool(
    "browser-launch",
    { headless: z.boolean().optional().default(true) },
    async ({ headless }) => {
      const result = await browserManager.launch({ headless });
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "browser-navigate",
    { url: z.string().url() },
    async ({ url }) => {
      const result = await browserManager.navigate(url);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "browser-interact",
    { 
      action: z.enum(["click", "type", "press"]),
      selector: z.string(),
      value: z.string().optional()
    },
    async ({ action, selector, value }) => {
      const result = await browserManager.interact(action, selector, value);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "browser-evaluate",
    { script: z.string() },
    async ({ script }) => {
      const result = await browserManager.evaluate(script);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "browser-close",
    {},
    async () => {
      const result = await browserManager.close();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  // Playtest tools
  server.tool(
    "start-playtest",
    { 
      community: z.string(),
      path: z.string().optional().default(".")
    },
    async ({ community, path }) => {
      const result = await playtestManager.start(community, path);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "restart-playtest",
    {},
    async () => {
      const result = await playtestManager.restart();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );

  server.tool(
    "stop-playtest",
    {},
    async () => {
      const result = await playtestManager.stop();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
      };
    }
  );
}