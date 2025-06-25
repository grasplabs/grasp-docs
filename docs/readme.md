# Grasp SDK

**TypeScript SDK for browser automation and secure command execution in highly available and scalable cloud browser environments**

Grasp SDK provides a type-safe, event-driven API for browser automation and command execution in isolated cloud environments.

## Features

- **Cloud Browser Automation**: Launch and control Chromium browsers in isolated cloud environments
- **CDP Integration**: Chrome DevTools Protocol support for advanced browser control
- **Command Execution**: Execute shell commands with real-time monitoring
- **Secure Execution**: Run code in isolated E2B cloud environments
- **TypeScript Support**: Full type safety and IntelliSense

## Quick Start

### Installation

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

### Basic Usage

```typescript
import grasp from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function main() {

  // Launch browser in cloud environment
  const connection = await grasp.launchBrowser({
    appKey: 'YOUR_GRASP_APPKEY',
    timeout: 60000,
  });

  console.log('Browser connection:', connection);

  // Connect to the browser using Playwright
  const browser = await chromium.connectOverCDP(connection.httpUrl, {
    timeout: 60000,
  });

  // Create page and navigate
  const page = await browser.newPage();
  await page.goto('https://getgrasp.ai/');
  await page.screenshot({ path: 'grasp-ai.png' });
  await page.close();

  await browser.close();

  // Close the cloud browser instance
  await grasp.close(connection.id);
}

main();
```

## API Reference

### `grasp.launchBrowser(options)`

Launches a browser instance in the cloud environment.

**Parameters:**
- `options` (object, optional):
  - `YOUR_GRASP_APPKEY` (string): grasp appKey
  - `timeout` (number, optional): Connection timeout in milliseconds. Default: 30000
  - `headers` (object, optional): Additional HTTP headers for the connection
  - `slowMo` (number, optional): Slows down operations by specified milliseconds

**Returns:**
- `Promise<Connection>`: Connection object with:
  - `id` (string): Unique browser instance ID
  - `httpUrl` (string): HTTP URL for CDP connection
  - `wsUrl` (string): WebSocket URL for CDP connection

**Example:**
```typescript
const connection = await grasp.launchBrowser({
  appKey: 'YOUR_GRASP_APPKEY',
  timeout: 60000
});
```

### `grasp.close(connectionId)`

Closes a browser instance and cleans up resources.

**Parameters:**
- `connectionId` (string): Browser instance ID returned from `launchBrowser`

**Returns:**
- `Promise<void>`: Resolves when cleanup is complete

**Example:**
```typescript
await grasp.close(connection.id);
```

### Using with Playwright

After launching a browser, connect to it using Playwright's `connectOverCDP` method:

```typescript
import { chromium } from 'playwright';

const connection = await grasp.launchBrowser();
const browser = await chromium.connectOverCDP(connection.httpUrl, {
  timeout: 60000
});

// Use browser as normal Playwright browser instance
const page = await browser.newPage();
// ... your automation code

await browser.close();
await grasp.close(connection.id);
```
