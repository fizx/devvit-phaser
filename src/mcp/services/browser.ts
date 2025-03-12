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
  private pendingResponses: Map<string, { 
    resolve: (value: any) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

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
   * @param options Configuration options
   * @param options.headless Whether to run browser in headless mode (default: true)
   * @param options.disableSecurity Whether to disable web security (default: false)
   */
  async launch({ headless = true, disableSecurity = false }: { 
    headless?: boolean,
    disableSecurity?: boolean
  } = {}): Promise<BrowserResponse> {
    try {
      if (this.browser) {
        return {
          success: false,
          message: "Browser is already running. Close it first before launching a new one."
        };
      }

      // Launch browser with specified options
      this.browser = await chromium.launch({ 
        headless,
        args: disableSecurity ? ['--disable-web-security'] : []
      });
      
      // Create context with specified options
      this.context = await this.browser.newContext({
        ignoreHTTPSErrors: disableSecurity
      });
      
      this.page = await this.context.newPage();
      
      // Set up exposed function to handle iframe messages
      await this.setupExposedFunctions();

      return {
        success: true,
        message: "Browser launched successfully",
        data: {
          headless,
          disableSecurity
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
   * Call a predefined function in the Devvit iframe context
   * This is a safer alternative to using direct code evaluation
   * 
   * Communication mechanism:
   * 1. We find the iframe element in the shadow DOM
   * 2. We directly use iframe.contentWindow.postMessage to send messages IN
   * 3. We listen for responses on the 'devvit-web-view-message' custom event OUT via an exposed function
   * 
   * This approach uses:
   * - Direct iframe.contentWindow.postMessage for sending
   * - page.exposeFunction + custom events for receiving
   * - Promise-based response tracking outside the evaluate call
   */
  async callDevvitFunction(functionName: string, args: any[] = []): Promise<BrowserResponse> {
    try {
      if (!this.browser || !this.page) {
        return {
          success: false,
          message: "Browser is not running. Launch it first."
        };
      }

      // Generate a unique request ID
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a promise that will be resolved when we receive a response
      const responsePromise = new Promise<any>((resolve) => {
        // Set up timeout to handle cases where we don't get a response
        const timeout = setTimeout(() => {
          // If we timeout, resolve with an error
          resolve({ 
            success: false, 
            error: "Timeout waiting for iframe response. Make sure DebugEndpoint.start() is called in your client code."
          });
          // Remove this request from the pending responses map
          this.pendingResponses.delete(requestId);
        }, 5000);
        
        // Store the resolve function and timeout so we can cancel it when we get a response
        this.pendingResponses.set(requestId, { resolve, timeout });
      });
      
      // Send the message to the iframe - this is just the sending part
      const sendResult = await this.page.evaluate(async ({ fnName, fnArgs, reqId }) => {
        try {
          // Find the iframe through shadow DOM
          const devvitLoader = document.querySelector("shreddit-devvit-ui-loader");
          if (!devvitLoader) {
            return { success: false, error: "No devvit loader found" };
          }

          const surface = devvitLoader.shadowRoot?.querySelector("devvit-surface");
          if (!surface) {
            return { success: false, error: "No surface found" };
          }

          const renderer = surface.shadowRoot?.querySelector("devvit-blocks-renderer");
          if (!renderer) {
            return { success: false, error: "No renderer found" };
          }

          const webView = renderer.shadowRoot?.querySelector("devvit-blocks-web-view");
          if (!webView) {
            return { success: false, error: "No web view found" };
          }

          const iframe = webView.shadowRoot?.querySelector("iframe");
          if (!iframe) {
            return { success: false, error: "No iframe found" };
          }
          
          if (!iframe.contentWindow) {
            return { success: false, error: "iframe.contentWindow is null" };
          }
          
          // Create the message to send
          const message = {
            type: 'devvit_debug_call',
            requestId: reqId,
            functionName: fnName,
            args: fnArgs
          };
          
          // Use iframe.contentWindow.postMessage directly for sending
          iframe.contentWindow.postMessage(message, '*');
          console.log(`Sent function call to iframe.contentWindow: ${fnName}(${JSON.stringify(fnArgs)}), requestId: ${reqId}`);
          
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: `Error sending message to iframe: ${String(error)}`
          };
        }
      }, { fnName: functionName, fnArgs: args, reqId: requestId });
      
      // If we failed to send the message, return an error
      if (!sendResult.success) {
        // Remove this request from the pending responses map
        if (this.pendingResponses.has(requestId)) {
          const { timeout } = this.pendingResponses.get(requestId)!;
          clearTimeout(timeout);
          this.pendingResponses.delete(requestId);
        }
        
        return {
          success: false,
          message: `Failed to send message to iframe: ${sendResult.error || 'Unknown error'}`,
          data: { functionName, args }
        };
      }
      
      // Wait for the response via our exposed function - this happens outside the evaluate call
      const result = await responsePromise;
      
      // Handle the result
      if (result && typeof result === 'object') {
        if (result.type === 'devvit_debug_result') {
          return {
            success: true,
            message: `Function ${functionName} executed successfully in Devvit iframe`,
            data: { result: result.result }
          };
        } else if (result.type === 'devvit_debug_error') {
          return {
            success: false,
            message: `Function call failed: ${result.error || 'Unknown error'}`,
            data: { functionName, args }
          };
        } else if ('error' in result) {
          return {
            success: false,
            message: `Function call failed: ${result.error || 'Unknown error'}`,
            data: { functionName, args }
          };
        }
      }
      
      return {
        success: false,
        message: "Unexpected result format from function call",
        data: { result }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Devvit function call failed: ${errorMessage}`
      };
    }
  }

  /**
   * Setup exposed functions in Playwright to handle message passing
   * This allows us to receive messages from the iframe even in isolated contexts
   */
  private async setupExposedFunctions(): Promise<void> {
    if (!this.page) return;
    
    // Expose a function to handle devvit iframe responses
    await this.page.exposeFunction('__handleDevvitIframeResponse', (data: any) => {
      // Check if we have a pending response with this requestId
      const requestId = data?.requestId;
      if (!requestId || !this.pendingResponses.has(requestId)) {
        console.log('Received response for unknown requestId:', requestId);
        return;
      }
      
      const { resolve, timeout } = this.pendingResponses.get(requestId)!;
      
      // Clear the timeout and delete the pending response
      clearTimeout(timeout);
      this.pendingResponses.delete(requestId);
      
      // Resolve the promise with the response data
      resolve(data);
    });
    
    // Set up a custom event listener in the page that will call our exposed function
    await this.page.evaluate(() => {
      // Function to handle custom events from the webView
      function handleCustomEvent(event: CustomEvent) {
        const data = event.detail;
        // Forward the event data to our exposed function
        // @ts-ignore - This function exists but TS doesn't know about it
        window.__handleDevvitIframeResponse(data);
      }
      
      // Add event listener to window to catch all custom events
      window.addEventListener('devvit-web-view-message', handleCustomEvent as EventListener);
      
      console.log('Devvit iframe message handler installed successfully');
    });
  }

  /**
   * Get browser console logs using Chrome DevTools Protocol
   * @param limit Maximum number of log entries to return (default: 100)
   */
  async getLogs(limit: number = 100): Promise<BrowserResponse> {
    try {
      if (!this.browser || !this.page) {
        return {
          success: false,
          message: "Browser is not running. Launch it first."
        };
      }

      // Use CDP session to extract logs from the browser's console
      const logs = await this.page.evaluate(async (maxCount) => {
        // Properly typed logs array
        const logEntries: Array<{
          type: string;
          timestamp: string;
          text: string;
          url?: string;
          source?: string;
        }> = [];

        // Current time to help identify recent logs
        const now = Date.now();
        
        // Try to access browser console logs
        try {
          // Use the Console API to access browser's console message history
          // @ts-ignore - Console API exists but might not be in type definitions
          const messages = await console.messages?.();
          
          if (messages && messages.length) {
            for (const msg of messages) {
              logEntries.push({
                type: msg.level || msg.type || 'log',
                timestamp: new Date(msg.timestamp || now).toISOString(),
                text: msg.text || String(msg.args || msg.message || ''),
                source: msg.source || 'console',
                url: msg.url
              });
            }
          }
        } catch (e) {
          // If the console API doesn't work, try something else
          console.error('Failed to access console messages:', e);
        }
        
        // If we don't have any logs yet or need more, add performance logs
        if (logEntries.length < maxCount) {
          try {
            // Try to get logs from the performance API
            const perfEntries = performance.getEntries();
            for (const entry of perfEntries) {
              if (logEntries.length >= maxCount) break;
              
              // Only include certain types of performance entries that might be useful
              if (entry.entryType === 'resource' || entry.entryType === 'navigation') {
                logEntries.push({
                  type: 'performance',
                  timestamp: new Date(entry.startTime).toISOString(),
                  text: `${entry.entryType}: ${entry.name} (duration: ${entry.duration}ms)`,
                  source: 'performance',
                  url: entry.name
                });
              }
            }
          } catch (e) {
            console.error('Failed to access performance entries:', e);
          }
        }
        
        // Generate a log entry for the current request to make sure we have at least one
        logEntries.push({
          type: 'info',
          timestamp: new Date().toISOString(),
          text: 'Current browser logs requested',
          source: 'browser-logs-tool'
        });
        
        // Return the most recent logs based on the limit
        return logEntries.slice(-maxCount);
      }, limit);
      
      // Execute some additional JavaScript to generate logs we can capture on the next call
      await this.page.evaluate(() => {
        console.log('Browser logs retrieved at:', new Date().toISOString());
        console.info('URL:', window.location.href);
        
        // Log some browser details
        console.debug('UserAgent:', navigator.userAgent);
        console.debug('Screen:', `${window.innerWidth}x${window.innerHeight}`);
        
        // Performance info for debugging
        try {
          // Chrome-specific memory info (not standard)
          const perfAny = performance as any;
          if (perfAny && perfAny.memory) {
            console.info('Memory:', {
              jsHeapSizeLimit: perfAny.memory.jsHeapSizeLimit,
              totalJSHeapSize: perfAny.memory.totalJSHeapSize,
              usedJSHeapSize: perfAny.memory.usedJSHeapSize
            });
          }
        } catch (e) {
          // Memory info not available
        }
      });
      
      return {
        success: true,
        message: `Retrieved ${logs.length} log entries`,
        data: { logs }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to get browser logs: ${errorMessage}`
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

      // Clear any pending responses
      for (const { timeout } of this.pendingResponses.values()) {
        clearTimeout(timeout);
      }
      this.pendingResponses.clear();

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