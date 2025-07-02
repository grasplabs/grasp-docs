# Grasp SDK

**TypeScript/Python SDK for browser automation and secure command execution in highly available and scalable cloud browser environments**

Grasp SDK provides a type-safe, event-driven API for browser automation and command execution in isolated cloud environments.

## Features

- **Cloud Browser Automation**: Launch and control Chromium browsers in isolated cloud environments
- **CDP Integration**: Chrome DevTools Protocol support for advanced browser control
- **Command Execution**: Execute shell commands with real-time monitoring
- **Secure Execution**: Run code in isolated E2B cloud environments
- **TypeScript & Python Support**: Full type safety and IntelliSense for both languages

## Authentication

### API Key Usage

You can authenticate with Grasp in two ways:

#### 1. Environment Variable (Recommended)

Set the `GRASP_KEY` environment variable:

```bash
export GRASP_KEY=your_api_key_here
```

#### 2. Direct Code Usage

Pass the API key directly in your code:

::: code-tabs

@tab TypeScript/Node.js

```typescript
const connection = await grasp.launchBrowser({
  key: 'your_api_key_here',
  // other options...
});
```

@tab Python

```python
async with GraspServer({
    'key': 'your_api_key_here',
    # other options...
}) as connection:
    # your code here
```

:::

## Configuration Parameters

When creating an SDK instance, you can set the following configuration parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `key` | string | Yes* | `$GRASP_KEY` | API key (optional if `GRASP_KEY` environment variable is set) |
| `type` | enum | No | `chromium` | Remote browser type: `chromium` or `chrome-stable` |
| `headless` | boolean | No | `true` | Headless mode (headless saves resources but may be more detectable as bot) |
| `timeout` | integer | No | 900000 (15 min) | Grasp service timeout in milliseconds (max: 86400000 - 24 hours) |
| `adblock` | boolean | No | `false` | Enable ad blocking (experimental feature) |
| `debug` | boolean | No | `false` | Enable debug mode for more verbose terminal output |

## Installation & Quick Start

### TypeScript/Node.js SDK

#### Installation

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

#### Basic Usage

```typescript
import grasp from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function main() {
  // Launch browser in cloud environment
  const connection = await grasp.launchBrowser({
    // key: process.env.GRASP_KEY || '', // Optional if GRASP_KEY env var is set
    // type: 'chrome-stable',
    // headless: false, 
    // adblock: true, 
    // debug: true,
    timeout: 3600000, // Container runs for max 1 hour (max value: 86400000 - 24 hours)
  });

  console.log('Browser connection:', connection);

  // Connect to the browser using Playwright
  const browser = await chromium.connectOverCDP(connection.wsUrl, {
    timeout: 150000,
  });

  // Optional: wait for some time
  // await setTimeout(10000);

  // Create first page and navigate
  const page1 = await browser.newPage();
  await page1.goto('https://getgrasp.ai/', { waitUntil: 'domcontentloaded' });
  await page1.screenshot({ path: 'grasp-ai.png' });
  await page1.close();

  // Get or create context
  const context = browser.contexts()[0] || await browser.newContext();

  // Create second page
  const page2 = await context.newPage();

  // Render HTML string to page
  await page2.setContent(`<h1>Hello Grasp</h1>`, { waitUntil: 'networkidle' });

  // Take screenshot
  await page2.screenshot({ path: 'hello-world.png', fullPage: true });

  // Clean up resources
  await page2.close();
  await context.close();
  await browser.close();

  console.log('✅ Task finished.');
}

main();
```

**Note:** Resources are automatically released after calling `browser.close()` when using the Node.js SDK.

### Python SDK

#### Installation

```bash
pip install grasp_sdk
```

#### Basic Usage

