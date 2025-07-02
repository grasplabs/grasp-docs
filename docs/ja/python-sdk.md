# Python SDK

Grasp Python SDKは、クラウド環境でのブラウザ自動化のための強力で使いやすいインターフェースを提供します。

## インストール

```bash
pip install grasp_sdk
```

## 基本的な使用方法

```python
#!/usr/bin/env python3
"""
Grasp SDK Python 使用例

この例では、grasp_sdkを使用してブラウザを起動し、
CDPで接続し、基本的な操作を実行し、スクリーンショットを撮る方法を示します。
"""

import asyncio
import os
from playwright.async_api import async_playwright
from dotenv import load_dotenv
from grasp_sdk import GraspServer

async def main():
    """メイン関数：基本的なGrasp SDKの使用方法を示します"""
    
    # APIキーをチェック
    api_key = os.getenv('GRASP_KEY')
    if not api_key:
        print("⚠️ 警告：GRASP_KEY環境変数が設定されていません")
        print("GRASP_KEY環境変数を設定するか、.envファイルで設定してください")
        print("例：export GRASP_KEY=your_api_key_here")
        return

    print("🚀 ブラウザを起動中...")

    async with GraspServer({
            # 'key': api_key,  # GRASP_KEY環境変数が設定されている場合はオプション
            # 'type': 'chrome-stable',
            # 'headless': False,
            # 'adblock': True,
            # 'debug': True,
            'timeout': 3600000,  # コンテナは最大1時間実行（最大：86400000 - 24時間）
        }) as connection:
    
        try:
            print(f"接続情報: {connection}")
            print(f"WebSocket URL: {connection['ws_url']}")
            print(f"HTTP URL: {connection['http_url']}")
            
            # PlaywrightでCDPに接続
            async with async_playwright() as p:
                browser = await p.chromium.connect_over_cdp(
                    connection['ws_url'],
                    timeout=150000
                )
                
                # オプション：しばらく待機
                # await asyncio.sleep(10)
                
                # 最初のページを作成してウェブサイトを訪問
                page1 = await browser.new_page()
                await page1.goto('https://getgrasp.ai/', wait_until='domcontentloaded')
                await page1.screenshot(path='grasp-ai.png')
                await page1.close()
                
                # コンテキストを取得または作成
                contexts = browser.contexts
                context = contexts[0] if contexts else await browser.new_context()
                
                # 2番目のページを作成
                page2 = await context.new_page()
                
                # HTML文字列をページにレンダリング
                await page2.set_content('<h1>Hello Grasp</h1>', wait_until='networkidle')
                
                # スクリーンショットを撮る
                await page2.screenshot(path='hello-world.png', full_page=True)
                
                # リソースをクリーンアップ
                await page2.close()
                await context.close()
                await browser.close()
                
            print('✅ タスク完了。')
            
        except Exception as e:
            print(f"❌ 実行中にエラーが発生しました: {str(e)}")
            raise
        
        finally:
            # 注意：非同期コンテキストマネージャーを使用する場合、
            # コード実行終了時にリソースが自動的にクリーンアップされ、
            # 消費を最小化します。
            print("プログラム終了、リソースは自動的にクリーンアップされます")

if __name__ == '__main__':
    # メイン関数を実行
    asyncio.run(main())
```

## APIリファレンス

### `GraspServer(options)`

クラウド環境でブラウザサーバーインスタンスを作成します。

**パラメータ：**
- `options` (dict): 以下のキーを含む設定辞書：
  - `key` (str, オプション): Grasp APIキー（提供されない場合は`GRASP_KEY`環境変数を使用）
  - `type` (str, オプション): ブラウザタイプ - `'chromium'` または `'chrome-stable'`。デフォルト：`'chromium'`
  - `headless` (bool, オプション): ヘッドレスモードで実行。デフォルト：`True`
  - `timeout` (int, オプション): 接続タイムアウト（ミリ秒）。デフォルト：900000（15分）、最大：86400000（24時間）
  - `adblock` (bool, オプション): 広告ブロックを有効にする（実験的）。デフォルト：`False`
  - `debug` (bool, オプション): 詳細出力のためのデバッグモードを有効にする。デフォルト：`False`

**使用方法：**
```python
async with GraspServer({
    'key': 'your_api_key_here',
    'type': 'chrome-stable',
    'headless': False,
    'timeout': 3600000,
    'adblock': True,
    'debug': True
}) as connection:
    # あなたの自動化コード
    pass
```

## Playwrightとの使用

ブラウザを起動した後、PlaywrightのCDP接続を使用して接続します：

