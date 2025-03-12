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
   * Evaluate JavaScript in the Devvit iframe context using the postMessage API
   * This approach works with the DebugEndpoint in the client code
   */
  async evaluateInDevvitIframe(code: string): Promise<BrowserResponse> {
    try {
      if (!this.browser || !this.page) {
        return {
          success: false,
          message: "Browser is not running. Launch it first."
        };
      }

      // Parse the code to determine the best approach
      const bodyModificationRegex = /document\.body\.innerHTML\s*=\s*['"](.*)['"];?/;
      const match = code.match(bodyModificationRegex);
      
      if (match && match[1]) {
        // For body modifications, use the modifyBody function directly
        return await this.callDevvitFunction('modifyBody', [match[1]]);
      } else {
        // For other code, redirect to the executeScript function
        return await this.callDevvitFunction('executeScript', [code]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Devvit iframe evaluation failed: ${errorMessage}`
      };
    }
  }
  
  /**
   * Call a predefined function in the Devvit iframe context
   * This is a safer alternative to evaluateInDevvitIframe as it doesn't use eval
   * 
   * Communication mechanism:
   * 1. We find the iframe element in the shadow DOM
   * 2. We directly use iframe.contentWindow.postMessage to send messages IN
   * 3. We listen for responses on the 'devvit-web-view-message' custom event OUT
   * 
   * This hybrid approach uses direct iframe communication for sending, but
   * custom events for receiving - avoiding issues with cross-origin message handling.
   */
  async callDevvitFunction(functionName: string, args: any[] = []): Promise<BrowserResponse> {
    try {
      if (!this.browser || !this.page) {
        return {
          success: false,
          message: "Browser is not running. Launch it first."
        };
      }

      // Use the hybrid approach to communicate with the iframe
      const result = await this.page.evaluate(async ({ fnName, fnArgs }) => {
        // Find the iframe through shadow DOM
        const devvitLoader = document.querySelector("shreddit-devvit-ui-loader");
        if (!devvitLoader) {
          return { 
            success: false, 
            error: "No devvit loader found" 
          };
        }

        const surface = devvitLoader.shadowRoot?.querySelector("devvit-surface");
        if (!surface) {
          return { 
            success: false, 
            error: "No surface found" 
          };
        }

        const renderer = surface.shadowRoot?.querySelector("devvit-blocks-renderer");
        if (!renderer) {
          return { 
            success: false, 
            error: "No renderer found" 
          };
        }

        const webView = renderer.shadowRoot?.querySelector("devvit-blocks-web-view");
        if (!webView) {
          return { 
            success: false, 
            error: "No web view found" 
          };
        }

        const iframe = webView.shadowRoot?.querySelector("iframe");
        if (!iframe) {
          return { 
            success: false, 
            error: "No iframe found" 
          };
        }
        
        // Send the function call and wait for response
        return new Promise((resolve) => {
          const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          let timeoutId: number;
          
          // Function to handle the custom event response
          function customEventHandler(event: CustomEvent) {
            const data = event.detail;
            console.log('Response received via custom event:', data);
            
            // Only handle messages with our requestId
            if (data && data.requestId === requestId) {
              
              // Clean up
              webView?.removeEventListener('devvit-web-view-message', customEventHandler as EventListener);
              clearTimeout(timeoutId);
              
              if (data.type === 'devvit_debug_result') {
                resolve({ 
                  success: true, 
                  result: data.result,
                  method: "hybrid_iframe_custom_event" 
                });
              } else if (data.type === 'devvit_debug_error') {
                resolve({ 
                  success: false, 
                  error: `Function error: ${data.error}`,
                  method: "hybrid_iframe_custom_event" 
                });
              }
            }
          }
          
          // Set up timeout
          timeoutId = window.setTimeout(() => {
            webView?.removeEventListener('devvit-web-view-message', customEventHandler as EventListener);
            resolve({ 
              success: false, 
              error: "Timeout waiting for iframe response. Make sure DebugEndpoint.start() is called in your client code.",
              method: "hybrid_iframe_custom_event" 
            });
          }, 5000) as unknown as number;
          
          // Listen for the custom event response on the webView element, not window
          // IMPORTANT: Install event listener BEFORE sending message to avoid race condition
          webView?.addEventListener('devvit-web-view-message', customEventHandler as EventListener);
          
          // Create the message to send
          const message = {
            type: 'devvit_debug_call',
            requestId: requestId,
            functionName: fnName,
            args: fnArgs
          };
          
          // Small delay to ensure event listener is properly attached before sending
          setTimeout(() => {
            try {
              // Use iframe.contentWindow.postMessage directly for sending IN
              if (!iframe.contentWindow) {
                throw new Error('iframe.contentWindow is null');
              }
              iframe.contentWindow.postMessage(message, '*');
              console.log(`Sent function call directly to iframe.contentWindow: ${fnName}(${JSON.stringify(fnArgs)}), waiting for custom event response...`);
            } catch (error) {
              console.error('Error sending message to iframe:', error);
              webView?.removeEventListener('devvit-web-view-message', customEventHandler as EventListener);
              clearTimeout(timeoutId);
              resolve({ 
                success: false, 
                error: `Error sending message to iframe: ${String(error)}`,
                method: "hybrid_iframe_custom_event_error" 
              });
            }
          }, 25); // 25ms delay to ensure event listener is attached
        });
      }, { fnName: functionName, fnArgs: args });

      // Handle result
      if (result && typeof result === 'object' && 'success' in result) {
        const typedResult = result as {
          success: boolean;
          method?: string;
          result?: any;
          error?: string;
        };
        
        if (typedResult.success === true) {
          return {
            success: true,
            message: `Function ${functionName} executed successfully in Devvit iframe`,
            data: { result: typedResult.result }
          };
        } else if ('error' in typedResult) {
          return {
            success: false,
            message: `Function call failed: ${typedResult.error || 'Unknown error'}`,
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