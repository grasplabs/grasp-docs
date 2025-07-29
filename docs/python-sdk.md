# Python SDK

The Grasp Python SDK provides a comprehensive solution for browser automation, code execution, file management, and terminal operations in cloud environments.

## Installation

```bash
pip install grasp_sdk
```

## Basic Usage

```python
#!/usr/bin/env python3
"""
Grasp SDK Python Usage Example

This example demonstrates how to use grasp_sdk with the new session-based API
for browser automation, file operations, and terminal commands.
"""

import asyncio
import os
from playwright.async_api import async_playwright
from dotenv import load_dotenv
from grasp_sdk import Grasp

async def main():
    """Main function: demonstrates basic Grasp SDK usage"""
    
    # Check for API key
    api_key = os.getenv('GRASP_KEY')
    if not api_key:
        print("⚠️ Warning: GRASP_KEY environment variable not set")
        print("Please set GRASP_KEY environment variable or configure in .env file")
        print("Example: export GRASP_KEY=your_api_key_here")
        return

    print("🚀 Starting browser session...")

    # Create Grasp instance
    grasp = Grasp({'apiKey': api_key})
    
    # Launch session
    session = await grasp.launch({
        'browser': {
            'type': 'chrome-stable',
            'headless': False,
            'adblock': True,
            'liveview': True
        },
        'timeout': 3600000,  # Session runs for max 1 hour
        'debug': True
    })
    
    try:
        print(f"Session ID: {session.id}")
        print(f"WebSocket URL: {session.browser.get_endpoint()}")
        
        # Use Playwright to connect to browser
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            # Create page and visit website
            page = await browser.new_page()
            await page.goto('https://getgrasp.ai/', wait_until='domcontentloaded')
            
            # Take screenshot and save to remote downloads
            await page.screenshot(path='/home/user/downloads/grasp-ai.png')
            
            # Download screenshot to local
            await session.files.download_file('/home/user/downloads/grasp-ai.png', './grasp-ai.png')
            
            # Create HTML content and screenshot
            await page.set_content('<h1>Hello Grasp</h1>', wait_until='networkidle')
            await page.screenshot(path='/home/user/downloads/hello-world.png', full_page=True)
            
            await browser.close()
        
        # Use terminal service
        terminal_result = await session.terminal.run_command('echo "Hello from terminal!"')
        await terminal_result.end()
        print(f"Terminal output: {terminal_result.stdout.getvalue()}")
        
        # Use files service
        await session.files.write_file('/home/user/downloads/test.txt', 'Hello from Python SDK!')
        content = await session.files.read_file('/home/user/downloads/test.txt')
        print(f"File content: {content}")
        
        print('✅ Task completed.')
        
    except Exception as e:
        print(f"❌ Error during execution: {str(e)}")
        raise
    
    finally:
        # Always close the session
        await session.close()
        print("Session closed, resources cleaned up")

if __name__ == '__main__':
    # Run main function
    asyncio.run(main())
```

## API Reference

### Grasp Class

The main entry point for the Grasp SDK.

```python
from grasp_sdk import Grasp

grasp = Grasp(options)
```

**Parameters:**
- `options` (dict): Configuration options
  - `apiKey` (str, optional): API key (defaults to GRASP_KEY environment variable)
  - `region` (str, optional): Server region

**Methods:**

#### `launch(options=None)`

Launches a new browser session.

**Parameters:**
- `options` (dict, optional): Launch configuration
  - `browser` (dict, optional): Browser configuration
    - `type` (str): Browser type ('chrome-stable', 'chrome-dev', 'firefox')
    - `headless` (bool): Run browser in headless mode
    - `adblock` (bool): Enable ad blocking
    - `liveview` (bool): Enable live view for real-time browser monitoring
  - `timeout` (int): Session timeout in milliseconds
  - `debug` (bool): Enable debug mode

**Returns:**
- `GraspSession`: Session instance

#### `connect(session_id)`

Connects to an existing session.

**Parameters:**
- `session_id` (str): Session ID to connect to

**Returns:**
- `GraspSession`: Session instance

### GraspSession Class

Represents an active browser session with integrated services.

**Properties:**
- `id` (str): Session identifier
- `browser` (GraspBrowser): Browser service instance
- `terminal` (TerminalService): Terminal service instance
- `files` (FileSystemService): File system service instance

