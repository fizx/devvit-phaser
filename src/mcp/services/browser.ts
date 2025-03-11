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

      // This will use postMessage to communicate with the iframe
      const result = await this.page.evaluate(async (evalCode) => {
        // Helper function to recursively search for iframe in shadow DOM
        function findDevvitIframe(startElement: Element): HTMLIFrameElement | null {
          // If this is a web-view element with a shadow root that contains an iframe, return the iframe
          if (
            startElement.tagName.toLowerCase() === 'devvit-blocks-web-view' && 
            startElement.shadowRoot
          ) {
            const iframe = startElement.shadowRoot.querySelector('iframe');
            if (iframe) return iframe;
          }
          
          // If this element has a shadow root, search in its children
          if (startElement.shadowRoot) {
            // First check direct children
            const webView = startElement.shadowRoot.querySelector('devvit-blocks-web-view');
            if (webView) {
              const iframe = findDevvitIframe(webView);
              if (iframe) return iframe;
            }
            
            // Then try all children recursively
            const children = Array.from(startElement.shadowRoot.children);
            for (const child of children) {
              const iframe = findDevvitIframe(child);
              if (iframe) return iframe;
            }
          }
          
          return null;
        }

        // Find the iframe using various search strategies
        let targetIframe: HTMLIFrameElement | null = null;
        
        // Try direct approach
        const directLoader = document.querySelector('shreddit-devvit-ui-loader');
        if (directLoader?.shadowRoot) {
          const webView = directLoader.shadowRoot.querySelector('devvit-blocks-web-view');
          if (webView?.shadowRoot) {
            const iframe = webView.shadowRoot.querySelector('iframe');
            if (iframe) {
              console.log("Found iframe using direct approach");
              targetIframe = iframe;
            }
          }
        }
        
        // Try nested approach with renderer
        if (!targetIframe) {
          const origLoader = document.querySelector('shreddit-devvit-ui-loader');
          if (origLoader?.shadowRoot) {
            const renderer = origLoader.shadowRoot.querySelector('devvit-blocks-renderer');
            if (renderer?.shadowRoot) {
              const webView = renderer.shadowRoot.querySelector('devvit-blocks-web-view');
              if (webView?.shadowRoot) {
                const iframe = webView.shadowRoot.querySelector('iframe');
                if (iframe) {
                  console.log("Found iframe using original approach");
                  targetIframe = iframe;
                }
              }
            }
          }
        }
        
        // Try recursive search
        if (!targetIframe) {
          const shadowHosts = Array.from(document.querySelectorAll('*'))
            .filter(el => el.shadowRoot);
          
          for (const element of shadowHosts) {
            const iframe = findDevvitIframe(element);
            if (iframe) {
              console.log("Found iframe using recursive search");
              targetIframe = iframe;
              break;
            }
          }
        }
        
        // If we still don't have an iframe, return error
        if (!targetIframe) {
          return { 
            success: false, 
            error: "Could not find Devvit iframe" 
          };
        }
        
        // Found iframe, now use postMessage to communicate
        return new Promise((resolve) => {
          const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          let timeoutId: number;
          
          // Function to handle the response
          function messageHandler(event: MessageEvent) {
            const data = event.data;
            
            // Only handle messages with our requestId
            if (data && data.requestId === requestId) {
              // Clean up
              window.removeEventListener('message', messageHandler);
              clearTimeout(timeoutId);
              
              if (data.type === 'devvit_debug_result') {
                resolve({ 
                  success: true, 
                  result: data.result,
                  method: "postMessage" 
                });
              } else if (data.type === 'devvit_debug_error') {
                resolve({ 
                  success: false, 
                  error: `Eval error: ${data.error}`,
                  method: "postMessage" 
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
              method: "postMessage" 
            });
          }, 5000) as unknown as number;
          
          // Listen for response
          window.addEventListener('message', messageHandler);
          
          // Send the code to the iframe
          targetIframe.contentWindow?.postMessage({
            type: 'devvit_debug_eval',
            requestId: requestId,
            code: evalCode
          }, '*');
          
          console.log("Sent evaluation request to iframe, waiting for response...");
        });
      }, code);

      // Handle different result scenarios
      if (result && typeof result === 'object' && 'success' in result) {
        // Define a more specific type for better TypeScript support
        const typedResult = result as {
          success: boolean;
          method?: string;
          result?: any;
          error?: string;
        };
        
        if (typedResult.success === true) {
          return {
            success: true,
            message: `Script executed successfully in Devvit iframe (method: ${typedResult.method || 'unknown'})`,
            data: { result: typedResult.result }
          };
        } else if ('error' in typedResult) {
          // Fallback: Collect information about available frames
          const frameInfo = await this.page.evaluate(() => {
            const frames: any[] = [];
            
            // Get all iframes
            document.querySelectorAll('iframe').forEach((iframe: HTMLIFrameElement) => {
              frames.push({
                id: iframe.id,
                src: iframe.src,
                name: iframe.name
              });
            });
            
            // Try to find iframes in shadow DOM
            const shadowHosts = Array.from(document.querySelectorAll('*'))
              .filter(el => el.shadowRoot);
            
            const shadowInfo: any[] = [];
            shadowHosts.forEach(host => {
              const hostInfo = {
                tag: host.tagName,
                id: host.id,
                shadowChildren: [] as string[]
              };
              
              if (host.shadowRoot) {
                Array.from(host.shadowRoot.children).forEach(child => {
                  hostInfo.shadowChildren.push(child.tagName);
                });
                
                const shadowIframes = host.shadowRoot.querySelectorAll('iframe');
                shadowIframes.forEach(iframe => {
                  frames.push({
                    id: iframe.id,
                    src: iframe.src,
                    name: iframe.name,
                    inShadow: true,
                    host: host.tagName
                  });
                });
              }
              
              shadowInfo.push(hostInfo);
            });
            
            return { frames, shadowInfo };
          });
          
          return {
            success: false,
            message: `Devvit iframe evaluation failed: ${typedResult.error || 'Unknown error'}`,
            data: { frameInfo }
          };
        }
      }
      
      return {
        success: false,
        message: "Unexpected result format from evaluation",
        data: { result }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Devvit iframe evaluation failed: ${errorMessage}`
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