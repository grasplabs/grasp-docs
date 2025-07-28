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
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function main() {
  // 创建 Grasp 实例
  const grasp = new Grasp({
    apiKey: process.env.GRASP_KEY // 或直接传入 API 密钥
  });

  // 启动新会话
  const session = await grasp.launch({
    browser: {
      type: 'chrome-stable',
      headless: false,
      adblock: true
    },
    timeout: 3600000, // 会话最多运行 1 小时
    debug: true
  });

  try {
    console.log('会话 ID:', session.id);

    // 使用 Playwright 连接到浏览器
    const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000,
    });

    // 创建页面并导航
    const page = await browser.newPage();
    await page.goto('https://getgrasp.ai/', { waitUntil: 'domcontentloaded' });
    
    // 将截图保存到远程目录
    await page.screenshot({ path: '/home/user/downloads/grasp-ai.png' });
    
    // 下载截图到本地
    await session.files.downloadFile(
      '/home/user/downloads/grasp-ai.png',
      './grasp-ai.png'
    );

    await page.close();
    await browser.close();

    // 使用文件服务
    await session.files.writeFile('/home/user/test.txt', 'Hello Grasp!');
    const content = await session.files.readFile('/home/user/test.txt');
    console.log('文件内容:', content);

    // 使用终端服务
    const command = await session.terminal.runCommand('ls -la /home/user');
    await command.end();

    console.log('✅ 任务完成。');
  } finally {
    // 关闭会话以清理资源
    await session.close();
  }
}

main();
```

## API 参考

### Grasp

`Grasp` 是管理与 Grasp 服务连接的主要类。

#### 构造函数

```typescript
new Grasp(options?: GraspOptions)
```

**参数：**
- `options` (GraspOptions, 可选): 配置选项
  - `apiKey` (string, 可选): API 密钥（如果未提供则使用 `GRASP_KEY` 环境变量）

#### 方法

##### `launch(options?: LaunchOptions): Promise<GraspSession>`

启动新的 Grasp 会话。

**参数：**
- `options` (LaunchOptions, 可选): 会话配置选项
  - `browser` (object, 可选): 浏览器配置
    - `type` (string): 浏览器类型（默认值：'chrome-stable'）
    - `headless` (boolean): 无头模式（默认值：true）
    - `adblock` (boolean): 广告拦截（默认值：false）
  - `timeout` (number): 超时时间（毫秒，默认值：300000）
  - `debug` (boolean): 调试模式（默认值：false）

**返回值：**
- `Promise<GraspSession>`: 新的会话实例

##### `connect(sessionId: string): Promise<GraspSession>`

连接到现有会话。

**参数：**
- `sessionId` (string): 要连接的会话 ID

**返回值：**
- `Promise<GraspSession>`: 会话实例

### GraspSession

`GraspSession` 表示活动的 Grasp 会话。

#### 属性

- `id` (string): 会话 ID
- `browser` (GraspBrowser): 浏览器服务
- `files` (FileSystemService): 文件系统服务
- `terminal` (TerminalService): 终端服务

#### 方法

##### `close(): Promise<void>`

关闭会话并清理所有资源。

### GraspBrowser

`GraspBrowser` 提供浏览器相关操作。

#### 方法

##### `getEndpoint(): string`

获取 Playwright 连接的 CDP WebSocket URL。

**返回值：**
- `string`: CDP WebSocket URL

### TerminalService

`TerminalService` 提供远程终端中的命令执行。

#### 方法

##### `runCommand(command: string, options?: { cwd?: string }): Promise<TerminalCommand>`

在远程终端中运行命令。

**参数：**
- `command` (string): 要执行的命令
- `options` (object, 可选): 选项
  - `cwd` (string, 可选): 工作目录

**返回值：**
- `Promise<TerminalCommand>`: 命令执行实例

### FileSystemService

`FileSystemService` 提供与远程文件系统的交互。

#### 方法

##### `uploadFile(localPath: string, remotePath: string): Promise<void>`

将本地文件上传到远程系统。

**参数：**
- `localPath` (string): 本地文件路径
- `remotePath` (string): 远程文件路径

##### `downloadFile(remotePath: string, localPath: string): Promise<void>`

将远程文件下载到本地系统。

**参数：**
- `remotePath` (string): 远程文件路径
- `localPath` (string): 本地文件路径

##### `writeFile(path: string, content: string): Promise<void>`

向远程文件写入内容。

**参数：**
- `path` (string): 文件路径
- `content` (string): 要写入的内容

##### `readFile(path: string): Promise<string>`

读取远程文件的内容。

**参数：**
- `path` (string): 文件路径

**返回值：**
- `Promise<string>`: 文件内容

## 与 Playwright 一起使用

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function main() {
  // 创建 Grasp 实例
  const grasp = new Grasp();
  
  // 启动新会话
  const session = await grasp.launch({
    browser: {
      type: 'chrome-stable',
      headless: false
    },
    debug: true
  });
  
  try {
    // 使用 Playwright 连接到浏览器
    const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000
    });
    
    // 创建新页面
    const page = await browser.newPage();
    
    // 导航到网站
    await page.goto('https://example.com');
    
    // 操作元素
    await page.fill('input[name="search"]', 'Grasp SDK');
    await page.click('button[type="submit"]');
    
    // 等待结果
    await page.waitForSelector('.results');
    
    // 将截图保存到远程目录
    await page.screenshot({ path: '/home/user/downloads/search_results.png' });
    
    // 下载截图到本地
    await session.files.downloadFile(
      '/home/user/downloads/search_results.png',
      './search_results.png'
    );
    
    // 关闭浏览器
    await browser.close();
  } finally {
    // 关闭会话
    await session.close();
  }
}

main();
```