**Methods:**

#### `get_host(port)`

Gets the external host address for a specific port.

**Parameters:**
- `port` (int): Port number

**Returns:**
- `str`: External host URL

#### `close()`

Closes the session and cleans up all resources.

### GraspBrowser Class

Provides browser-specific functionality.

**Methods:**

#### `get_host()`

Gets the browser host address.

**Returns:**
- `str`: Browser host URL

#### `get_endpoint()`

Gets the WebSocket endpoint URL for CDP connection.

**Returns:**
- `str`: WebSocket URL for Playwright connection

#### `download_replay_video(local_path)`

Downloads session replay video (requires terminal and files services).

**Parameters:**
- `local_path` (str): Local path to save the video

#### `get_current_page_target_info()` (Experimental)

Gets information about the current page target.

**Returns:**
- `dict`: Page target information

#### `get_liveview_streaming_url()` (Experimental)

Gets the live view streaming URL.

**Returns:**
- `str`: Streaming URL

#### `get_liveview_page_url()` (Experimental)

Gets the live view page URL.

**Returns:**
- `str`: Live view page URL

### TerminalService Class

Provides terminal command execution capabilities.

#### `run_command(command, options=None)`

Executes a command in the sandbox terminal.

**Parameters:**
- `command` (str): Command to execute
- `options` (dict, optional): Execution options
  - `cwd` (str): Working directory
  - `envs` (dict): Environment variables
  - `timeoutMs` (int): Command timeout in milliseconds
  - `user` (str): User to run the command as
  - `inBackground` (bool): Run command in background (handled automatically)
  - `nohup` (bool): Use nohup for background execution (Grasp-specific)

**Returns:**
- `StreamableCommandResult`: Command result with streaming capabilities

**StreamableCommandResult Methods:**
- `on(event, callback)`: Register event listener ('data', 'error', 'end')
- `off(event, callback)`: Remove event listener
- `end()`: Wait for command completion
- `kill()`: Terminate the command
- `json()`: Get result as JSON (for commands that output JSON)

**Properties:**
- `stdout` (StringIO): Standard output stream
- `stderr` (StringIO): Standard error stream

### FileSystemService Class

Provides file system operations in the sandbox.

#### `upload_file(local_path, remote_path)`

Uploads a file from local to sandbox.

**Parameters:**
- `local_path` (str): Local file path
- `remote_path` (str): Remote file path in sandbox

#### `download_file(remote_path, local_path)`

Downloads a file from sandbox to local.

**Parameters:**
- `remote_path` (str): Remote file path in sandbox
- `local_path` (str): Local file path

#### `write_file(remote_path, content)`

Writes content to a file in the sandbox.

**Parameters:**
- `remote_path` (str): Remote file path
- `content` (str): File content

#### `read_file(remote_path)`

Reads content from a file in the sandbox.

**Parameters:**
- `remote_path` (str): Remote file path

**Returns:**
- `str`: File content

#### `sync_downloads_directory(local_dir)` (Experimental)

Synchronizes the sandbox downloads directory with a local directory.

**Parameters:**
- `local_dir` (str): Local directory path

## Using with Playwright

The Grasp SDK integrates seamlessly with Playwright for browser automation:

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def playwright_example():
    # Create Grasp instance and launch session
    grasp = Grasp({'apiKey': 'your_api_key'})
    session = await grasp.launch({
        'browser': {
            'type': 'chrome-stable',
            'headless': False
        },
        'timeout': 3600000
    })
    
    try:
        async with async_playwright() as p:
            # Connect to the remote browser
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            # Create a new page
            page = await browser.new_page()
            
            # Navigate and interact
            await page.goto('https://example.com')
            await page.fill('input[name="search"]', 'Grasp SDK')
            await page.click('button[type="submit"]')
            
            # Take screenshot and save to remote downloads
            await page.screenshot(path='/home/user/downloads/result.png')
            
            # Download screenshot to local
            await session.files.download_file('/home/user/downloads/result.png', './result.png')
            
            # Clean up
            await browser.close()
    
    finally:
        # Always close the session
        await session.close()

