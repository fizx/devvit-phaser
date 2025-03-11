/**
 * A simple debug endpoint that allows evaluating code in the Devvit iframe
 * for testing purposes.
 */
export class DebugEndpoint {
  private static isActive = false;

  /**
   * Starts the debug endpoint, which listens for messages from the parent window
   * and evaluates code sent in those messages.
   */
  public static start() {
    if (this.isActive) return;
    
    window.addEventListener('message', (event) => {
      try {
        const data = event.data;
        
        // Check if this is a debug command
        if (data && data.type === 'devvit_debug_eval') {
          console.log('Received debug eval command:', data.code);
          
          // Execute the code
          const result = eval(data.code);
          
          // Send result back to parent
          window.parent.postMessage({
            type: 'devvit_debug_result',
            requestId: data.requestId,
            result: result
          }, '*');
          
          console.log('Debug result sent back to parent');
        }
      } catch (error: unknown) {
        console.error('Error in debug endpoint:', error);
        
        // Send error back to parent
        window.parent.postMessage({
          type: 'devvit_debug_error',
          requestId: event.data?.requestId,
          error: error instanceof Error ? error.toString() : String(error)
        }, '*');
      }
    });
    
    this.isActive = true;
    console.log('DebugEndpoint activated and listening for messages');
  }
}