## 高级示例

### 多页面和上下文

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function multiplePages() {
  const grasp = new Grasp();
  const session = await grasp.launch({
    timeout: 3600000,
  });

  try {
    const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
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

    // 将截图保存到远程目录
    await Promise.all([
      page1.screenshot({ path: '/home/user/downloads/example.png' }),
      page2.screenshot({ path: '/home/user/downloads/httpbin.png' })
    ]);

    // 下载截图到本地
    await Promise.all([
      session.files.downloadFile('/home/user/downloads/example.png', './example.png'),
      session.files.downloadFile('/home/user/downloads/httpbin.png', './httpbin.png')
    ]);

    // 清理
    await context1.close();
    await context2.close();
    await browser.close();
  } finally {
    await session.close();
  }
}
```

### 错误处理

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function withErrorHandling() {
  const grasp = new Grasp();
  let session;
  let browser;
  
  try {
    session = await grasp.launch({
      timeout: 3600000,
    });

    browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
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
    if (session) {
      await session.close();
    }
  }
}
```

### Web 抓取示例

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function scrapeWebsite() {
  const grasp = new Grasp();
  const session = await grasp.launch({
    browser: {
      headless: true // 抓取时使用无头模式
    },
    timeout: 3600000
  });
  
  try {
    const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000,
    });
    
    const page = await browser.newPage();
    await page.goto('https://quotes.toscrape.com/');
    
    // 抓取引用
    const quotes = await page.$$eval('.quote', quotes => 
      quotes.map(quote => ({
        text: quote.querySelector('.text')?.textContent,
        author: quote.querySelector('.author')?.textContent,
        tags: Array.from(quote.querySelectorAll('.tag')).map(tag => tag.textContent)
      }))
    );
    
    console.log('抓取的引用:');
    quotes.forEach(quote => {
      console.log(`- "${quote.text}" - ${quote.author}`);
    });
    
    // 将结果保存到文件
    await session.files.writeFile(
      '/home/user/quotes.json',
      JSON.stringify(quotes, null, 2)
    );
    
    await browser.close();
  } finally {
    await session.close();
  }
}
```

## 资源管理

**重要提示**：使用 TypeScript SDK 时，在调用 `session.close()` 后资源会自动释放。始终确保正确关闭会话以避免资源泄漏。

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function resourceManagement() {
  const grasp = new Grasp();
  let session;
  let browser;
  
  try {
    // 启动会话
    session = await grasp.launch({
      browser: {
        type: 'chrome-stable',
        headless: false,
        adblock: true
      },
      timeout: 3600000,
      debug: true
    });
    
    // 连接浏览器
    browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000,
    });
    
    const page = await browser.newPage();
    await page.goto('https://example.com');
    
    // 将截图保存到远程目录
    await page.screenshot({ path: '/home/user/downloads/example.png' });
    
    // 下载到本地
    await session.files.downloadFile(
      '/home/user/downloads/example.png',
      './example.png'
    );
    
    // 使用文件服务
    await session.files.writeFile('/home/user/test.txt', 'Hello Grasp!');
    const content = await session.files.readFile('/home/user/test.txt');
    console.log('文件内容:', content);
    
    // 使用终端服务
    const command = await session.terminal.runCommand('ls -la /home/user');
    await command.end();
    
  } finally {
    // 重要：始终清理资源
    if (browser) {
      await browser.close();
    }
    if (session) {
      await session.close();
    }
  }
}
```

