# Python SDK

Grasp Python SDK 为云环境中的浏览器自动化提供了强大且易于使用的接口。

## 安装

```bash
pip install grasp_sdk
```

## 基本用法

```python
#!/usr/bin/env python3
"""
Grasp SDK Python 使用示例

此示例演示如何使用 grasp_sdk 启动浏览器、
通过 CDP 连接、执行基本操作和截图。
"""

import asyncio
import os
from playwright.async_api import async_playwright
from dotenv import load_dotenv
from grasp_sdk import GraspServer

async def main():
    """主函数：演示基本的 Grasp SDK 用法"""
    
    # 检查 API 密钥
    api_key = os.getenv('GRASP_KEY')
    if not api_key:
        print("⚠️ 警告：未设置 GRASP_KEY 环境变量")
        print("请设置 GRASP_KEY 环境变量或在 .env 文件中配置")
        print("示例：export GRASP_KEY=your_api_key_here")
        return

    print("🚀 启动浏览器...")

    async with GraspServer({
            # 'key': api_key,  # 如果设置了 GRASP_KEY 环境变量则可选
            # 'type': 'chrome-stable',
            # 'headless': False,
            # 'adblock': True,
            # 'debug': True,
            'timeout': 3600000,  # 容器最多运行 1 小时（最大值：86400000 - 24小时）
        }) as connection:
    
        try:
            print(f"连接信息: {connection}")
            print(f"WebSocket URL: {connection['ws_url']}")
            print(f"HTTP URL: {connection['http_url']}")
            
            # 使用 Playwright 连接到 CDP
            async with async_playwright() as p:
                browser = await p.chromium.connect_over_cdp(
                    connection['ws_url'],
                    timeout=150000
                )
                
                # 可选：等待一段时间
                # await asyncio.sleep(10)
                
                # 创建第一个页面并访问网站
                page1 = await browser.new_page()
                await page1.goto('https://getgrasp.ai/', wait_until='domcontentloaded')
                await page1.screenshot(path='grasp-ai.png')
                await page1.close()
                
                # 获取或创建上下文
                contexts = browser.contexts
                context = contexts[0] if contexts else await browser.new_context()
                
                # 创建第二个页面
                page2 = await context.new_page()
                
                # 将 HTML 字符串渲染到页面
                await page2.set_content('<h1>Hello Grasp</h1>', wait_until='networkidle')
                
                # 截图
                await page2.screenshot(path='hello-world.png', full_page=True)
                
                # 清理资源
                await page2.close()
                await context.close()
                await browser.close()
                
            print('✅ 任务完成。')
            
        except Exception as e:
            print(f"❌ 执行过程中出错: {str(e)}")
            raise
        
        finally:
            # 注意：使用异步上下文管理器时，资源会在代码执行结束时自动清理
            # 以最小化消耗。
            print("程序结束，资源将自动清理")

if __name__ == '__main__':
    # 运行主函数
    asyncio.run(main())
```

## API 参考

### `GraspServer(options)`

在云环境中创建浏览器服务器实例。

**参数：**
- `options` (dict): 配置字典，包含以下键：
  - `key` (str, 可选): Grasp API 密钥（如果未提供则使用 `GRASP_KEY` 环境变量）
  - `type` (str, 可选): 浏览器类型 - `'chromium'` 或 `'chrome-stable'`。默认值：`'chromium'`
  - `headless` (bool, 可选): 以无头模式运行。默认值：`True`
  - `timeout` (int, 可选): 连接超时时间（毫秒）。默认值：900000（15分钟），最大值：86400000（24小时）
  - `adblock` (bool, 可选): 启用广告拦截（实验性）。默认值：`False`
  - `debug` (bool, 可选): 启用调试模式以获得详细输出。默认值：`False`

**用法：**
```python
async with GraspServer({
    'key': 'your_api_key_here',
    'type': 'chrome-stable',
    'headless': False,
    'timeout': 3600000,
    'adblock': True,
    'debug': True
}) as connection:
    # 您的自动化代码
    pass
```

## 与 Playwright 一起使用

启动浏览器后，使用 Playwright 的 CDP 连接来连接它：

```python
from playwright.async_api import async_playwright

async with async_playwright() as p:
    browser = await p.chromium.connect_over_cdp(
        connection['ws_url'],
        timeout=150000
    )
    
    # 像使用普通的 Playwright 浏览器实例一样使用浏览器
    page = await browser.new_page()
    # ... 您的自动化代码
    
    await browser.close()
```

