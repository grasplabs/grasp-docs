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
const connection = await grasp.launchBrowser({
  key: 'your_api_key_here',
  // 其他选项...
});
```

@tab Python

```python
async with GraspServer({
    'key': 'your_api_key_here',
    # 其他选项...
}) as connection:
    # 您的代码
```

:::

## 配置参数

创建 SDK 实例时，您可以设置以下配置参数：

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| `key` | string | 是* | `$GRASP_KEY` | API 密钥（如果设置了 `GRASP_KEY` 环境变量则可选） |
| `type` | enum | 否 | `chromium` | 远程浏览器类型：`chromium` 或 `chrome-stable` |
| `headless` | boolean | 否 | `true` | 无头模式（无头模式节省资源但可能更容易被检测为机器人） |
| `timeout` | integer | 否 | 900000 (15分钟) | Grasp 服务超时时间（毫秒）（最大值：86400000 - 24小时） |
| `adblock` | boolean | 否 | `false` | 启用广告拦截（实验性功能） |
| `debug` | boolean | 否 | `false` | 启用调试模式以获得更详细的终端输出 |

## 最佳实践

1. **使用环境变量**：通过使用环境变量而不是硬编码来保护您的 API 密钥安全
2. **超时配置**：根据您的用例设置适当的超时时间（最大 24 小时）
3. **资源管理**：始终正确关闭浏览器和页面以避免资源泄漏