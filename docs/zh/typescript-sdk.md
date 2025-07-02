# TypeScript/Node.js SDK

Grasp TypeScript/Node.js SDK 提供了一种简单而强大的方式来在云环境中自动化浏览器。

## 安装

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

## 基本用法

```typescript
import grasp from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function main() {
  // 在云环境中启动浏览器
  const connection = await grasp.launchBrowser({
    // key: process.env.GRASP_KEY || '', // 如果设置了 GRASP_KEY 环境变量则可选
    // type: 'chrome-stable',
    // headless: false, 
    // adblock: true, 
    // debug: true,
    timeout: 3600000, // 容器最多运行 1 小时（最大值：86400000 - 24小时）
  });

  console.log('浏览器连接:', connection);

  // 使用 Playwright 连接到浏览器
  const browser = await chromium.connectOverCDP(connection.wsUrl, {
    timeout: 150000,
  });

  // 可选：等待一段时间
  // await setTimeout(10000);

  // 创建第一个页面并导航
  const page1 = await browser.newPage();
  await page1.goto('https://getgrasp.ai/', { waitUntil: 'domcontentloaded' });
  await page1.screenshot({ path: 'grasp-ai.png' });
  await page1.close();

  // 获取或创建上下文
  const context = browser.contexts()[0] || await browser.newContext();

  // 创建第二个页面
  const page2 = await context.newPage();

  // 将 HTML 字符串渲染到页面
  await page2.setContent(`<h1>Hello Grasp</h1>`, { waitUntil: 'networkidle' });

  // 截图
  await page2.screenshot({ path: 'hello-world.png', fullPage: true });

  // 清理资源
  await page2.close();
  await context.close();
  await browser.close();

  console.log('✅ 任务完成。');
}

main();
```

## API 参考

### `grasp.launchBrowser(options)`

在云环境中启动浏览器实例。

**参数：**
- `options` (object, 可选):
  - `key` (string, 可选): Grasp API 密钥（如果未提供则使用 `GRASP_KEY` 环境变量）
  - `type` (string, 可选): 浏览器类型 - `'chromium'` 或 `'chrome-stable'`。默认值：`'chromium'`
  - `headless` (boolean, 可选): 以无头模式运行。默认值：`true`
  - `timeout` (number, 可选): 连接超时时间（毫秒）。默认值：900000（15分钟），最大值：86400000（24小时）
  - `adblock` (boolean, 可选): 启用广告拦截（实验性）。默认值：`false`
  - `debug` (boolean, 可选): 启用调试模式以获得详细输出。默认值：`false`

**返回值：**
- `Promise<Connection>`: 连接对象，包含：
  - `id` (string): 唯一浏览器实例 ID
  - `httpUrl` (string): CDP 连接的 HTTP URL
  - `wsUrl` (string): CDP 连接的 WebSocket URL

**示例：**
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

## 与 Playwright 一起使用

启动浏览器后，使用 Playwright 的 CDP 连接来连接它：

```typescript
import { chromium } from 'playwright';

const connection = await grasp.launchBrowser();
const browser = await chromium.connectOverCDP(connection.wsUrl, {
  timeout: 150000
});

// 像使用普通的 Playwright 浏览器实例一样使用浏览器
const page = await browser.newPage();
// ... 您的自动化代码

await browser.close();
```

## 高级示例

### 多页面和上下文

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

  // 为隔离创建多个上下文
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  // 不同上下文中的页面
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // 导航到不同的站点
  await Promise.all([
    page1.goto('https://example.com'),
    page2.goto('https://httpbin.org/json')
  ]);

  // 截图
  await Promise.all([
    page1.screenshot({ path: 'example.png' }),
    page2.screenshot({ path: 'httpbin.png' })
  ]);

  // 清理
  await context1.close();
  await context2.close();
  await browser.close();
}
```

### 错误处理

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
    
    // 您的自动化代码
    
  } catch (error) {
    console.error('浏览器自动化过程中出错:', error);
    throw error;
  } finally {
    // 始终清理资源
    if (browser) {
      await browser.close();
    }
  }
}
```

## 资源管理

**重要提示**：使用 Node.js SDK 时，在调用 `browser.close()` 后资源会自动释放。始终确保正确关闭浏览器和页面以避免资源泄漏。

## 最佳实践

1. **始终关闭资源**：适当使用 `browser.close()`、`context.close()` 和 `page.close()`
2. **错误处理**：实现适当的 try-catch 块并在 finally 块中进行清理
3. **超时配置**：根据您的用例设置合理的超时时间
4. **上下文隔离**：为不同任务使用单独的上下文以避免干扰
5. **并发操作**：在可能的情况下使用 `Promise.all()` 进行并行操作