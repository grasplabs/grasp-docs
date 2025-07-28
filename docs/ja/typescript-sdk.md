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
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function main() {
  // Graspインスタンスを作成
  const grasp = new Grasp();
  
  // 新しいセッションを起動
  const session = await grasp.launch({
    browser: {
      type: 'chrome-stable',
      headless: false,
      adblock: true
    },
    timeout: 3600000, // セッションは最大1時間実行（最大値：86400000 - 24時間）
    debug: true
  });
  
  try {
    console.log(`セッション開始: ${session.id}`);
    
    // Playwrightを使用してブラウザに接続
    const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000,
    });
    
    // 最初のページを作成してナビゲート
    const page1 = await browser.newPage();
    await page1.goto('https://getgrasp.ai/', { waitUntil: 'domcontentloaded' });
    
    // スクリーンショットをリモートディレクトリに保存
    await page1.screenshot({ path: '/home/user/downloads/grasp-ai.png' });
    await page1.close();
    
    // コンテキストを取得または作成
    const context = browser.contexts()[0] || await browser.newContext();
    
    // 2番目のページを作成
    const page2 = await context.newPage();
    
    // HTML文字列をページにレンダリング
    await page2.setContent(`<h1>Hello Grasp</h1>`, { waitUntil: 'networkidle' });
    
    // スクリーンショットをリモートディレクトリに保存
    await page2.screenshot({ path: '/home/user/downloads/hello-world.png', fullPage: true });
    
    // ローカルにダウンロード
    await Promise.all([
      session.files.downloadFile('/home/user/downloads/grasp-ai.png', './grasp-ai.png'),
      session.files.downloadFile('/home/user/downloads/hello-world.png', './hello-world.png')
    ]);
    
    // ファイルサービスを使用
    await session.files.writeFile('/home/user/report.txt', 'タスク完了レポート\n');
    const content = await session.files.readFile('/home/user/report.txt');
    console.log('ファイル内容:', content);
    
    // ターミナルサービスを使用
    const command = await session.terminal.runCommand('ls -la /home/user/downloads/');
    await command.end();
    
    // リソースをクリーンアップ
    await page2.close();
    await context.close();
    await browser.close();
    
    console.log('✅ タスク完了。');
  } finally {
    // セッションを閉じる
    await session.close();
  }
}

main();
```

## APIリファレンス

### `Grasp`クラス

メインのGraspクライアントクラス。

#### `constructor(options?)`

**パラメータ：**
- `options` (object, オプション):
  - `key` (string, オプション): Grasp APIキー（提供されない場合は`GRASP_KEY`環境変数を使用）
  - `baseUrl` (string, オプション): Grasp APIのベースURL

### `grasp.launch(options)`

新しいGraspセッションを起動します。

**パラメータ：**
- `options` (object, オプション):
  - `browser` (object, オプション): ブラウザ設定
    - `type` (string, オプション): ブラウザタイプ - `'chromium'` または `'chrome-stable'`。デフォルト：`'chromium'`
    - `headless` (boolean, オプション): ヘッドレスモードで実行。デフォルト：`true`
    - `adblock` (boolean, オプション): 広告ブロックを有効にする。デフォルト：`false`
  - `timeout` (number, オプション): セッションタイムアウト（ミリ秒）。デフォルト：900000（15分）、最大：86400000（24時間）
  - `debug` (boolean, オプション): 詳細出力のためのデバッグモードを有効にする。デフォルト：`false`

**戻り値：**
- `Promise<GraspSession>`: セッションオブジェクト

### `grasp.connect(sessionId)`

既存のセッションに接続します。

**パラメータ：**
- `sessionId` (string): 接続するセッションID

**戻り値：**
- `Promise<GraspSession>`: セッションオブジェクト

### `GraspSession`

アクティブなGraspセッションを表します。

#### プロパティ

- `id` (string): 一意のセッションID
- `browser` (GraspBrowser): ブラウザサービス
- `files` (FileSystemService): ファイルシステムサービス
- `terminal` (TerminalService): ターミナルサービス

#### メソッド

- `close()`: セッションを閉じてリソースをクリーンアップ

### `GraspBrowser`

ブラウザサービス。

#### メソッド

- `getEndpoint()`: Playwright接続用のCDPエンドポイントを取得
- `getInfo()`: ブラウザ情報を取得

### `TerminalService`

ターミナルサービス。

#### メソッド

- `runCommand(command, options?)`: コマンドを実行
  - `command` (string): 実行するコマンド
  - `options` (object, オプション):
    - `cwd` (string, オプション): 作業ディレクトリ
    - `env` (object, オプション): 環境変数
  - 戻り値: `Promise<TerminalCommand>`

### `FileSystemService`

ファイルシステムサービス。

#### メソッド

- `readFile(path)`: ファイルを読み取り
  - `path` (string): ファイルパス
  - 戻り値: `Promise<string>`

- `writeFile(path, content)`: ファイルに書き込み
  - `path` (string): ファイルパス
  - `content` (string): ファイル内容
  - 戻り値: `Promise<void>`

- `downloadFile(remotePath, localPath)`: リモートファイルをローカルにダウンロード
  - `remotePath` (string): リモートファイルパス
  - `localPath` (string): ローカルファイルパス
  - 戻り値: `Promise<void>`

- `uploadFile(localPath, remotePath)`: ローカルファイルをリモートにアップロード
  - `localPath` (string): ローカルファイルパス
  - `remotePath` (string): リモートファイルパス
  - 戻り値: `Promise<void>`

**例：**
```typescript
const grasp = new Grasp();
const session = await grasp.launch({
  browser: {
    type: 'chrome-stable',
    headless: false,
    adblock: true
  },
  timeout: 3600000,
  debug: true
});
```

## Playwrightとの使用

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function main() {
  // Graspインスタンスを作成
  const grasp = new Grasp();
  
  // 新しいセッションを起動
  const session = await grasp.launch({
    browser: {
      type: 'chrome-stable',
      headless: false
    },
    debug: true
  });
  
  try {
    // Playwrightを使用してブラウザに接続
    const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000
    });
    
    // 新しいページを作成
    const page = await browser.newPage();
    
    // ウェブサイトにナビゲート
    await page.goto('https://example.com');
    
    // 要素を操作
    await page.fill('input[name="search"]', 'Grasp SDK');
    await page.click('button[type="submit"]');
    
    // 結果を待機
    await page.waitForSelector('.results');
    
    // スクリーンショットをリモートディレクトリに保存
    await page.screenshot({ path: '/home/user/downloads/search_results.png' });
    
    // スクリーンショットをローカルにダウンロード
    await session.files.downloadFile(
      '/home/user/downloads/search_results.png',
      './search_results.png'
    );
    
    // ブラウザを閉じる
    await browser.close();
  } finally {
    // セッションを閉じる
    await session.close();
  }
}

main();
```

