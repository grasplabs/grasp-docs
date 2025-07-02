# TypeScript/Node.js SDK

The Grasp TypeScript/Node.js SDK provides a simple and powerful way to automate browsers in cloud environments.

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

## API Reference

### `grasp.launchBrowser(options)`

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

## Using with Playwright

After launching a browser, connect to it using Playwright's CDP connection:

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

## Advanced Examples

### Multiple Pages and Contexts

```typescript
import grasp from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function multiplePages() {
  const connection = await grasp.launchBrowser({
    timeout: 3600000,
  });

  const browser = await chromium.connectOverCDP(connection.wsUrl, {
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

  // Take screenshots
  await Promise.all([
    page1.screenshot({ path: 'example.png' }),
    page2.screenshot({ path: 'httpbin.png' })
  ]);

  // Clean up
  await context1.close();
  await context2.close();
  await browser.close();
}
```

### Error Handling

```typescript
import grasp from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function withErrorHandling() {
  let browser;
  
  try {
    const connection = await grasp.launchBrowser({
      timeout: 3600000,
    });

    browser = await chromium.connectOverCDP(connection.wsUrl, {
      timeout: 150000,
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');
    
    // Your automation code here
    
  } catch (error) {
    console.error('Error during browser automation:', error);
    throw error;
  } finally {
    // Always clean up resources
    if (browser) {
      await browser.close();
    }
  }
}
```

## Resource Management

**Important**: Resources are automatically released after calling `browser.close()` when using the Node.js SDK. Always ensure you properly close browsers and pages to avoid resource leaks.

## Best Practices

1. **Always Close Resources**: Use `browser.close()`, `context.close()`, and `page.close()` appropriately
2. **Error Handling**: Implement proper try-catch blocks and cleanup in finally blocks
3. **Timeout Configuration**: Set reasonable timeouts based on your use case
4. **Context Isolation**: Use separate contexts for different tasks to avoid interference
5. **Concurrent Operations**: Use `Promise.all()` for parallel operations when possible