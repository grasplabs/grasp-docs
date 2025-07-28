# 身份验证

您可以通过两种方式使用 Grasp 进行身份验证：

## 1. 环境变量（推荐）

设置 `GRASP_KEY` 环境变量：

```bash
export GRASP_KEY=your_api_key_here
```

## 2. 直接在代码中使用

在代码中直接传递 API 密钥：

::: code-tabs

@tab TypeScript/Node.js

```typescript
import { Grasp } from '@grasplabs/grasp';

// 使用环境变量
const grasp = new Grasp();
const session = await grasp.launch();

// 或者直接传递 API 密钥
const graspWithKey = new Grasp({ apiKey: 'your_api_key_here' });
const sessionWithKey = await graspWithKey.launch();
```

@tab Python

```python
import os
from grasp_sdk import Grasp

# 使用环境变量
grasp = Grasp()
async with grasp.launch_context() as session:
    # 您的代码
    pass

# 或者直接传递 API 密钥
grasp_with_key = Grasp(api_key='your_api_key_here')
async with grasp_with_key.launch_context() as session:
    # 您的代码
    pass
```

:::

## 配置参数

### Grasp 实例选项

创建 Grasp 实例时，您可以设置以下参数：

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `apiKey` | string | 是* | `$GRASP_KEY` | API 密钥（如果设置了 `GRASP_KEY` 环境变量则可选） |

### 启动选项

调用 `launch()` 方法时，您可以设置以下配置参数：

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `browser.type` | enum | 否 | `chromium` | 远程浏览器类型：`chromium` 或 `chrome-stable` |
| `browser.headless` | boolean | 否 | `true` | 无头模式（无头模式节省资源但可能更容易被检测为机器人） |
| `browser.adblock` | boolean | 否 | `false` | 启用广告拦截（实验性功能） |
| `keepAliveMS` | integer | 否 | 900000 (15分钟) | 会话保活时间（毫秒）（最大值：86400000 - 24小时） |
| `timeout` | integer | 否 | 300000 (5分钟) | 启动超时时间（毫秒） |
| `debug` | boolean | 否 | `false` | 启用调试模式以获得更详细的终端输出 |
| `logLevel` | enum | 否 | `info` | 日志级别：`debug`、`info`、`warn`、`error` |

## 最佳实践

1. **使用环境变量**：通过使用环境变量而不是硬编码来保护您的 API 密钥安全
2. **会话管理**：始终正确关闭会话以避免资源泄漏和意外费用
3. **keepAliveMS 配置**：根据您的用例设置适当的保活时间（最大 24 小时）
4. **错误处理**：实现适当的错误处理以优雅地处理网络问题和超时

## 会话生命周期

::: code-tabs

@tab TypeScript/Node.js

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

const grasp = new Grasp();

try {
  // 启动会话
  const session = await grasp.launch({
    browser: {
      type: 'chromium',
      headless: true,
      adblock: true
    },
    keepAliveMS: 600000, // 10 分钟
    debug: true
  });

  // 连接到浏览器
  const browser = await chromium.connectOverCDP(session.browser.endpoint);
  const page = await browser.newPage();
  
  // 执行您的自动化任务
  await page.goto('https://example.com');
  await page.screenshot({ path: 'screenshot.png' });
  
  // 清理资源
  await browser.close();
  await session.close();
} catch (error) {
  console.error('会话错误:', error);
}
```

@tab Python

```python
import asyncio
from grasp_sdk import Grasp
from playwright.async_api import async_playwright

async def main():
    grasp = Grasp()
    
    # 推荐：使用上下文管理器自动清理
    async with grasp.launch_context({
        'browser': {
            'type': 'chromium',
            'headless': True,
            'adblock': True
        },
        'keep_alive_ms': 600000,  # 10 分钟
        'debug': True
    }) as session:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(session.browser.endpoint)
            page = await browser.new_page()
            
            # 执行您的自动化任务
            await page.goto('https://example.com')
            await page.screenshot(path='screenshot.png')
            
            await browser.close()
    # 会话在退出上下文时自动关闭

if __name__ == '__main__':
    asyncio.run(main())
```

:::