## 高度な例

### 複数ページとコンテキスト

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function multiplePages() {
  const grasp = new Grasp();
  const session = await grasp.launch({
    timeout: 3600000,
  });

  try {
    const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
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

    // スクリーンショットをリモートディレクトリに保存
    await Promise.all([
      page1.screenshot({ path: '/home/user/downloads/example.png' }),
      page2.screenshot({ path: '/home/user/downloads/httpbin.png' })
    ]);

    // スクリーンショットをローカルにダウンロード
    await Promise.all([
      session.files.downloadFile('/home/user/downloads/example.png', './example.png'),
      session.files.downloadFile('/home/user/downloads/httpbin.png', './httpbin.png')
    ]);

    // クリーンアップ
    await context1.close();
    await context2.close();
    await browser.close();
  } finally {
    await session.close();
  }
}
```

### エラーハンドリング

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function withErrorHandling() {
  const grasp = new Grasp();
  let session;
  let browser;
  
  try {
    session = await grasp.launch({
      timeout: 3600000,
    });

    browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
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
    if (session) {
      await session.close();
    }
  }
}
```

### Webスクレイピング例

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function scrapeWebsite() {
  const grasp = new Grasp();
  const session = await grasp.launch({
    browser: {
      headless: true // スクレイピング時はヘッドレスモードを使用
    },
    timeout: 3600000
  });
  
  try {
    const browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000,
    });
    
    const page = await browser.newPage();
    await page.goto('https://quotes.toscrape.com/');
    
    // 引用をスクレイピング
    const quotes = await page.$$eval('.quote', quotes => 
      quotes.map(quote => ({
        text: quote.querySelector('.text')?.textContent,
        author: quote.querySelector('.author')?.textContent,
        tags: Array.from(quote.querySelectorAll('.tag')).map(tag => tag.textContent)
      }))
    );
    
    console.log('スクレイピングした引用:');
    quotes.forEach(quote => {
      console.log(`- "${quote.text}" - ${quote.author}`);
    });
    
    // 結果をファイルに保存
    await session.files.writeFile(
      '/home/user/quotes.json',
      JSON.stringify(quotes, null, 2)
    );
    
    await browser.close();
  } finally {
    await session.close();
  }
}
```

## リソース管理

**重要**：TypeScript SDKを使用する場合、`session.close()`を呼び出した後にリソースが自動的に解放されます。リソースリークを避けるため、常にセッションを適切に閉じることを確認してください。

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function resourceManagement() {
  const grasp = new Grasp();
  let session;
  let browser;
  
  try {
    // セッションを起動
    session = await grasp.launch({
      browser: {
        type: 'chrome-stable',
        headless: false,
        adblock: true
      },
      timeout: 3600000,
      debug: true
    });
    
    // ブラウザに接続
    browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000,
    });
    
    const page = await browser.newPage();
    await page.goto('https://example.com');
    
    // スクリーンショットをリモートディレクトリに保存
    await page.screenshot({ path: '/home/user/downloads/example.png' });
    
    // ローカルにダウンロード
    await session.files.downloadFile(
      '/home/user/downloads/example.png',
      './example.png'
    );
    
    // ファイルサービスを使用
    await session.files.writeFile('/home/user/test.txt', 'Hello Grasp!');
    const content = await session.files.readFile('/home/user/test.txt');
    console.log('ファイル内容:', content);
    
    // ターミナルサービスを使用
    const command = await session.terminal.runCommand('ls -la /home/user');
    await command.end();
    
  } finally {
    // 重要：常にリソースをクリーンアップ
    if (browser) {
      await browser.close();
    }
    if (session) {
      await session.close();
    }
  }
}
```

