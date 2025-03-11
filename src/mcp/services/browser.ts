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
   * Evaluate JavaScript in the Devvit iframe context
   */
  async evaluateInDevvitIframe(code: string): Promise<BrowserResponse> {
    try {
      if (!this.browser || !this.page) {
        return {
          success: false,
          message: "Browser is not running. Launch it first."
        };
      }

      // Find the Devvit iframe through the known DOM structure
      const result = await this.page.evaluate((evalCode) => {
        try {
          // Find the devvit-ui-loader
          const loader = document.querySelector('shreddit-devvit-ui-loader');
          if (!loader || !loader.shadowRoot) {
            return { 
              success: false, 
              error: "Could not find shreddit-devvit-ui-loader or its shadowRoot" 
            };
          }
          
          // Find the web-view inside loader's shadow DOM
          const webView = loader.shadowRoot.querySelector('devvit-blocks-web-view');
          if (!webView || !webView.shadowRoot) {
            return { 
              success: false, 
              error: "Could not find devvit-blocks-web-view or its shadowRoot" 
            };
          }
          
          // Find the iframe inside web-view's shadow DOM
          const iframe = webView.shadowRoot.querySelector('iframe');
          if (!iframe || !iframe.contentWindow) {
            return { 
              success: false, 
              error: "Could not find iframe or its contentWindow" 
            };
          }
          
          // Execute the code in the iframe context
          try {
            // Using any to bypass TypeScript restrictions
            const result = (iframe.contentWindow as any).eval(evalCode);
            return { success: true, result };
          } catch (evalError) {
            return { 
              success: false, 
              error: evalError instanceof Error ? evalError.message : String(evalError) 
            };
          }
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : String(error) 
          };
        }
      }, code);

      // Handle different result scenarios
      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success === true) {
          return {
            success: true,
            message: "Script executed successfully in Devvit iframe",
            data: { result: result.result }
          };
        } else if ('error' in result) {
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
            message: `Devvit iframe evaluation failed: ${result.error}`,
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