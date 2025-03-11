import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Service managers
import { BrowserManager } from "./services/browser.js";
import { PlaytestManager } from "./services/playtest.js";
import { VersionManager } from "./services/version.js";

// MCP server for Devvit-Phaser testing
export async function createServer() {
  // Initialize service managers
  const browserManager = new BrowserManager();
  const playtestManager = new PlaytestManager();
  const versionManager = new VersionManager();
  
  // Get package version for MCP server info
  const versionInfo = await versionManager.getVersionInfo();

  // Create MCP server with explicit capabilities
  const server = new McpServer({
    name: "Devvit-Phaser Tester",
    version: versionInfo.devvitPhaser, // Use the actual package version
    description: "Tools for testing Devvit-Phaser games"
  }, {
    capabilities: {
      tools: {}, // Enable tools capability
      resources: {} // Enable resources capability
    }
  });

  // Register resources
  registerResources(server, { browserManager, playtestManager, versionManager });
  
  // Register tools
  registerTools(server, { browserManager, playtestManager, versionManager });

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
  { browserManager, playtestManager, versionManager }: { 
    browserManager: BrowserManager, 
    playtestManager: PlaytestManager,
    versionManager: VersionManager
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
  
  // Version info resource
  server.resource(
    "version-info",
    "version://info",
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: JSON.stringify(await versionManager.getVersionInfo(), null, 2)
      }]
    })
  );
}

// Register all server tools
function registerTools(
  server: McpServer, 
  { browserManager, playtestManager, versionManager }: { 
    browserManager: BrowserManager, 
    playtestManager: PlaytestManager,
    versionManager: VersionManager
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

  // Devvit iframe eval tool
  server.tool(
    "devvit-iframe-eval",
    { code: z.string() },
    async ({ code }) => {
      const result = await browserManager.evaluateInDevvitIframe(code);
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
  
  // Tool to get MCP server and devvit-phaser version info
  server.tool(
    "version",
    { 
      format: z.enum(["json", "text"]).optional().default("text") 
    },
    async ({ format }) => {
      const versionInfo = await versionManager.getVersionInfo();
      
      if (format === "json") {
        return {
          content: [{ type: "text", text: JSON.stringify(versionInfo, null, 2) }]
        };
      } else {
        // Format as readable text
        const lines = [
          `Devvit-Phaser v${versionInfo.devvitPhaser}`,
          `MCP Server v${versionInfo.mcpServer}`,
          `Node.js ${versionInfo.node}`,
          `Devvit API ${versionInfo.devvitApi}`,
          '',
          'Dependencies:',
          ...Object.entries(versionInfo.dependencies).map(([name, version]) => `  ${name}: ${version}`)
        ];
        
        return {
          content: [{ type: "text", text: lines.join('\n') }]
        };
      }
    }
  );
  
  // Tool to get logs from the playtest server
  server.tool(
    "tail-logs",
    { 
      lines: z.number().optional().default(100) 
    },
    async ({ lines }) => {
      const logs = await playtestManager.getLogs(lines);
      return {
        content: [{ type: "text", text: logs }]
      };
    }
  );
}