## 最佳实践

### 会话管理

1. **适当的会话管理**：始终使用 `session.close()` 进行自动资源清理
2. **会话重用**：为多个操作使用同一会话以节省资源
3. **超时配置**：根据您的用例设置合理的超时时间

### 浏览器操作

4. **错误处理**：实现适当的 try-catch 块并在 finally 块中进行清理
5. **资源清理**：始终适当关闭浏览器、上下文、页面和会话
6. **无头模式**：在不需要视觉渲染时使用无头模式以提高性能
7. **并发操作**：在可能的情况下使用 `Promise.all()` 进行并行操作

### 文件管理

8. **远程路径使用**：对截图和下载使用 `/home/user/downloads/`
9. **文件传输**：在远程和本地文件系统之间进行适当的文件传输
10. **文件清理**：定期清理不需要的远程文件

### 终端操作

11. **命令结束**：为长时间运行的命令实现适当的结束处理
12. **工作目录**：在运行命令时指定适当的工作目录

### 服务集成

13. **服务组合**：有效结合浏览器、文件和终端服务
14. **错误处理**：为每个服务实现适当的错误处理

### 完整示例

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function bestPracticesExample() {
  const grasp = new Grasp();
  let session;
  let browser;
  
  try {
    // 启动会话
    session = await grasp.launch({
      browser: {
        type: 'chrome-stable',
        headless: true, // 为性能使用无头模式
        adblock: true
      },
      timeout: 3600000,
      debug: true
    });
    
    console.log(`会话已启动: ${session.id}`);
    
    // 浏览器操作
    browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000,
    });
    
    const page = await browser.newPage();
    await page.goto('https://example.com');
    
    // 将截图保存到远程
    await page.screenshot({ path: '/home/user/downloads/example.png' });
    
    await browser.close();
    browser = null;
    
    // 文件操作
    await session.files.writeFile(
      '/home/user/report.txt',
      '任务完成报告\n'
    );
    
    // 终端操作
    const command = await session.terminal.runCommand(
      'ls -la /home/user/downloads/',
      { cwd: '/home/user' }
    );
    await command.end();
    
    // 下载文件到本地
    await Promise.all([
      session.files.downloadFile(
        '/home/user/downloads/example.png',
        './example.png'
      ),
      session.files.downloadFile(
        '/home/user/report.txt',
        './report.txt'
      )
    ]);
    
    console.log('所有任务成功完成');
    
  } catch (error) {
    console.error('发生错误:', error);
    throw error;
  } finally {
    // 资源清理
    if (browser) {
      await browser.close();
    }
    if (session) {
      await session.close();
      console.log('会话已关闭');
    }
  }
}

bestPracticesExample();
```