## ベストプラクティス

### セッション管理

1. **適切なセッション管理**：自動リソースクリーンアップのため常に`session.close()`を使用
2. **セッション再利用**：リソース節約のため複数の操作で同じセッションを使用
3. **タイムアウト設定**：使用ケースに基づいて合理的なタイムアウトを設定

### ブラウザ操作

4. **エラーハンドリング**：適切なtry-catchブロックを実装し、finallyブロックでクリーンアップ
5. **リソースクリーンアップ**：ブラウザ、コンテキスト、ページ、セッションを常に適切に閉じる
6. **ヘッドレスモード**：視覚的レンダリングが不要な場合はパフォーマンス向上のためヘッドレスモードを使用
7. **並行操作**：可能な場合は並行操作に`Promise.all()`を使用

### ファイル管理

8. **リモートパス使用**：スクリーンショットとダウンロードには`/home/user/downloads/`を使用
9. **ファイル転送**：リモートとローカルファイルシステム間で適切なファイル転送を行う
10. **ファイルクリーンアップ**：不要なリモートファイルを定期的にクリーンアップ

### ターミナル操作

11. **コマンド終了**：長時間実行コマンドに対して適切な終了処理を実装
12. **作業ディレクトリ**：コマンド実行時に適切な作業ディレクトリを指定

### サービス統合

13. **サービス組み合わせ**：ブラウザ、ファイル、ターミナルサービスを効果的に組み合わせ
14. **エラーハンドリング**：各サービスに対して適切なエラーハンドリングを実装

### 完全な例

```typescript
import { Grasp } from '@grasplabs/grasp';
import { chromium } from 'playwright';

async function bestPracticesExample() {
  const grasp = new Grasp();
  let session;
  let browser;
  
  try {
    // セッションを起動
    session = await grasp.launch({
      browser: {
        type: 'chrome-stable',
        headless: true, // パフォーマンス向上のためヘッドレスモードを使用
        adblock: true
      },
      timeout: 3600000,
      debug: true
    });
    
    console.log(`セッション開始: ${session.id}`);
    
    // ブラウザ操作
    browser = await chromium.connectOverCDP(session.browser.getEndpoint(), {
      timeout: 150000,
    });
    
    const page = await browser.newPage();
    await page.goto('https://example.com');
    
    // スクリーンショットをリモートに保存
    await page.screenshot({ path: '/home/user/downloads/example.png' });
    
    await browser.close();
    browser = null;
    
    // ファイル操作
    await session.files.writeFile(
      '/home/user/report.txt',
      'タスク完了レポート\n'
    );
    
    // ターミナル操作
    const command = await session.terminal.runCommand(
      'ls -la /home/user/downloads/',
      { cwd: '/home/user' }
    );
    await command.end();
    
    // ファイルをローカルにダウンロード
    await Promise.all([
      session.files.downloadFile(
        '/home/user/downloads/example.png',
        './example.png'
      ),
      session.files.downloadFile(
        '/home/user/report.txt',
        './report.txt'
      )
    ]);
    
    console.log('すべてのタスクが正常に完了しました');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    throw error;
  } finally {
    // リソースクリーンアップ
    if (browser) {
      await browser.close();
    }
    if (session) {
      await session.close();
      console.log('セッションが閉じられました');
    }
  }
}

bestPracticesExample();
```