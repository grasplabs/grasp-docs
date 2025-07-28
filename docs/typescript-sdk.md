# TypeScript/Node.js SDK

The Grasp TypeScript/Node.js SDK provides a comprehensive solution for browser automation, code execution, file management, and terminal operations in cloud environments.

## Installation

::: code-tabs

@tab pnpm

```bash
pnpm add @grasplabs/grasp
```

@tab npm

```bash
npm install @grasplabs/grasp
```

@tab yarn

```bash
yarn add @grasplabs/grasp
```

:::

## Basic Usage

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function main() {
  // Create Grasp instance with API key
  const grasp = new Grasp({
    apiKey: process.env.GRASP_KEY || 'your_api_key_here'
  });

  // Launch a new session
  const session = await grasp.launch({
    browser: {
      type: 'chrome-stable',
      headless: false,
      adblock: true
    },
    keepAliveMS: 300000, // Keep session alive for 5 minutes
    timeout: 3600000,    // Max session duration: 1 hour
    debug: true
  });

  console.log('Session ID:', session.id);

  // Connect to the browser using Playwright
  const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
    timeout: 150000,
  });

  // Create page and navigate
  const page = await browser.newPage();
  await page.goto('https://getgrasp.ai/', { waitUntil: 'domcontentloaded' });
  await page.screenshot({ path: 'grasp-ai.png' });

  // Use session services
  await session.files.uploadFile('./local-file.txt', '/home/user/remote-file.txt');
  const fileContent = await session.files.readFile('/home/user/remote-file.txt');
  console.log('File content:', fileContent);

  // Run terminal commands
  const command = await session.terminal.runCommand('ls -la /home/user');
  command.stdout.pipe(process.stdout);
  await command.end();

  // Clean up resources
  await page.close();
  await browser.close();
  await session.close();

  console.log('✅ Task finished.');
}

main();
```

## API Reference

### `new Grasp(options)`

Creates a new Grasp instance for managing browser sessions.

**Parameters:**
- `options` (object, optional):
  - `apiKey` (string): Grasp API key (defaults to `GRASP_KEY` environment variable)

**Example:**
```typescript
const grasp = new Grasp({
  apiKey: 'your_api_key_here'
});
```

### `grasp.launch(options)`

Launches a new browser session with comprehensive services.

**Parameters:**
- `options` (object, optional):
  - `browser` (object, optional): Browser configuration
    - `type` (string, optional): Browser type - `'chromium'` or `'chrome-stable'`. Default: `'chromium'`
    - `headless` (boolean, optional): Run in headless mode. Default: `true`
    - `adblock` (boolean, optional): Enable ad blocking. Default: `false`
  - `keepAliveMS` (number, optional): Keep session alive duration in milliseconds
  - `timeout` (number, optional): Max session duration in milliseconds. Default: 900000 (15 minutes), Max: 86400000 (24 hours)
  - `debug` (boolean, optional): Enable debug mode. Default: `false`
  - `logLevel` (string, optional): Log level - `'debug'`, `'info'`, `'warn'`, `'error'`. Default: `'info'`

**Returns:**
- `Promise<GraspSession>`: Session object with browser, terminal, files, and codeRunner services

**Example:**
```typescript
const session = await grasp.launch({
  browser: {
    type: 'chrome-stable',
    headless: false,
    adblock: true
  },
  keepAliveMS: 300000,
  timeout: 3600000,
  debug: true,
  logLevel: 'debug'
});
```

### `grasp.connect(sessionId)`

Connects to an existing browser session.

**Parameters:**
- `sessionId` (string): The ID of the existing session to connect to

**Returns:**
- `Promise<GraspSession>`: Session object for the existing session

**Example:**
```typescript
const session = await grasp.connect('existing-session-id');
```

### `GraspSession`

The main session object that provides access to all Grasp services.

**Properties:**
- `id` (string): Unique session identifier
- `browser` (GraspBrowser): Browser service for CDP connections and browser management
- `terminal` (TerminalService): Terminal service for running shell commands
- `files` (FileSystemService): File system service for file operations
- `codeRunner` (CodeRunner): Code execution service for running Python/JavaScript code

**Methods:**

#### `session.getHost(port)`
Gets the host URL for a specific port in the session.

**Parameters:**
- `port` (number): Port number

**Returns:**
- `string`: Host URL for the specified port

#### `session.close()`
Closes the session and releases all resources.

**Returns:**
- `Promise<void>`

**Example:**
```typescript
const session = await grasp.launch();
console.log('Session ID:', session.id);

