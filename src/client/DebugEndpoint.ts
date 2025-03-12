/**
 * A simple debug endpoint that allows executing predefined functions in the Devvit iframe
 * for testing purposes, avoiding CSP restrictions.
 */
export class DebugEndpoint {
  private static isActive = false;
  private static registeredFunctions: Record<string, (...args: any[]) => any> = {
    // Default built-in functions
    modifyBody: (html: string) => {
      document.body.innerHTML = html;
      return 'Body modified successfully';
    },
    getDocumentTitle: () => document.title,
    getElementContent: (selector: string) => {
      const element = document.querySelector(selector);
      return element ? element.textContent : null;
    },
    getElementHTML: (selector: string) => {
      const element = document.querySelector(selector);
      return element ? element.innerHTML : null;
    },
    clickElement: (selector: string) => {
      const element = document.querySelector(selector);
      if (element) {
        (element as HTMLElement).click();
        return true;
      }
      return false;
    },
    executeScript: (script: string) => {
      // This is a Function constructor approach which may work in some contexts
      // where eval() is blocked. It's not guaranteed to work with all CSP configurations.
      try {
        // Create a new function from the string and execute it
        return new Function(script)();
      } catch (error) {
        console.error('Script execution error:', error);
        throw error;
      }
    }
  };

  /**
   * Starts the debug endpoint with optional additional functions
   * 
   * @param options Configuration options
   * @param options.functions Additional functions to register
   */
  public static start(options?: { functions?: Record<string, (...args: any[]) => any> }) {
    if (this.isActive) return;
    
    // Register additional functions if provided
    if (options?.functions) {
      this.registeredFunctions = {
        ...this.registeredFunctions,
        ...options.functions
      };
    }
    
    console.log('About to initialize DebugEndpoint...');
    
    window.addEventListener('message', (event) => {
      try {
        const data = event.data;
        console.log('Message received:', JSON.stringify(data));
        
        // Function call handling
        if (data && data.type === 'devvit_debug_call') {
          const { functionName, args = [], requestId } = data;
          console.log(`Received debug call: ${functionName}(${args.map((a: any) => JSON.stringify(a)).join(', ')})`);
          
          if (this.registeredFunctions[functionName]) {
            // Call the registered function with provided arguments
            const result = this.registeredFunctions[functionName](...(args || []));
            
            // Create the response message
            const responseMessage = {
              type: 'devvit_debug_result',
              requestId: requestId,
              result: result
            };
            
            // Send result back to parent with detailed logging
            console.log('About to send debug result with ID:', requestId);
            window.parent.postMessage(responseMessage, '*');
            
            // Log after sending to help debug issues
            console.log('Debug result sent back to parent. Message:', JSON.stringify(responseMessage));
            console.log('Result data:', result);
          } else {
            // Function not found
            throw new Error(`Function '${functionName}' not registered with DebugEndpoint`);
          }
        }
        // For legacy support, redirect eval requests to the executeScript function
        else if (data && data.type === 'devvit_debug_eval') {
          console.log('Received legacy debug eval command, redirecting to executeScript function');
          
          try {
            // Use the executeScript function instead of direct eval
            const result = this.registeredFunctions.executeScript(data.code);
            
            // Create the response message
            const responseMessage = {
              type: 'devvit_debug_result',
              requestId: data.requestId,
              result: result
            };
            
            // Send with detailed logging
            console.log('About to send eval result with ID:', data.requestId);
            window.parent.postMessage(responseMessage, '*');
            
            // Log after sending
            console.log('Eval result sent back to parent. Message:', JSON.stringify(responseMessage));
          } catch (error) {
            console.error('Script execution error:', error);
            
            // Create the error message
            const errorMessage = {
              type: 'devvit_debug_error',
              requestId: data.requestId,
              error: error instanceof Error ? error.toString() : String(error)
            };
            
            // Send with detailed logging
            console.log('About to send error response with ID:', data.requestId);
            window.parent.postMessage(errorMessage, '*');
            
            // Log after sending
            console.log('Error sent back to parent. Message:', JSON.stringify(errorMessage));
          }
        }
      } catch (error: unknown) {
        console.error('Error in debug endpoint:', error);
        
        // Create the error message
        const errorMessage = {
          type: 'devvit_debug_error',
          requestId: event.data?.requestId,
          error: error instanceof Error ? error.toString() : String(error)
        };
        
        // Send with detailed logging
        console.log('About to send global error with ID:', event.data?.requestId);
        window.parent.postMessage(errorMessage, '*');
        
        // Log after sending
        console.log('Global error sent back to parent. Message:', JSON.stringify(errorMessage));
      }
    });
    
    this.isActive = true;
    console.log('DebugEndpoint initialized successfully');
  }
  
  /**
   * Register additional functions that can be called from the parent window
   */
  public static registerFunctions(functions: Record<string, (...args: any[]) => any>) {
    this.registeredFunctions = {
      ...this.registeredFunctions,
      ...functions
    };
    console.log('Registered additional functions:', Object.keys(functions));
  }
}