asyncio.run(playwright_example())
```

## Advanced Examples

### Multiple Pages and Contexts

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def multiple_pages():
    """Example with multiple pages and contexts"""
    
    # Create Grasp instance and launch session
    grasp = Grasp({'apiKey': 'your_api_key'})
    session = await grasp.launch({
        'browser': {
            'type': 'chrome-stable',
            'headless': False
        },
        'timeout': 3600000
    })
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            # Create multiple contexts for isolation
            context1 = await browser.new_context()
            context2 = await browser.new_context()
            
            # Pages in different contexts
            page1 = await context1.new_page()
            page2 = await context2.new_page()
            
            # Navigate to different sites
            await asyncio.gather(
                page1.goto('https://example.com'),
                page2.goto('https://httpbin.org/json')
            )
            
            # Take screenshots and save to remote downloads
            await asyncio.gather(
                page1.screenshot(path='/home/user/downloads/example.png'),
                page2.screenshot(path='/home/user/downloads/httpbin.png')
            )
            
            # Download screenshots to local
            await session.files.download_file('/home/user/downloads/example.png', './example.png')
            await session.files.download_file('/home/user/downloads/httpbin.png', './httpbin.png')
            
            # Clean up
            await context1.close()
            await context2.close()
            await browser.close()
    
    finally:
        # Always close the session
        await session.close()

# Run the example
asyncio.run(multiple_pages())
```

### Error Handling

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def with_error_handling():
    """Example with proper error handling"""
    
    # Create Grasp instance and launch session
    grasp = Grasp({'apiKey': 'your_api_key'})
    session = await grasp.launch({
        'browser': {
            'type': 'chrome-stable',
            'headless': False
        },
        'timeout': 3600000
    })
    
    browser = None
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            page = await browser.new_page()
            await page.goto('https://example.com')
            
            # Your automation code here
            
    except Exception as error:
        print(f"Error during browser automation: {error}")
        raise
    finally:
        # Always clean up resources
        if browser:
            await browser.close()
        # Always close the session
        await session.close()

# Run the example
asyncio.run(with_error_handling())
```

### Web Scraping Example

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def scrape_website():
    """Example of web scraping with Grasp SDK"""
    
    # Create Grasp instance and launch session
    grasp = Grasp({'apiKey': 'your_api_key'})
    session = await grasp.launch({
        'browser': {
            'type': 'chrome-stable',
            'headless': True  # Use headless mode for scraping
        },
        'timeout': 3600000
    })
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            page = await browser.new_page()
            
            # Navigate to target website
            await page.goto('https://quotes.toscrape.com/')
            
            # Wait for content to load
            await page.wait_for_selector('.quote')
            
            # Extract quotes
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
            
            print(f"Scraped {len(quotes)} quotes:")
            for quote in quotes[:3]:  # Print first 3 quotes
                print(f"- {quote['text']} - {quote['author']}")
            
            await browser.close()
    
    finally:
        # Always close the session
        await session.close()

# Run the scraping example
asyncio.run(scrape_website())
```

## Resource Management

Proper resource management is crucial when working with cloud browsers:

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def resource_management_example():
    """Example showing proper resource management"""
    
    # Create Grasp instance
    grasp = Grasp({'apiKey': 'your_api_key'})
    session = None
    browser = None
    
    try:
        # Launch session
        session = await grasp.launch({
            'browser': {
                'type': 'chrome-stable',
                'headless': False
            },
            'timeout': 3600000
        })
        
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            page = await browser.new_page()
            await page.goto('https://example.com')
            
            # Take screenshot and save to remote downloads
            await page.screenshot(path='/home/user/downloads/example.png')
            
            # Download screenshot to local using session.files
            await session.files.download_file('/home/user/downloads/example.png', './example.png')
            
            # Use terminal service for additional operations
            terminal_result = await session.terminal.run_command('ls -la /home/user/downloads/')
            await terminal_result.end()
            print(f"Downloads directory: {terminal_result.stdout.getvalue()}")
            
    except Exception as e:
        print(f"Error: {e}")
        
    finally:
        # Clean up in proper order
        if browser:
            await browser.close()
        if session:
            await session.close()