// Use session services
const browser = session.browser;
const terminal = session.terminal;
const files = session.files;
const codeRunner = session.codeRunner;

// Get host for port 3000
const host = session.getHost(3000);

// Close session when done
await session.close();
```

## Using with Playwright

After launching a session, connect to the browser using Playwright's CDP connection:

```typescript
import { chromium } from 'playwright';

const session = await grasp.launch();
const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
  timeout: 150000
});

// Use browser as normal Playwright browser instance
const page = await browser.newPage();
// ... your automation code

await browser.close();
await session.close();
```

### `GraspBrowser`

Browser service for managing CDP connections and browser-related operations.

**Methods:**

#### `browser.getHost()`
Gets the browser host URL.

**Returns:**
- `string`: Browser host URL

#### `browser.getEndpoint()`
Gets the WebSocket endpoint URL for CDP connection.

**Returns:**
- `string`: WebSocket URL for connecting with Playwright/Puppeteer

#### `browser.getCurrentPageTargetInfo()` (Experimental)
Gets information about the current page target.

**Returns:**
- `Promise<object | null>`: Page target information including targetId, sessionId, pageLoaded status, and screenshot

#### `browser.getLiveviewStreamingUrl()` (Experimental)
Gets the live view streaming URL for real-time browser viewing.

**Returns:**
- `Promise<string | null>`: Streaming URL or null if not available

#### `browser.getLiveviewPageUrl()` (Experimental)
Gets the live view page URL for browser preview.

**Returns:**
- `Promise<string | null>`: Preview page URL or null if not available

#### `browser.downloadReplayVideo(localPath)` (Experimental)
Downloads a replay video of the browser session.

**Parameters:**
- `localPath` (string): Local path to save the video file

**Returns:**
- `Promise<void>`

**Example:**
```typescript
const session = await grasp.launch();
const browser = session.browser;

// Get browser endpoint for Playwright connection
const endpoint = browser.getEndpoint();
const playwright = await chromium.connectOverCDP(endpoint);

// Get live view URLs (experimental)
const streamUrl = await browser.getLiveviewStreamingUrl();
const previewUrl = await browser.getLiveviewPageUrl();

// Download replay video (experimental)
await browser.downloadReplayVideo('./replay.mp4');
```

### `TerminalService`

Terminal service for executing shell commands in the remote environment.

**Methods:**

#### `terminal.runCommand(command, options)`
Executes a shell command and returns a streamable response.

**Parameters:**
- `command` (string): Shell command to execute
- `options` (object, optional): Command execution options
  - `cwd` (string, optional): Working directory for the command
  - `envs` (object, optional): Environment variables
  - `timeoutMs` (number, optional): Command timeout in milliseconds
  - `user` (string, optional): User to run the command as
  - `background` (boolean, optional): Run command in background

**Returns:**
- `Promise<StreamableCommandResponse>`: Object with:
  - `stdout` (Readable): Standard output stream
  - `stderr` (Readable): Standard error stream
  - `end()` (function): Wait for command completion
  - `kill()` (function): Kill the running command
  - `json()` (function): Get command result as JSON

**Example:**
```typescript
const session = await grasp.launch();
const terminal = session.terminal;

// Run a simple command
const command = await terminal.runCommand('ls -la /home/user');

// Pipe output to console
command.stdout.pipe(process.stdout);
command.stderr.pipe(process.stderr);

// Wait for completion
await command.end();

// Run command with options
const command2 = await terminal.runCommand('npm install', {
  cwd: '/home/user/project',
  envs: { NODE_ENV: 'development' },
  timeoutMs: 300000
});

