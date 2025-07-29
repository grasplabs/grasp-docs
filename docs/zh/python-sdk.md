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

此示例演示如何使用 grasp_sdk 启动浏览器会话，
通过 CDP 连接，执行基本操作，并使用各种服务。
"""

import asyncio
import os
from playwright.async_api import async_playwright
from dotenv import load_dotenv
from grasp_sdk import Grasp

async def main():
    """主函数：演示基本的 Grasp SDK 使用方法"""
    
    # 检查 API 密钥
    api_key = os.getenv('GRASP_KEY')
    if not api_key:
        print("⚠️ 警告：未设置 GRASP_KEY 环境变量")
        print("请设置 GRASP_KEY 环境变量或在 .env 文件中设置")
        print("示例：export GRASP_KEY=your_api_key_here")
        return

    print("🚀 启动浏览器会话...")

    # 创建 Grasp 实例
    grasp = Grasp(api_key=api_key)
    
    # 启动新会话
    session = await grasp.launch({
        'browser': {
            'type': 'chrome-stable',
            'headless': False,
            'adblock': True
        },
        'timeout': 3600000,  # 会话最多运行 1 小时
        'debug': True
    })
    
    try:
        print(f"会话 ID: {session.id}")
        
        # 使用 Playwright 连接到浏览器
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            # 创建页面并访问网站
            page = await browser.new_page()
            await page.goto('https://getgrasp.ai/', wait_until='domcontentloaded')
            
            # 保存截图到远程目录
            await page.screenshot(path='/home/user/downloads/grasp-ai.png')
            
            # 下载截图到本地
            await session.files.download_file(
                '/home/user/downloads/grasp-ai.png',
                './grasp-ai.png'
            )
            
            await page.close()
            await browser.close()
        
        # 使用文件服务
        await session.files.write_file('/home/user/test.txt', 'Hello Grasp!')
        content = await session.files.read_file('/home/user/test.txt')
        print(f"文件内容: {content}")
        
        # 使用终端服务
        command = await session.terminal.run_command('ls -la /home/user')
        await command.end()
        
        print('✅ 任务完成。')
        
    except Exception as e:
        print(f"❌ 执行过程中发生错误: {str(e)}")
        raise
    
    finally:
        # 关闭会话以清理资源
        await session.close()
        print("会话已关闭，资源已清理")

if __name__ == '__main__':
    # 运行主函数
    asyncio.run(main())
```

## API 参考

### `Grasp(api_key)`

创建用于管理浏览器会话的 Grasp 实例。

**参数：**
- `api_key` (str, 可选): Grasp API 密钥（默认使用 `GRASP_KEY` 环境变量）

**示例：**
```python
from grasp_sdk import Grasp

grasp = Grasp(api_key='your_api_key_here')
```

### `grasp.launch(options)`

启动具有综合服务的新浏览器会话。

**参数：**
- `options` (dict, 可选): 配置选项
  - `browser` (dict, 可选): 浏览器配置
    - `type` (str, 可选): 浏览器类型 - `'chromium'` 或 `'chrome-stable'`。默认：`'chromium'`
    - `headless` (bool, 可选): 以无头模式运行。默认：`True`
    - `adblock` (bool, 可选): 启用广告拦截。默认：`False`
    - `liveview` (bool, 可选): 启用实时浏览器监控的实时视图。默认：`False`
  - `timeout` (int, 可选): 最大会话持续时间（毫秒）。默认：900000（15分钟），最大：86400000（24小时）
  - `debug` (bool, 可选): 启用调试模式。默认：`False`

**返回：**
- `GraspSession`: 包含浏览器、终端、文件和代码运行器服务的会话对象

**示例：**
```python
session = await grasp.launch({
    'browser': {
        'type': 'chrome-stable',
        'headless': False,
        'adblock': True,
        'liveview': True
    },
    'timeout': 3600000,
    'debug': True
})
```

### `grasp.connect(session_id)`

连接到现有的浏览器会话。

**参数：**
- `session_id` (str): 要连接的现有会话的 ID

**返回：**
- `GraspSession`: 现有会话的会话对象

### `GraspSession`

提供对所有 Grasp 服务访问的主会话对象。

**属性：**
- `id` (str): 唯一会话标识符
- `browser` (GraspBrowser): 用于 CDP 连接和浏览器管理的浏览器服务
- `terminal` (TerminalService): 用于运行 shell 命令的终端服务
- `files` (FileSystemService): 用于文件操作的文件系统服务

**方法：**

#### `session.get_host(port)`
获取会话中特定端口的主机 URL。

**参数：**
- `port` (int): 端口号

**返回：**
- `str`: 指定端口的主机 URL

#### `session.close()`
关闭会话并释放所有资源。

**返回：**
- `None`

### `GraspBrowser`

用于管理 CDP 连接和浏览器相关操作的浏览器服务。

**方法：**

#### `browser.get_host()`
获取浏览器主机 URL。

**返回：**
- `str`: 浏览器主机 URL

#### `browser.get_endpoint()`
获取用于 CDP 连接的 WebSocket 端点 URL。

**返回：**
- `str`: 用于与 Playwright/Puppeteer 连接的 WebSocket URL

#### `browser.download_replay_video(local_path)` (实验性)
下载浏览器会话的回放视频。

**参数：**
- `local_path` (str): 保存视频文件的本地路径

**返回：**
- `None`

### `TerminalService`

用于在远程环境中执行 shell 命令的终端服务。

**方法：**

#### `terminal.run_command(command, options)`
执行 shell 命令并返回可流式传输的响应。

**参数：**
- `command` (str): 要执行的 shell 命令
- `options` (dict, 可选): 命令执行选项
  - `cwd` (str, 可选): 命令的工作目录
  - `envs` (dict, 可选): 环境变量
  - `timeoutMs` (int, 可选): 命令超时时间（毫秒）
  - `user` (str, 可选): 运行命令的用户
  - `inBackground` (bool, 可选): 在后台运行命令（自动处理）
  - `nohup` (bool, 可选): 使用 nohup 进行后台执行（Grasp 特有）

**返回：**
- `StreamableCommandResult`: 包含以下方法的对象：
  - `end()`: 等待命令完成
  - `kill()`: 终止正在运行的命令
  - `json()`: 以 JSON 格式获取命令结果

### `FileSystemService`

用于在本地和远程环境之间管理文件的文件系统服务。

**方法：**

#### `files.upload_file(local_path, remote_path)`
将文件从本地系统上传到远程环境。

**参数：**
- `local_path` (str): 本地文件路径
- `remote_path` (str): 远程文件路径

**返回：**
- `None`

#### `files.download_file(remote_path, local_path)`
将文件从远程环境下载到本地系统。

**参数：**
- `remote_path` (str): 远程文件路径
- `local_path` (str): 本地文件路径

**返回：**
- `None`

#### `files.write_file(remote_path, content)`
将内容写入远程环境中的文件。

**参数：**
- `remote_path` (str): 远程文件路径
- `content` (str | bytes): 文件内容

**返回：**
- `None`

#### `files.read_file(remote_path, encoding)`
从远程环境读取文件。

**参数：**
- `remote_path` (str): 远程文件路径
- `encoding` (str, 可选): 文件编码 - `'utf8'`、`'base64'` 或 `'binary'`。默认：`'utf8'`

**返回：**
- `str | bytes`: 文件内容

## 与 Playwright 一起使用

启动会话后，使用 Playwright 的 CDP 连接连接到浏览器：

```python
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def main():
    grasp = Grasp()
    session = await grasp.launch({
        'browser': {
            'type': 'chrome-stable',
            'headless': False,
            'liveview': True
        }
    })
    
    async with async_playwright() as p:
        browser = await p.chromium.connect_over_cdp(
            session.browser.get_endpoint(),
            timeout=150000
        )
        
        # 将浏览器用作普通的 Playwright 浏览器实例
        page = await browser.new_page()
        await page.goto('https://example.com')
        
        # 保存截图到远程目录
        await page.screenshot(path='/home/user/downloads/example.png')
        
        # 下载截图到本地
        await session.files.download_file(
            '/home/user/downloads/example.png',
            './example.png'
        )
        
        await page.close()
        await browser.close()
    
    await session.close()
```

## 高级示例

### 多页面和上下文

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def multiple_pages():
    """多页面和上下文示例"""
    
    grasp = Grasp()
    session = await grasp.launch({'timeout': 3600000})
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
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
            
            # 截图到远程目录
            await asyncio.gather(
                page1.screenshot(path='/home/user/downloads/example.png'),
                page2.screenshot(path='/home/user/downloads/httpbin.png')
            )
            
            # 下载截图到本地
            await asyncio.gather(
                session.files.download_file('/home/user/downloads/example.png', './example.png'),
                session.files.download_file('/home/user/downloads/httpbin.png', './httpbin.png')
            )
            
            # 清理
            await context1.close()
            await context2.close()
            await browser.close()
    
    finally:
        await session.close()

# 运行示例
asyncio.run(multiple_pages())
```

### 错误处理

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def with_error_handling():
    """适当错误处理的示例"""
    
    grasp = Grasp()
    session = None
    browser = None
    
    try:
        session = await grasp.launch({'timeout': 3600000})
        
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            page = await browser.new_page()
            await page.goto('https://example.com')
            
            # 保存截图到远程目录
            await page.screenshot(path='/home/user/downloads/example.png')
            
            # 下载截图到本地
            await session.files.download_file(
                '/home/user/downloads/example.png',
                './example.png'
            )
            
            await page.close()
            
    except Exception as error:
        print(f"浏览器自动化过程中出错: {error}")
        raise
    finally:
        # 始终清理资源
        if browser:
            await browser.close()
        if session:
            await session.close()

# 运行示例
asyncio.run(with_error_handling())
```

### 网页抓取示例

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def scrape_website():
    """使用 Grasp SDK 进行网页抓取的示例"""
    
    grasp = Grasp()
    session = await grasp.launch({
        'browser': {
            'type': 'chrome-stable',
            'headless': True,  # 抓取时使用无头模式
            'adblock': True
        },
        'timeout': 3600000,
        'debug': True
    })
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
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
            
            # 将抓取的数据保存到远程文件
            import json
            quotes_json = json.dumps(quotes, ensure_ascii=False, indent=2)
            await session.files.write_file('/home/user/downloads/quotes.json', quotes_json)
            
            # 下载到本地
            await session.files.download_file(
                '/home/user/downloads/quotes.json',
                './quotes.json'
            )
            
            await page.close()
            await browser.close()
    
    finally:
        await session.close()

# 运行抓取示例
asyncio.run(scrape_website())
```

## 资源管理

**Python SDK 的重要注意事项：**

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def resource_management_example():
    """资源管理最佳实践示例"""
    
    grasp = Grasp()
    session = None
    browser = None
    
    try:
        # 启动会话
        session = await grasp.launch({
            'browser': {
                'type': 'chrome-stable',
                'headless': False
            },
            'timeout': 3600000
        })
        
        # 连接到浏览器
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            page = await browser.new_page()
            await page.goto('https://example.com')
            
            # 保存截图到远程目录
            await page.screenshot(path='/home/user/downloads/example.png')
            
            # 使用文件服务
            await session.files.write_file('/home/user/data.txt', 'Hello World')
            content = await session.files.read_file('/home/user/data.txt')
            print(f"文件内容: {content}")
            
            # 使用终端服务
            command = await session.terminal.run_command('ls -la /home/user')
            await command.end()
            
            # 下载文件到本地
            await session.files.download_file(
                '/home/user/downloads/example.png',
                './example.png'
            )
            
            await page.close()
            
    except Exception as e:
        print(f"执行过程中出错: {e}")
        raise
    
    finally:
        # 确保资源被正确清理
        if browser:
            await browser.close()
        if session:
            await session.close()
        print("所有资源已清理")

# 运行示例
asyncio.run(resource_management_example())
```

**重要提示：**
- **推荐**：始终在 `finally` 块中关闭会话，确保资源被正确清理
- **会话管理**：使用 `session.close()` 立即释放云资源，最小化消耗
- **错误处理**：实现适当的错误处理以确保即使在异常情况下也能清理资源

## 最佳实践

1. **会话管理**：始终使用 `try/finally` 块确保会话被正确关闭
2. **适当的错误处理**：实现完整的错误处理并在 finally 块中清理资源
3. **资源清理**：始终正确关闭浏览器、页面和会话
4. **超时设置**：根据用例设置适当的超时时间
5. **无头模式**：当不需要视觉渲染时使用无头模式以提高性能
6. **并发操作**：在可能的情况下使用 `asyncio.gather()` 进行并发操作
7. **文件管理**：使用远程 `/home/user/downloads/` 目录保存文件，然后下载到本地
8. **终端操作**：使用 `session.terminal` 运行命令并等待完成
9. **服务集成**：充分利用 `session.files` 和 `session.terminal` 服务

### 完整的最佳实践示例

```python
import asyncio
import os
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def best_practices_example():
    """展示所有最佳实践的完整示例"""
    
    # 1. 检查 API 密钥
    api_key = os.getenv('GRASP_KEY')
    if not api_key:
        raise ValueError("需要设置 GRASP_KEY 环境变量")
    
    grasp = Grasp(api_key=api_key)
    session = None
    browser = None
    
    try:
        # 2. 启动会话并设置适当的配置
        session = await grasp.launch({
            'browser': {
                'type': 'chrome-stable',
                'headless': False,  # 根据需要调整
                'adblock': True
            },
            'timeout': 3600000,  # 1 小时
            'debug': True
        })
        
        print(f"会话已启动，ID: {session.id}")
        
        # 3. 连接到浏览器
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            # 4. 执行自动化任务
            page = await browser.new_page()
            await page.goto('https://example.com', wait_until='domcontentloaded')
            
            # 5. 文件管理最佳实践
            screenshot_path = '/home/user/downloads/screenshot.png'
            await page.screenshot(path=screenshot_path)
            
            # 6. 使用文件服务
            await session.files.write_file(
                '/home/user/downloads/data.json',
                '{"status": "success", "timestamp": "' + str(asyncio.get_event_loop().time()) + '"}'
            )
            
            # 7. 使用终端服务
            command = await session.terminal.run_command('ls -la /home/user/downloads')
            await command.end()
            
            # 8. 下载文件到本地
            await asyncio.gather(
                session.files.download_file(screenshot_path, './screenshot.png'),
                session.files.download_file('/home/user/downloads/data.json', './data.json')
            )
            
            print("任务完成，文件已下载")
            
            # 9. 清理页面资源
            await page.close()
            
    except Exception as e:
        print(f"执行过程中出错: {e}")
        # 记录错误详情
        import traceback
        traceback.print_exc()
        raise
    
    finally:
        # 10. 确保所有资源被清理
        if browser:
            try:
                await browser.close()
                print("浏览器已关闭")
            except Exception as e:
                print(f"关闭浏览器时出错: {e}")
        
        if session:
            try:
                await session.close()
                print("会话已关闭")
            except Exception as e:
                print(f"关闭会话时出错: {e}")

# 运行最佳实践示例
if __name__ == '__main__':
    asyncio.run(best_practices_example())
```

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