# Python SDK

The Grasp Python SDK provides a powerful and easy-to-use interface for browser automation in cloud environments.

## Installation

```bash
pip install grasp_sdk
```

## Basic Usage

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

## API Reference

### `GraspServer(options)`

Creates a browser server instance in the cloud environment.

**Parameters:**
- `options` (dict): Configuration dictionary with the following keys:
  - `key` (str, optional): Grasp API key (uses `GRASP_KEY` env var if not provided)
  - `type` (str, optional): Browser type - `'chromium'` or `'chrome-stable'`. Default: `'chromium'`
  - `headless` (bool, optional): Run in headless mode. Default: `True`
  - `timeout` (int, optional): Connection timeout in milliseconds. Default: 900000 (15 minutes), Max: 86400000 (24 hours)
  - `adblock` (bool, optional): Enable ad blocking (experimental). Default: `False`
  - `debug` (bool, optional): Enable debug mode for verbose output. Default: `False`

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

## Using with Playwright

After launching a browser, connect to it using Playwright's CDP connection:

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

## Advanced Examples

### Multiple Pages and Contexts

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import GraspServer

async def multiple_pages():
    """Example with multiple pages and contexts"""
    
    async with GraspServer({'timeout': 3600000}) as connection:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                connection['ws_url'],
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
            
            # Take screenshots
            await asyncio.gather(
                page1.screenshot(path='example.png'),
                page2.screenshot(path='httpbin.png')
            )
            
            # Clean up
            await context1.close()
            await context2.close()
            await browser.close()

# Run the example
asyncio.run(multiple_pages())
```

### Error Handling

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import GraspServer

async def with_error_handling():
    """Example with proper error handling"""
    
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
                
                # Your automation code here
                
    except Exception as error:
        print(f"Error during browser automation: {error}")
        raise
    finally:
        # Always clean up resources
        if browser:
            await browser.close()

# Run the example
asyncio.run(with_error_handling())
```

### Web Scraping Example

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import GraspServer

async def scrape_website():
    """Example of web scraping with Grasp SDK"""
    
    async with GraspServer({
        'timeout': 3600000,
        'headless': True,  # Use headless mode for scraping
    }) as connection:
        
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                connection['ws_url'],
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

# Run the scraping example
asyncio.run(scrape_website())
```

## Resource Management

**Important Notes for Python SDK:**

- **Recommended**: Use the async context manager as shown in the examples above. This ensures cloud browser and compute resources are immediately reclaimed when code execution ends, minimizing consumption.

- **Alternative**: If not using the async context manager, resources will still be destroyed by the monitoring service after `browser.close()`, but usually with a delay of several tens of seconds, which may cause additional resource usage.

## Best Practices

1. **Use Async Context Managers**: Always use `async with GraspServer()` for automatic resource cleanup
2. **Proper Error Handling**: Implement try-catch blocks and cleanup in finally blocks
3. **Resource Cleanup**: Always close browsers, contexts, and pages properly
4. **Timeout Configuration**: Set appropriate timeouts based on your use case
5. **Headless Mode**: Use headless mode for better performance when visual rendering isn't needed
6. **Concurrent Operations**: Use `asyncio.gather()` for parallel operations when possible

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

### Logging and Debugging

```python
import logging
from grasp_sdk import GraspServer

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

async with GraspServer({
    'debug': True,  # Enable debug mode
    'timeout': 3600000,
}) as connection:
    # Your code here
    pass
```