// Get result as JSON
const result = await command2.json();
console.log('Exit code:', result.exitCode);
console.log('Output:', result.stdout);
```

### `FileSystemService`

File system service for managing files between local and remote environments.

**Methods:**

#### `files.uploadFile(localPath, remotePath)`
Uploads a file from local system to remote environment.

**Parameters:**
- `localPath` (string): Local file path
- `remotePath` (string): Remote file path

**Returns:**
- `Promise<void>`

#### `files.downloadFile(remotePath, localPath)`
Downloads a file from remote environment to local system.

**Parameters:**
- `remotePath` (string): Remote file path
- `localPath` (string): Local file path

**Returns:**
- `Promise<void>`

#### `files.writeFile(remotePath, content)`
Writes content to a file in the remote environment.

**Parameters:**
- `remotePath` (string): Remote file path
- `content` (string | ArrayBuffer): File content

**Returns:**
- `Promise<void>`

#### `files.readFile(remotePath, options)`
Reads a file from the remote environment.

**Parameters:**
- `remotePath` (string): Remote file path
- `options` (object, optional): Read options
  - `encoding` (string, optional): File encoding - `'utf8'`, `'base64'`, or `'binary'`. Default: `'utf8'`

**Returns:**
- `Promise<string | ArrayBuffer>`: File content

#### `files.syncDownloadsDirectory(localPath, remotePath)` (Experimental)
Synchronizes the remote downloads directory to local path.

**Parameters:**
- `localPath` (string): Local directory path
- `remotePath` (string, optional): Remote directory path (defaults to localPath)

**Returns:**
- `Promise<string>`: Local directory path

**Example:**
```typescript
const session = await grasp.launch();
const files = session.files;

// Upload a file
await files.uploadFile('./local-config.json', '/home/user/config.json');

// Write content to remote file
await files.writeFile('/home/user/script.py', 'print("Hello World")');

// Read file content
const content = await files.readFile('/home/user/config.json');
console.log('Config:', JSON.parse(content));

// Read binary file
const binaryData = await files.readFile('/home/user/image.png', {
  encoding: 'binary'
});

// Download a file
await files.downloadFile('/home/user/output.txt', './downloaded-output.txt');

// Sync downloads directory (experimental)
const localDir = await files.syncDownloadsDirectory('./downloads');
console.log('Downloads synced to:', localDir);
```

### `CodeRunner`

Code execution service for running Python and JavaScript code in the remote environment.

**Methods:**

#### `codeRunner.run(code, options)`
Executes Python or JavaScript code and returns the result.

**Parameters:**
- `code` (string): Code to execute (Python or JavaScript/TypeScript)
- `options` (object, optional): Execution options
  - `inject` (boolean, optional): Automatically inject browser connection. Default: `false`
  - `syncDir` (string, optional): Local directory to sync outputs. Default: `'./code-runner'`
  - `timeout` (number, optional): Execution timeout in milliseconds. Default: `300000` (5 minutes)

**Returns:**
- `Promise<CommandResult & { outputDir?: string }>`: Execution result with:
  - `exitCode` (number): Exit code of the execution
  - `stdout` (string): Standard output
  - `stderr` (string): Standard error
  - `outputDir` (string, optional): Local directory containing execution outputs

**Example:**
```typescript
const session = await grasp.launch();
const codeRunner = session.codeRunner;

// Run Python code
const pythonCode = `
import requests
response = requests.get('https://api.github.com/users/octocat')
print(f"Status: {response.status_code}")
print(f"User: {response.json()['name']}")
`;

const pythonResult = await codeRunner.run(pythonCode, {
  timeout: 60000
});
console.log('Python output:', pythonResult.stdout);

// Run JavaScript code
const jsCode = `
const fs = require('fs');
const data = { message: 'Hello from Node.js!' };
fs.writeFileSync('/home/user/downloads/output.json', JSON.stringify(data, null, 2));
console.log('File written successfully');
`;

const jsResult = await codeRunner.run(jsCode, {
  syncDir: './my-outputs'
});
console.log('JavaScript output:', jsResult.stdout);
console.log('Output directory:', jsResult.outputDir);

// Run Playwright code with automatic injection
const playwrightCode = `
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()  # This will be auto-injected with CDP connection
    page = browser.new_page()
    page.goto('https://example.com')
    page.screenshot(path='/home/user/downloads/example.png')
    browser.close()
`;