asyncio.run(resource_management_example())
```

**Important Notes for Python SDK:**

- **Recommended**: Always use proper session management with `try/finally` blocks as shown in the examples above. This ensures cloud browser and compute resources are immediately reclaimed when code execution ends, minimizing consumption.

- **Alternative**: If not properly closing sessions, resources will still be destroyed by the monitoring service after the session timeout, but this may cause additional resource usage.

## Best Practices

### Session Management
1. **Always Close Sessions**: Use `try/finally` blocks to ensure sessions are closed properly
2. **Single Session Per Task**: Create one session per automation task for better isolation
3. **Proper Error Handling**: Implement comprehensive error handling with cleanup
4. **Timeout Configuration**: Set appropriate timeouts based on your use case

### Browser Operations
1. **Headless Mode**: Use headless mode for better performance when visual rendering isn't needed
2. **Connection Timeouts**: Set appropriate CDP connection timeouts (recommended: 150000ms)
3. **Resource Cleanup**: Always close browsers, contexts, and pages in proper order
4. **Graceful Degradation**: Handle network issues and browser crashes gracefully

### File Management
1. **Use Remote Paths**: Save files to `/home/user/downloads/` in the sandbox first
2. **Download When Needed**: Use `session.files.download_file()` to transfer files locally
3. **Batch Operations**: Group file operations when possible for better performance
4. **Clean Up Remote Files**: Remove temporary files from the sandbox when done

### Terminal Operations
1. **Stream Handling**: Always call `await result.end()` for terminal commands
2. **Error Checking**: Check both stdout and stderr for command results
3. **Working Directory**: Use the `cwd` option to set the working directory
4. **Environment Variables**: Pass environment variables through the `envs` option
5. **User Context**: Use the `user` option to run commands as specific users
6. **Timeout Management**: Set appropriate timeouts using `timeoutMs` option

### Integration with Services
1. **Combine Services**: Use browser, terminal, and files services together for complex workflows
2. **Service Dependencies**: Ensure services are available before using them
3. **Async Operations**: Use `asyncio.gather()` for concurrent operations when safe

### Debug Mode

Enable debug mode for troubleshooting:

```python
import logging
from grasp_sdk import Grasp

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

# Create Grasp instance and launch session with debug mode
grasp = Grasp({'apiKey': 'your_api_key'})
session = await grasp.launch({
    'browser': {
        'type': 'chrome-stable',
        'headless': False
    },
    'debug': True,  # Enable debug mode
    'timeout': 3600000
})

try:
    # Your code here
    pass
finally:
    await session.close()
```

### Complete Example with Best Practices

```python
import asyncio
import logging
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def best_practices_example():
    """Example demonstrating all best practices"""
    
    grasp = Grasp({'apiKey': 'your_api_key'})
    session = None
    browser = None
    
    try:
        # Launch session with proper configuration
        session = await grasp.launch({
            'browser': {
                'type': 'chrome-stable',
                'headless': True,  # Use headless for production
                'adblock': True
            },
            'timeout': 3600000,
            'debug': False
        })
        
        logger.info(f"Session started: {session.id}")
        
        # Connect to browser with timeout
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            # Create page and navigate
            page = await browser.new_page()
            await page.goto('https://example.com', wait_until='domcontentloaded')
            
            # Take screenshot to remote location
            screenshot_path = '/home/user/downloads/screenshot.png'
            await page.screenshot(path=screenshot_path, full_page=True)
            
            # Use terminal to check file
            terminal_result = await session.terminal.run_command(f'ls -la {screenshot_path}')
            await terminal_result.end()
            
            if terminal_result.stdout.getvalue():
                logger.info("Screenshot saved successfully")
                
                # Download to local
                await session.files.download_file(screenshot_path, './local_screenshot.png')
                logger.info("Screenshot downloaded to local")
            
            # Clean up remote file
            cleanup_result = await session.terminal.run_command(f'rm {screenshot_path}')
            await cleanup_result.end()
            
    except Exception as e:
        logger.error(f"Error during automation: {e}")
        raise
        
    finally:
        # Clean up in proper order
        if browser:
            await browser.close()
            logger.info("Browser closed")
        
        if session:
            await session.close()
            logger.info("Session closed")

if __name__ == '__main__':
    asyncio.run(best_practices_example())
```

## Common Patterns

### Environment Setup

```python
# .env file
GRASP_KEY=your_api_key_here

# In your Python script
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

api_key = os.getenv('GRASP_KEY')
if not api_key:
    raise ValueError("GRASP_KEY environment variable is required")
```