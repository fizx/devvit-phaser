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
   * 2. We directly use iframe.contentWindow.postMessage to send messages
   * 3. We listen for responses on the window message event
   * 
   * This approach bypasses the WebView element's message handling which was
   * causing issues with the custom event approach.
   */
  async callDevvitFunction(functionName: string, args: any[] = []): Promise<BrowserResponse> {
    try {
      if (!this.browser || !this.page) {
        return {
          success: false,
          message: "Browser is not running. Launch it first."
        };
      }

      // Use direct iframe.contentWindow.postMessage to communicate with the iframe
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
          
          // Function to handle the window message response
          function messageHandler(event: MessageEvent) {
            const data = event.data;
            
            // Only handle messages with our requestId
            if (data && data.requestId === requestId) {
              console.log('Response received via window message:', data);
              
              // Clean up
              window.removeEventListener('message', messageHandler);
              clearTimeout(timeoutId);
              
              if (data.type === 'devvit_debug_result') {
                resolve({ 
                  success: true, 
                  result: data.result,
                  method: "direct_iframe" 
                });
              } else if (data.type === 'devvit_debug_error') {
                resolve({ 
                  success: false, 
                  error: `Function error: ${data.error}`,
                  method: "direct_iframe" 
                });
              }
            }
          }
          
          // Set up timeout
          timeoutId = window.setTimeout(() => {
            window.removeEventListener('message', messageHandler);
            resolve({ 
              success: false, 
              error: "Timeout waiting for iframe response. Make sure DebugEndpoint.start() is called in your client code.",
              method: "direct_iframe" 
            });
          }, 5000) as unknown as number;
          
          // Listen for the window message response
          window.addEventListener('message', messageHandler);
          
          // Send message directly to iframe.contentWindow
          const message = {
            type: 'devvit_debug_call',
            requestId: requestId,
            functionName: fnName,
            args: fnArgs
          };
          
          try {
            // Use iframe.contentWindow.postMessage directly
            if (!iframe.contentWindow) {
              throw new Error('iframe.contentWindow is null');
            }
            iframe.contentWindow.postMessage(message, '*');
            console.log(`Sent function call directly to iframe.contentWindow: ${fnName}(${JSON.stringify(fnArgs)}), waiting for response...`);
          } catch (error) {
            console.error('Error sending message to iframe:', error);
            window.removeEventListener('message', messageHandler);
            clearTimeout(timeoutId);
            resolve({ 
              success: false, 
              error: `Error sending message to iframe: ${String(error)}`,
              method: "direct_iframe_error" 
            });
          }
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