import { Browser, BrowserContext, chromium, Page } from "playwright";

// Possible browser interaction actions
type InteractionAction = "click" | "type" | "press";

// Browser status type
interface BrowserStatus {
  isRunning: boolean;
  currentUrl?: string;
  title?: string;
}

// Response structure
interface BrowserResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Manages browser automation for testing
 */
export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  /**
   * Get current browser status
   */
  async getStatus(): Promise<BrowserStatus> {
    if (!this.browser || !this.page) {
      return { isRunning: false };
    }

    try {
      const currentUrl = this.page.url();
      const title = await this.page.title();
      
      return {
        isRunning: true,
        currentUrl,
        title
      };
    } catch (error) {
      return { isRunning: false };
    }
  }

  /**
   * Launch a browser instance
   */
  async launch({ headless = true }: { headless?: boolean } = {}): Promise<BrowserResponse> {
    try {
      if (this.browser) {
        return {
          success: false,
          message: "Browser is already running. Close it first before launching a new one."
        };
      }

      this.browser = await chromium.launch({ 
        headless 
      });
      
      this.context = await this.browser.newContext();
      this.page = await this.context.newPage();

      return {
        success: true,
        message: "Browser launched successfully",
        data: {
          headless
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to launch browser: ${errorMessage}`
      };
    }
  }

  /**
   * Navigate to a URL
   */
  async navigate(url: string): Promise<BrowserResponse> {
    try {
      if (!this.browser || !this.page) {
        return {
          success: false,
          message: "Browser is not running. Launch it first."
        };
      }

      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      const title = await this.page.title();

      return {
        success: true,
        message: `Navigated to ${url}`,
        data: {
          url,
          title
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to navigate: ${errorMessage}`
      };
    }
  }

  /**
   * Interact with page elements
   */
  async interact(
    action: InteractionAction, 
    selector: string, 
    value?: string
  ): Promise<BrowserResponse> {
    try {
      if (!this.browser || !this.page) {
        return {
          success: false,
          message: "Browser is not running. Launch it first."
        };
      }

      // Wait for the selector to be available
      await this.page.waitForSelector(selector, { timeout: 5000 });

      // Perform the requested action
      switch (action) {
        case "click":
          await this.page.click(selector);
          break;
        case "type":
          if (!value) {
            return {
              success: false,
              message: "Value is required for 'type' action"
            };
          }
          await this.page.fill(selector, value);
          break;
        case "press":
          if (!value) {
            return {
              success: false,
              message: "Key is required for 'press' action"
            };
          }
          await this.page.press(selector, value);
          break;
      }

      return {
        success: true,
        message: `Successfully performed ${action} on ${selector}`,
        data: { action, selector, value }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Interaction failed: ${errorMessage}`
      };
    }
  }

  /**
   * Evaluate JavaScript in the page context
   */
  async evaluate(script: string): Promise<BrowserResponse> {
    try {
      if (!this.browser || !this.page) {
        return {
          success: false,
          message: "Browser is not running. Launch it first."
        };
      }

      // Evaluate the script in the page context
      const result = await this.page.evaluate(script);

      return {
        success: true,
        message: "Script executed successfully",
        data: { result }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Script evaluation failed: ${errorMessage}`
      };
    }
  }

  /**
   * Evaluate JavaScript in the Devvit iframe
   * 
   * This uses the DebugEndpoint we added to devvit-phaser to run code in the iframe context
   */
  async evaluateInDevvitIframe(code: string): Promise<BrowserResponse> {
    try {
      if (!this.browser || !this.page) {
        return {
          success: false,
          message: "Browser is not running. Launch it first."
        };
      }

      // Set up the handler for receiving messages from the iframe
      const setupScript = `
        // Create a promise to receive the result
        window.__devvitEvalPromise = new Promise((resolve) => {
          // Set up the message handler
          window.__devvitMessageHandler = (event) => {
            if (event.data && (event.data.type === 'devvit_debug_result' || event.data.type === 'devvit_debug_error')) {
              // Remove the event listener
              window.removeEventListener('message', window.__devvitMessageHandler);
              // Resolve with the result or error
              resolve({
                type: event.data.type,
                result: event.data.result,
                error: event.data.error
              });
            }
          };
          
          // Add the event listener
          window.addEventListener('message', window.__devvitMessageHandler);
        });
      `;
      
      // Set up the code execution in the Devvit iframe
      const executeScript = `
        // Helper function to find the Devvit iframe
        function findDevvitIframe() {
          // Start with the UI loader
          const uiLoader = document.querySelector('shreddit-devvit-ui-loader');
          if (!uiLoader || !uiLoader.shadowRoot) return null;
          
          // Find the blocks renderer
          const blocksRenderer = uiLoader.shadowRoot.querySelector('devvit-blocks-renderer');
          if (!blocksRenderer || !blocksRenderer.shadowRoot) return null;
          
          // Find the web view
          const webView = blocksRenderer.shadowRoot.querySelector('devvit-blocks-web-view');
          if (!webView || !webView.shadowRoot) return null;
          
          // Find the iframe
          return webView.shadowRoot.querySelector('iframe');
        }
        
        // Find the iframe
        const iframe = findDevvitIframe();
        if (!iframe) {
          return { error: "Could not find Devvit iframe" };
        }
        
        // Send the message to the iframe
        iframe.contentWindow.postMessage({
          type: 'devvit_debug_eval',
          requestId: 'mcp-' + Date.now(),
          code: ${JSON.stringify(code)}
        }, '*');
        
        // Wait for the response
        const result = await window.__devvitEvalPromise;
        return result;
      `;

      // Set up the handler
      await this.page.evaluate(setupScript);
      
      // Execute the code and wait for the result
      const result = await this.page.evaluate(executeScript);

      if (result.error) {
        return {
          success: false,
          message: `Error in Devvit iframe: ${result.error}`,
          data: { error: result.error }
        };
      }

      return {
        success: true,
        message: "Code executed successfully in Devvit iframe",
        data: { result: result.result }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to evaluate in Devvit iframe: ${errorMessage}`
      };
    }
  }

  /**
   * Close the browser
   */
  async close(): Promise<BrowserResponse> {
    try {
      if (!this.browser) {
        return {
          success: false,
          message: "No browser is running"
        };
      }

      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.page = null;

      return {
        success: true,
        message: "Browser closed successfully"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to close browser: ${errorMessage}`
      };
    }
  }
}