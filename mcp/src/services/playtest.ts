import { spawn, ChildProcess } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

// Playtest status type
interface PlaytestStatus {
  isRunning: boolean;
  community?: string;
  path?: string;
  pid?: number;
  uptime?: number;
  url?: string;
}

// Response structure
interface PlaytestResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Manages devvit playtest process
 */
export class PlaytestManager {
  private process: ChildProcess | null = null;
  private startTime: number = 0;
  private community: string = "";
  private projectPath: string = "";
  private logFile: string = "";
  private urlPattern = /Local:\s+(https?:\/\/[\w.-]+(?::\d+)?(?:\/[\w.-]+)*)/;

  /**
   * Get current playtest status
   */
  async getStatus(): Promise<PlaytestStatus> {
    if (!this.process || this.process.killed) {
      return { isRunning: false };
    }

    // Extract URL from logs if available
    const logs = await this.getLogs(10);
    const urlMatch = logs.match(this.urlPattern);
    const url = urlMatch ? urlMatch[1] : undefined;

    return {
      isRunning: true,
      community: this.community,
      path: this.projectPath,
      pid: this.process.pid,
      uptime: Date.now() - this.startTime,
      url
    };
  }

  /**
   * Start devvit playtest for a community
   */
  async start(community: string, projectPath: string = "."): Promise<PlaytestResponse> {
    try {
      if (this.process && !this.process.killed) {
        return {
          success: false,
          message: "Playtest is already running. Stop it first before starting a new one."
        };
      }

      // Create a log file
      this.logFile = path.join(os.tmpdir(), `devvit-playtest-${Date.now()}.log`);
      
      // Resolve project path
      const resolvedPath = path.resolve(projectPath);
      
      // Check if path exists
      try {
        const stats = await fs.stat(resolvedPath);
        if (!stats.isDirectory()) {
          return {
            success: false,
            message: `Project path is not a directory: ${resolvedPath}`
          };
        }
      } catch (error) {
        return {
          success: false,
          message: `Project path does not exist or is not accessible: ${resolvedPath}`
        };
      }

      // Start process with output redirection to log file
      const logStream = fs.open(this.logFile, 'w');
      const writeStream = (await logStream).createWriteStream();
      
      this.process = spawn('devvit', ['playtest', community], {
        cwd: resolvedPath,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      this.startTime = Date.now();
      this.community = community;
      this.projectPath = resolvedPath;

      if (!this.process.stdout || !this.process.stderr) {
        await this.stop();
        return {
          success: false,
          message: "Failed to start playtest: couldn't capture output streams"
        };
      }

      // Pipe output to log file and console
      this.process.stdout.pipe(writeStream);
      this.process.stderr.pipe(writeStream);
      
      // Log output to console as well
      this.process.stdout.on('data', (data) => {
        console.log(`[Playtest] ${data.toString().trim()}`);
      });
      
      this.process.stderr.on('data', (data) => {
        console.error(`[Playtest Error] ${data.toString().trim()}`);
      });

      // Set up error handler
      this.process.on('error', (error) => {
        console.error('Playtest process error:', error);
      });

      // Wait a bit to check if the process starts properly
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (this.process.killed || this.process.exitCode !== null) {
        const logs = await this.getLogs(20);
        return {
          success: false,
          message: "Failed to start playtest",
          data: {
            exitCode: this.process.exitCode,
            logs
          }
        };
      }

      return {
        success: true,
        message: `Started devvit playtest for community ${community}`,
        data: {
          pid: this.process.pid,
          community,
          path: resolvedPath
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to start playtest: ${errorMessage}`
      };
    }
  }

  /**
   * Restart devvit playtest
   */
  async restart(): Promise<PlaytestResponse> {
    try {
      if (!this.process || this.process.killed) {
        return {
          success: false,
          message: "No playtest is running. Start one first."
        };
      }

      // Store current settings
      const { community, projectPath } = this;
      
      // Stop current process
      const stopResult = await this.stop();
      if (!stopResult.success) {
        return stopResult;
      }

      // Wait a bit before restarting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start new process with same settings
      return await this.start(community, projectPath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to restart playtest: ${errorMessage}`
      };
    }
  }

  /**
   * Stop devvit playtest
   */
  async stop(): Promise<PlaytestResponse> {
    try {
      if (!this.process || this.process.killed) {
        return {
          success: false,
          message: "No playtest is running"
        };
      }

      // First try graceful termination
      this.process.kill('SIGTERM');
      
      // Wait a bit to see if it terminates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force kill if still running
      if (!this.process.killed) {
        this.process.kill('SIGKILL');
      }

      this.process = null;
      
      return {
        success: true,
        message: "Playtest stopped successfully",
        data: {
          logFile: this.logFile
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Failed to stop playtest: ${errorMessage}`
      };
    }
  }

  /**
   * Get logs from the playtest process
   */
  async getLogs(lines: number = 100): Promise<string> {
    if (!this.logFile) {
      return "No log file available";
    }

    try {
      // Check if log file exists
      try {
        await fs.access(this.logFile);
      } catch {
        return "Log file not found or not accessible";
      }

      // Read the whole file - this is fine for reasonable log sizes
      const content = await fs.readFile(this.logFile, 'utf-8');
      
      // Split by lines and get the last 'lines' count
      const allLines = content.split('\n');
      const lastLines = allLines.slice(-lines).join('\n');
      
      return lastLines;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return `Error reading logs: ${errorMessage}`;
    }
  }
}