```python
from playwright.async_api import async_playwright

async with async_playwright() as p:
    browser = await p.chromium.connect_over_cdp(
        connection['ws_url'],
        timeout=150000
    )
    
    # 通常のPlaywrightブラウザインスタンスとしてブラウザを使用
    page = await browser.new_page()
    # ... あなたの自動化コード
    
    await browser.close()
```

## 高度な例

### 複数ページとコンテキスト

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import GraspServer

async def multiple_pages():
    """複数ページとコンテキストの例"""
    
    async with GraspServer({'timeout': 3600000}) as connection:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                connection['ws_url'],
                timeout=150000
            )
            
            # 分離のために複数のコンテキストを作成
            context1 = await browser.new_context()
            context2 = await browser.new_context()
            
            # 異なるコンテキストのページ
            page1 = await context1.new_page()
            page2 = await context2.new_page()
            
            # 異なるサイトにナビゲート
            await asyncio.gather(
                page1.goto('https://example.com'),
                page2.goto('https://httpbin.org/json')
            )
            
            # スクリーンショットを撮る
            await asyncio.gather(
                page1.screenshot(path='example.png'),
                page2.screenshot(path='httpbin.png')
            )
            
            # クリーンアップ
            await context1.close()
            await context2.close()
            await browser.close()

# 例を実行
asyncio.run(multiple_pages())
```

### エラーハンドリング

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import GraspServer

async def with_error_handling():
    """適切なエラーハンドリングの例"""
    
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
                
                # あなたの自動化コード
                
    except Exception as error:
        print(f"ブラウザ自動化中のエラー: {error}")
        raise
    finally:
        # 常にリソースをクリーンアップ
        if browser:
            await browser.close()

# 例を実行
asyncio.run(with_error_handling())
```

### ウェブスクレイピングの例

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import GraspServer

async def scrape_website():
    """Grasp SDKを使用したウェブスクレイピングの例"""
    
    async with GraspServer({
        'timeout': 3600000,
        'headless': True,  # スクレイピングにはヘッドレスモードを使用
    }) as connection:
        
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                connection['ws_url'],
                timeout=150000
            )
            
            page = await browser.new_page()
            
            # ターゲットウェブサイトにナビゲート
            await page.goto('https://quotes.toscrape.com/')
            
            # コンテンツの読み込みを待つ
            await page.wait_for_selector('.quote')
            
            # 引用を抽出
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
            
            print(f"{len(quotes)}個の引用をスクレイピングしました:")
            for quote in quotes[:3]:  # 最初の3つの引用を印刷
                print(f"- {quote['text']} - {quote['author']}")
            
            await browser.close()

# スクレイピング例を実行
asyncio.run(scrape_website())
```

## リソース管理

**Python SDKの重要な注意事項：**

- **推奨**：上記の例で示されているように非同期コンテキストマネージャーを使用してください。これにより、コード実行終了時にクラウドブラウザと計算リソースが即座に回収され、消費が最小化されます。

- **代替案**：非同期コンテキストマネージャーを使用しない場合、リソースは`browser.close()`後に監視サービスによって破棄されますが、通常数十秒の遅延があり、追加のリソース使用を引き起こす可能性があります。

## ベストプラクティス

1. **非同期コンテキストマネージャーを使用**：自動リソースクリーンアップのため常に`async with GraspServer()`を使用
2. **適切なエラーハンドリング**：try-catchブロックを実装し、finallyブロックでクリーンアップ
3. **リソースクリーンアップ**：常にブラウザ、コンテキスト、ページを適切に閉じる
4. **タイムアウト設定**：使用ケースに基づいて適切なタイムアウトを設定
5. **ヘッドレスモード**：視覚的レンダリングが不要な場合はパフォーマンス向上のためヘッドレスモードを使用
6. **並行操作**：可能な場合は並行操作に`asyncio.gather()`を使用

## 一般的なパターン

### 環境設定

```python
# .envファイル
GRASP_KEY=your_api_key_here

# Pythonスクリプト内で
import os
from dotenv import load_dotenv

load_dotenv()  # .envファイルから環境変数を読み込み

api_key = os.getenv('GRASP_KEY')
if not api_key:
    raise ValueError("GRASP_KEY環境変数が必要です")
```

### ログ記録とデバッグ

```python
import logging
from grasp_sdk import GraspServer

# デバッグログを有効にする
logging.basicConfig(level=logging.DEBUG)

async with GraspServer({
    'debug': True,  # デバッグモードを有効にする
    'timeout': 3600000,
}) as connection:
    # あなたのコード
    pass
```