```python
#!/usr/bin/env python3
"""
Grasp SDK Python Usage Example

This example demonstrates how to use grasp_sdk to launch a browser, 
connect via CDP, perform basic operations, and take screenshots.
"""

import asyncio
import os
from playwright.async_api import async_playwright
from dotenv import load_dotenv
from grasp_sdk import GraspServer

async def main():
    """Main function: demonstrates basic Grasp SDK usage"""
    
    # Check for API key
    api_key = os.getenv('GRASP_KEY')
    if not api_key:
        print("⚠️ Warning: GRASP_KEY environment variable not set")
        print("Please set GRASP_KEY environment variable or configure in .env file")
        print("Example: export GRASP_KEY=your_api_key_here")
        return

    print("🚀 Starting browser...")

    async with GraspServer({
            # 'key': api_key,  # Optional if GRASP_KEY env var is set
            # 'type': 'chrome-stable',
            # 'headless': False,
            # 'adblock': True,
            # 'debug': True,
            'timeout': 3600000,  # Container runs for max 1 hour (max: 86400000 - 24 hours)
        }) as connection:
    
        try:
            print(f"Connection info: {connection}")
            print(f"WebSocket URL: {connection['ws_url']}")
            print(f"HTTP URL: {connection['http_url']}")
            
            # Use Playwright to connect to CDP
            async with async_playwright() as p:
                browser = await p.chromium.connect_over_cdp(
                    connection['ws_url'],
                    timeout=150000
                )
                
                # Optional: wait for some time
                # await asyncio.sleep(10)
                
                # Create first page and visit website
                page1 = await browser.new_page()
                await page1.goto('https://getgrasp.ai/', wait_until='domcontentloaded')
                await page1.screenshot(path='grasp-ai.png')
                await page1.close()
                
                # Get or create context
                contexts = browser.contexts
                context = contexts[0] if contexts else await browser.new_context()
                
                # Create second page
                page2 = await context.new_page()
                
                # Render HTML string to page
                await page2.set_content('<h1>Hello Grasp</h1>', wait_until='networkidle')
                
                # Take screenshot
                await page2.screenshot(path='hello-world.png', full_page=True)
                
                # Clean up resources
                await page2.close()
                await context.close()
                await browser.close()
                
            print('✅ Task completed.')
            
        except Exception as e:
            print(f"❌ Error during execution: {str(e)}")
            raise
        
        finally:
            # Note: When using the async context manager, resources are automatically cleaned up
            # when the code execution ends to minimize consumption.
            print("Program ended, resources will be automatically cleaned up")

if __name__ == '__main__':
    # Run main function
    asyncio.run(main())
```

**Important Notes for Python SDK:**
- **Recommended**: Use the async context manager as shown above. This ensures cloud browser and compute resources are immediately reclaimed when code execution ends, minimizing consumption.
- **Alternative**: If not using the async context manager, resources will still be destroyed by the monitoring service after `browser.close()`, but usually with a delay of several tens of seconds, which may cause additional resource usage.

## API Reference

### TypeScript/Node.js API

#### `grasp.launchBrowser(options)`

Launches a browser instance in the cloud environment.

**Parameters:**
- `options` (object, optional):
  - `key` (string, optional): Grasp API key (uses `GRASP_KEY` env var if not provided)
  - `type` (string, optional): Browser type - `'chromium'` or `'chrome-stable'`. Default: `'chromium'`
  - `headless` (boolean, optional): Run in headless mode. Default: `true`
  - `timeout` (number, optional): Connection timeout in milliseconds. Default: 900000 (15 minutes), Max: 86400000 (24 hours)
  - `adblock` (boolean, optional): Enable ad blocking (experimental). Default: `false`
  - `debug` (boolean, optional): Enable debug mode for verbose output. Default: `false`

**Returns:**
- `Promise<Connection>`: Connection object with:
  - `id` (string): Unique browser instance ID
  - `httpUrl` (string): HTTP URL for CDP connection
  - `wsUrl` (string): WebSocket URL for CDP connection

**Example:**
```typescript
const connection = await grasp.launchBrowser({
  key: 'your_api_key_here',
  type: 'chrome-stable',
  headless: false,
  timeout: 3600000,
  adblock: true,
  debug: true
});
```

### Python API

#### `GraspServer(options)`

Creates a browser server instance in the cloud environment.

**Parameters:**
- `options` (dict): Configuration dictionary with the same parameters as the TypeScript version

**Usage:**
```python
async with GraspServer({
    'key': 'your_api_key_here',
    'type': 'chrome-stable',
    'headless': False,
    'timeout': 3600000,
    'adblock': True,
    'debug': True
}) as connection:
    # Your automation code here
    pass
```

### Using with Playwright

After launching a browser, connect to it using Playwright's CDP connection:

::: code-tabs

@tab TypeScript/Node.js

```typescript
import { chromium } from 'playwright';

const connection = await grasp.launchBrowser();
const browser = await chromium.connectOverCDP(connection.wsUrl, {
  timeout: 150000
});

// Use browser as normal Playwright browser instance
const page = await browser.newPage();
// ... your automation code

await browser.close();
```

@tab Python

```python
from playwright.async_api import async_playwright

async with async_playwright() as p:
    browser = await p.chromium.connect_over_cdp(
        connection['ws_url'],
        timeout=150000
    )
    
    # Use browser as normal Playwright browser instance
    page = await browser.new_page()
    # ... your automation code
    
    await browser.close()
```

:::

## Best Practices

1. **Resource Management**: Always properly close browsers and pages to avoid resource leaks
2. **Timeout Configuration**: Set appropriate timeouts based on your use case (max 24 hours)
3. **Environment Variables**: Use environment variables for API keys to keep them secure
4. **Error Handling**: Implement proper error handling for network issues and browser failures
5. **Context Management**: Use async context managers (Python) for automatic resource cleanup

## Support

For issues, questions, or contributions, visit our [GitHub repository](https://github.com/grasplabs).