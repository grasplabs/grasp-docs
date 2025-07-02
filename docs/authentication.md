# Authentication

You can authenticate with Grasp in two ways:

## 1. Environment Variable (Recommended)

Set the `GRASP_KEY` environment variable:

```bash
export GRASP_KEY=your_api_key_here
```

## 2. Direct Code Usage

Pass the API key directly in your code:

::: code-tabs

@tab TypeScript/Node.js

```typescript
const connection = await grasp.launchBrowser({
  key: 'your_api_key_here',
  // other options...
});
```

@tab Python

```python
async with GraspServer({
    'key': 'your_api_key_here',
    # other options...
}) as connection:
    # your code here
```

:::

## Configuration Parameters

When creating an SDK instance, you can set the following configuration parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `key` | string | Yes* | `$GRASP_KEY` | API key (optional if `GRASP_KEY` environment variable is set) |
| `type` | enum | No | `chromium` | Remote browser type: `chromium` or `chrome-stable` |
| `headless` | boolean | No | `true` | Headless mode (headless saves resources but may be more detectable as bot) |
| `timeout` | integer | No | 900000 (15 min) | Grasp service timeout in milliseconds (max: 86400000 - 24 hours) |
| `adblock` | boolean | No | `false` | Enable ad blocking (experimental feature) |
| `debug` | boolean | No | `false` | Enable debug mode for more verbose terminal output |

## Best Practices

1. **Use Environment Variables**: Keep your API keys secure by using environment variables instead of hardcoding them
2. **Timeout Configuration**: Set appropriate timeouts based on your use case (maximum 24 hours)
3. **Resource Management**: Always properly close browsers and pages to avoid resource leaks