# 認証

Graspでの認証は2つの方法があります：

## 1. 環境変数（推奨）

`GRASP_KEY` 環境変数を設定します：

```bash
export GRASP_KEY=your_api_key_here
```

## 2. コードでの直接使用

コードでAPIキーを直接渡します：

::: code-tabs

@tab TypeScript/Node.js

```typescript
import { Grasp } from '@grasplabs/grasp';

// 環境変数を使用
const grasp = new Grasp();
const session = await grasp.launch();

// またはAPIキーを直接渡す
const graspWithKey = new Grasp({ apiKey: 'your_api_key_here' });
const sessionWithKey = await graspWithKey.launch();
```

@tab Python

```python
import os
from grasp_sdk import Grasp

# 環境変数を使用
grasp = Grasp()
async with grasp.launch_context() as session:
    # あなたのコード
    pass

# またはAPIキーを直接渡す
grasp_with_key = Grasp(api_key='your_api_key_here')
async with grasp_with_key.launch_context() as session:
    # あなたのコード
    pass
```

:::

## 設定パラメータ

### Graspインスタンスオプション

Graspインスタンスを作成する際、以下のパラメータを設定できます：

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `apiKey` | string | はい* | `$GRASP_KEY` | APIキー（`GRASP_KEY`環境変数が設定されている場合はオプション） |

### 起動オプション

`launch()`メソッドを呼び出す際、以下の設定パラメータを設定できます：

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `browser.type` | enum | いいえ | `chromium` | リモートブラウザタイプ：`chromium` または `chrome-stable` |
| `browser.headless` | boolean | いいえ | `true` | ヘッドレスモード（ヘッドレスはリソースを節約しますが、ボットとして検出されやすい場合があります） |
| `browser.adblock` | boolean | いいえ | `false` | 広告ブロックを有効にする（実験的機能） |
| `keepAliveMS` | integer | いいえ | 900000 (15分) | セッション保持時間（ミリ秒）（最大：86400000 - 24時間） |
| `timeout` | integer | いいえ | 300000 (5分) | 起動タイムアウト（ミリ秒） |
| `debug` | boolean | いいえ | `false` | より詳細なターミナル出力のためのデバッグモードを有効にする |
| `logLevel` | enum | いいえ | `info` | ログレベル：`debug`、`info`、`warn`、`error` |

## ベストプラクティス

1. **環境変数を使用**：APIキーをハードコーディングする代わりに環境変数を使用してセキュリティを保つ
2. **セッション管理**：リソースリークや予期しない料金を避けるため、常にセッションを適切に閉じる
3. **keepAliveMS設定**：使用ケースに基づいて適切な保持時間を設定（最大24時間）
4. **エラーハンドリング**：ネットワーク問題やタイムアウトを適切に処理するためのエラーハンドリングを実装

## セッションライフサイクル

::: code-tabs

@tab TypeScript/Node.js

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

const grasp = new Grasp();

try {
  // セッションを起動
  const session = await grasp.launch({
    browser: {
      type: 'chromium',
      headless: true,
      adblock: true
    },
    keepAliveMS: 600000, // 10分
    debug: true
  });

  // ブラウザに接続
  const browser = await chromium.connectOverCDP(session.browser.endpoint);
  const page = await browser.newPage();
  
  // 自動化タスクを実行
  await page.goto('https://example.com');
  await page.screenshot({ path: 'screenshot.png' });
  
  // リソースをクリーンアップ
  await browser.close();
  await session.close();
} catch (error) {
  console.error('セッションエラー:', error);
}
```

@tab Python

```python
import asyncio
from grasp_sdk import Grasp
from playwright.async_api import async_playwright

async def main():
    grasp = Grasp()
    
    # 推奨：コンテキストマネージャーを使用して自動クリーンアップ
    async with grasp.launch_context({
        'browser': {
            'type': 'chromium',
            'headless': True,
            'adblock': True
        },
        'keep_alive_ms': 600000,  # 10分
        'debug': True
    }) as session:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(session.browser.endpoint)
            page = await browser.new_page()
            
            # 自動化タスクを実行
            await page.goto('https://example.com')
            await page.screenshot(path='screenshot.png')
            
            await browser.close()
    # セッションはコンテキスト終了時に自動的に閉じられます

if __name__ == '__main__':
    asyncio.run(main())
```

:::