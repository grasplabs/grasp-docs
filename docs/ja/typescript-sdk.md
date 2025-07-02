# TypeScript/Node.js SDK

Grasp TypeScript/Node.js SDKは、クラウド環境でブラウザを自動化するためのシンプルで強力な方法を提供します。

## インストール

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

## 基本的な使用方法

```typescript
import grasp from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function main() {
  // クラウド環境でブラウザを起動
  const connection = await grasp.launchBrowser({
    // key: process.env.GRASP_KEY || '', // GRASP_KEY環境変数が設定されている場合はオプション
    // type: 'chrome-stable',
    // headless: false, 
    // adblock: true, 
    // debug: true,
    timeout: 3600000, // コンテナは最大1時間実行（最大値：86400000 - 24時間）
  });

  console.log('ブラウザ接続:', connection);

  // Playwrightを使用してブラウザに接続
  const browser = await chromium.connectOverCDP(connection.wsUrl, {
    timeout: 150000,
  });

  // オプション：しばらく待機
  // await setTimeout(10000);

  // 最初のページを作成してナビゲート
  const page1 = await browser.newPage();
  await page1.goto('https://getgrasp.ai/', { waitUntil: 'domcontentloaded' });
  await page1.screenshot({ path: 'grasp-ai.png' });
  await page1.close();

  // コンテキストを取得または作成
  const context = browser.contexts()[0] || await browser.newContext();

  // 2番目のページを作成
  const page2 = await context.newPage();

  // HTML文字列をページにレンダリング
  await page2.setContent(`<h1>Hello Grasp</h1>`, { waitUntil: 'networkidle' });

  // スクリーンショットを撮る
  await page2.screenshot({ path: 'hello-world.png', fullPage: true });

  // リソースをクリーンアップ
  await page2.close();
  await context.close();
  await browser.close();

  console.log('✅ タスク完了。');
}

main();
```

## APIリファレンス

### `grasp.launchBrowser(options)`

クラウド環境でブラウザインスタンスを起動します。

**パラメータ：**
- `options` (object, オプション):
  - `key` (string, オプション): Grasp APIキー（提供されない場合は`GRASP_KEY`環境変数を使用）
  - `type` (string, オプション): ブラウザタイプ - `'chromium'` または `'chrome-stable'`。デフォルト：`'chromium'`
  - `headless` (boolean, オプション): ヘッドレスモードで実行。デフォルト：`true`
  - `timeout` (number, オプション): 接続タイムアウト（ミリ秒）。デフォルト：900000（15分）、最大：86400000（24時間）
  - `adblock` (boolean, オプション): 広告ブロックを有効にする（実験的）。デフォルト：`false`
  - `debug` (boolean, オプション): 詳細出力のためのデバッグモードを有効にする。デフォルト：`false`

**戻り値：**
- `Promise<Connection>`: 以下を含む接続オブジェクト：
  - `id` (string): 一意のブラウザインスタンスID
  - `httpUrl` (string): CDP接続用のHTTP URL
  - `wsUrl` (string): CDP接続用のWebSocket URL

**例：**
```typescript
const connection = await grasp.launchBrowser({
  key: 'your_api_key_here',
  type: 'chrome-stable',
  headless: false,
  timeout: 3600000,
  adblock: true,
  debug: true
});
```

## Playwrightとの使用

ブラウザを起動した後、PlaywrightのCDP接続を使用して接続します：

```typescript
import { chromium } from 'playwright';

const connection = await grasp.launchBrowser();
const browser = await chromium.connectOverCDP(connection.wsUrl, {
  timeout: 150000
});

// 通常のPlaywrightブラウザインスタンスとしてブラウザを使用
const page = await browser.newPage();
// ... あなたの自動化コード

await browser.close();
```

## 高度な例

### 複数ページとコンテキスト

```typescript
import grasp from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function multiplePages() {
  const connection = await grasp.launchBrowser({
    timeout: 3600000,
  });

  const browser = await chromium.connectOverCDP(connection.wsUrl, {
    timeout: 150000,
  });

  // 分離のために複数のコンテキストを作成
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();

  // 異なるコンテキストのページ
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // 異なるサイトにナビゲート
  await Promise.all([
    page1.goto('https://example.com'),
    page2.goto('https://httpbin.org/json')
  ]);

  // スクリーンショットを撮る
  await Promise.all([
    page1.screenshot({ path: 'example.png' }),
    page2.screenshot({ path: 'httpbin.png' })
  ]);

  // クリーンアップ
  await context1.close();
  await context2.close();
  await browser.close();
}
```

### エラーハンドリング

```typescript
import grasp from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function withErrorHandling() {
  let browser;
  
  try {
    const connection = await grasp.launchBrowser({
      timeout: 3600000,
    });

    browser = await chromium.connectOverCDP(connection.wsUrl, {
      timeout: 150000,
    });

    const page = await browser.newPage();
    await page.goto('https://example.com');
    
    // あなたの自動化コード
    
  } catch (error) {
    console.error('ブラウザ自動化中のエラー:', error);
    throw error;
  } finally {
    // 常にリソースをクリーンアップ
    if (browser) {
      await browser.close();
    }
  }
}
```

## リソース管理

**重要**：Node.js SDKを使用する場合、`browser.close()`を呼び出した後にリソースが自動的に解放されます。リソースリークを避けるため、常にブラウザとページを適切に閉じることを確認してください。

## ベストプラクティス

1. **常にリソースを閉じる**：`browser.close()`、`context.close()`、`page.close()`を適切に使用
2. **エラーハンドリング**：適切なtry-catchブロックを実装し、finallyブロックでクリーンアップ
3. **タイムアウト設定**：使用ケースに基づいて合理的なタイムアウトを設定
4. **コンテキスト分離**：干渉を避けるため、異なるタスクには別々のコンテキストを使用
5. **並行操作**：可能な場合は並行操作に`Promise.all()`を使用