## 高级示例

### 多页面和上下文

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import GraspServer

async def multiple_pages():
    """多页面和上下文示例"""
    
    async with GraspServer({'timeout': 3600000}) as connection:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                connection['ws_url'],
                timeout=150000
            )
            
            # 为隔离创建多个上下文
            context1 = await browser.new_context()
            context2 = await browser.new_context()
            
            # 不同上下文中的页面
            page1 = await context1.new_page()
            page2 = await context2.new_page()
            
            # 导航到不同的站点
            await asyncio.gather(
                page1.goto('https://example.com'),
                page2.goto('https://httpbin.org/json')
            )
            
            # 截图
            await asyncio.gather(
                page1.screenshot(path='example.png'),
                page2.screenshot(path='httpbin.png')
            )
            
            # 清理
            await context1.close()
            await context2.close()
            await browser.close()

# 运行示例
asyncio.run(multiple_pages())
```

### 错误处理

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import GraspServer

async def with_error_handling():
    """适当错误处理的示例"""
    
    browser = None
    
    try:
        async with GraspServer({'timeout': 3600000}) as connection:
            async with async_playwright() as p:
                browser = await p.chromium.connect_over_cdp(
                    connection['ws_url'],
                    timeout=150000
                )
                
                page = await browser.new_page()
                await page.goto('https://example.com')
                
                # 您的自动化代码
                
    except Exception as error:
        print(f"浏览器自动化过程中出错: {error}")
        raise
    finally:
        # 始终清理资源
        if browser:
            await browser.close()

# 运行示例
asyncio.run(with_error_handling())
```

### 网页抓取示例

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import GraspServer

async def scrape_website():
    """使用 Grasp SDK 进行网页抓取的示例"""
    
    async with GraspServer({
        'timeout': 3600000,
        'headless': True,  # 抓取时使用无头模式
    }) as connection:
        
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                connection['ws_url'],
                timeout=150000
            )
            
            page = await browser.new_page()
            
            # 导航到目标网站
            await page.goto('https://quotes.toscrape.com/')
            
            # 等待内容加载
            await page.wait_for_selector('.quote')
            
            # 提取引用
            quotes = await page.evaluate('''
                () => {
                    const quotes = [];
                    document.querySelectorAll('.quote').forEach(quote => {
                        quotes.push({
                            text: quote.querySelector('.text').textContent,
                            author: quote.querySelector('.author').textContent,
                            tags: Array.from(quote.querySelectorAll('.tag')).map(tag => tag.textContent)
                        });
                    });
                    return quotes;
                }
            ''')
            
            print(f"抓取了 {len(quotes)} 条引用:")
            for quote in quotes[:3]:  # 打印前 3 条引用
                print(f"- {quote['text']} - {quote['author']}")
            
            await browser.close()

# 运行抓取示例
asyncio.run(scrape_website())
```

## 资源管理

**Python SDK 的重要注意事项：**

- **推荐**：如上述示例所示使用异步上下文管理器。这确保云浏览器和计算资源在代码执行结束时立即回收，最小化消耗。

- **替代方案**：如果不使用异步上下文管理器，资源仍会在 `browser.close()` 后被监控服务销毁，但通常会有几十秒的延迟，这可能导致额外的资源使用。

## 最佳实践

1. **使用异步上下文管理器**：始终使用 `async with GraspServer()` 进行自动资源清理
2. **适当的错误处理**：实现 try-catch 块并在 finally 块中进行清理
3. **资源清理**：始终正确关闭浏览器、上下文和页面
4. **超时配置**：根据您的用例设置适当的超时时间
5. **无头模式**：当不需要视觉渲染时使用无头模式以获得更好的性能
6. **并发操作**：在可能的情况下使用 `asyncio.gather()` 进行并行操作

## 常见模式

### 环境设置

```python
# .env 文件
GRASP_KEY=your_api_key_here

# 在您的 Python 脚本中
import os
from dotenv import load_dotenv

load_dotenv()  # 从 .env 文件加载环境变量

api_key = os.getenv('GRASP_KEY')
if not api_key:
    raise ValueError("需要 GRASP_KEY 环境变量")
```

### 日志记录和调试

```python
import logging
from grasp_sdk import GraspServer

# 启用调试日志记录
logging.basicConfig(level=logging.DEBUG)

async with GraspServer({
    'debug': True,  # 启用调试模式
    'timeout': 3600000,
}) as connection:
    # 您的代码
    pass
```