const playwrightResult = await codeRunner.run(playwrightCode, {
  inject: true,  // Automatically inject browser connection
  timeout: 120000
});
console.log('Playwright execution completed');
```

## Advanced Examples

### Multiple Pages and Contexts

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function multiplePages() {
  const grasp = new Grasp();
  const session = await grasp.launch({
    browser: { type: 'chrome-stable' },
    timeout: 3600000,
  });

  const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
    timeout: 150000,
  });

  // Create multiple contexts for isolation
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  // Pages in different contexts
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // Navigate to different sites
  await Promise.all([
    page1.goto('https://example.com'),
    page2.goto('https://httpbin.org/json')
  ]);

  // Take screenshots and save to downloads
  await Promise.all([
    page1.screenshot({ path: '/home/user/downloads/example.png' }),
    page2.screenshot({ path: '/home/user/downloads/httpbin.png' })
  ]);

  // Download screenshots to local
  await session.files.downloadFile('/home/user/downloads/example.png', './example.png');
  await session.files.downloadFile('/home/user/downloads/httpbin.png', './httpbin.png');

  // Clean up
  await context1.close();
  await context2.close();
  await browser.close();
  await session.close();
}
```

### Error Handling

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function robustAutomation() {
  const grasp = new Grasp();
  let session;
  let browser;
  
  try {
    session = await grasp.launch({
      browser: { type: 'chrome-stable' },
      timeout: 300000,
    });

    browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000,
    });

    const page = await browser.newPage();
    
    // Set timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(60000);
    
    await page.goto('https://example.com');
    
    // Wait for element with error handling
    try {
      await page.waitForSelector('#some-element', { timeout: 10000 });
      await page.click('#some-element');
    } catch (error) {
      console.log('Element not found, continuing with alternative flow');
      // Alternative action
      await page.click('body');
    }
    
    // Take screenshot for debugging and download
    await page.screenshot({ path: '/home/user/downloads/debug.png' });
    await session.files.downloadFile('/home/user/downloads/debug.png', './debug.png');
    
  } catch (error) {
    console.error('Automation failed:', error);
    
    // Take error screenshot if browser is available
    if (browser && session) {
      try {
        const page = await browser.newPage();
        await page.screenshot({ path: '/home/user/downloads/error.png' });
        await session.files.downloadFile('/home/user/downloads/error.png', './error.png');
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
    }
    
    throw error;
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    if (session) {
      await session.close();
    }
  }
}
```

## Resource Management

Proper resource management is crucial when working with browser automation:

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

class BrowserManager {
  private grasp: Grasp;
  private session: any;
  private browser: any;

  constructor() {
    this.grasp = new Grasp();
  }

  async initialize() {
    this.session = await this.grasp.launch({
      browser: { type: 'chrome-stable' },
      timeout: 3600000,
    });

    this.browser = await chromium.connectOverCDP(this.session.browser.getEndpoint(), {
      timeout: 150000,
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    if (this.session) {
      await this.session.close();
      this.session = null;
    }
  }

  async withPage<T>(callback: (page: any) => Promise<T>): Promise<T> {
    const page = await this.browser.newPage();
    try {
      return await callback(page);
    } finally {
      await page.close();
    }
  }

  // Access to session services
  get files() {
    return this.session?.files;
  }

  get terminal() {
    return this.session?.terminal;
  }

  get codeRunner() {
    return this.session?.codeRunner;
  }
}

// Usage
const manager = new BrowserManager();
try {
  await manager.initialize();
  
  const result = await manager.withPage(async (page) => {
    await page.goto('https://example.com');
    await page.screenshot({ path: '/home/user/downloads/example.png' });
    return await page.title();
  });
  
  console.log('Page title:', result);
  
  // Download the screenshot
  await manager.files.downloadFile('/home/user/downloads/example.png', './example.png');
} finally {
  await manager.cleanup();
}
```

**Important**: Resources are automatically released after calling `browser.close()` and `session.close()` when using the Node.js SDK. Always ensure you properly close browsers, pages, and sessions to avoid resource leaks.

## Best Practices

1. **Always Close Resources**: Use `browser.close()`, `session.close()`, `context.close()`, and `page.close()` appropriately
2. **Error Handling**: Implement proper try-catch blocks and cleanup in finally blocks
3. **Timeout Configuration**: Set reasonable timeouts based on your use case
4. **Context Isolation**: Use separate contexts for different tasks to avoid interference
5. **Concurrent Operations**: Use `Promise.all()` for parallel operations when possible
6. **File Management**: Use the files service to transfer files between local and remote environments
7. **Service Integration**: Leverage terminal, files, and codeRunner services for comprehensive automation workflows