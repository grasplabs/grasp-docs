# Authentication

You can authenticate with Grasp in two ways:

## 1. Environment Variable (Recommended)

Set the `GRASP_KEY` environment variable:

```bash
export GRASP_KEY=your_api_key_here
```

## 2. Direct Code Usage

Pass the API key directly when creating a Grasp instance:

::: code-tabs

@tab TypeScript/Node.js

```typescript
import Grasp from '@grasplabs/grasp';

// Using environment variable (recommended)
const grasp = new Grasp();

// Or pass API key directly
const grasp = new Grasp({ apiKey: 'your_api_key_here' });

// Launch a session
const session = await grasp.launch({
  browser: {
    type: 'chrome-stable',
    adblock: true,
  },
  timeout: 3600000,
  debug: true,
});
```

@tab Python

```python
from grasp_sdk import Grasp

# Using environment variable (recommended)
grasp = Grasp()

# Or pass API key directly
grasp = Grasp(api_key='your_api_key_here')

# Launch a session
async with grasp.launch_context({
    'browser': {
        'type': 'chrome-stable',
        'adblock': True,
    },
    'timeout': 3600000,
    'debug': True,
}) as session:
    # your code here
    pass
```

:::

## Configuration Parameters

### Grasp Instance Options

When creating a Grasp instance:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `apiKey` | string | Yes* | `$GRASP_KEY` | API key (optional if `GRASP_KEY` environment variable is set) |

### Launch Options

When launching a session with `grasp.launch()`:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `browser.type` | enum | No | `chromium` | Browser type: `chromium` or `chrome-stable` |
| `browser.headless` | boolean | No | `true` | Headless mode (saves resources but may be more detectable) |
| `browser.adblock` | boolean | No | `false` | Enable ad blocking capabilities |
| `timeout` | integer | No | 900000 (15 min) | Session timeout in milliseconds (max: 86400000 - 24 hours) |
| `keepAliveMS` | integer | No | 60000 | Keep-alive interval in milliseconds |
| `debug` | boolean | No | `false` | Enable debug mode for verbose output |
| `logLevel` | enum | No | `info` | Log level: `debug`, `info`, `warn`, `error` |

## Best Practices

1. **Use Environment Variables**: Keep your API keys secure by using environment variables instead of hardcoding them
2. **Session Management**: Use the session-based API for better resource management and automatic cleanup
3. **Timeout Configuration**: Set appropriate timeouts based on your use case (maximum 24 hours)
4. **Resource Management**: Always properly close sessions using `session.close()` or use context managers in Python
5. **Keep-Alive Settings**: Configure `keepAliveMS` appropriately to maintain long-running sessions
6. **Error Handling**: Implement proper error handling for network issues and session timeouts

## Session Lifecycle

```typescript
// TypeScript example with proper cleanup
const grasp = new Grasp();
const session = await grasp.launch({ timeout: 3600000 });

try {
  // Your automation code here
  const wsUrl = session.browser.getEndpoint();
  // ... browser automation
} finally {
  await session.close(); // Always clean up
}
```

```python
# Python example with context manager (recommended)
async with Grasp().launch_context({ 'timeout': 3600000 }) as session:
    # Your automation code here
    endpoint = session.browser.get_endpoint()
    # ... browser automation
    # Automatic cleanup when exiting context
```