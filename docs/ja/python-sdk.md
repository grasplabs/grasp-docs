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

この例では、grasp_sdkを使用してブラウザセッションを起動し、
CDPで接続し、基本的な操作を実行し、各種サービスを使用する方法を示します。
"""

import asyncio
import os
from playwright.async_api import async_playwright
from dotenv import load_dotenv
from grasp_sdk import Grasp

async def main():
    """メイン関数：基本的なGrasp SDKの使用方法を示します"""
    
    # APIキーをチェック
    api_key = os.getenv('GRASP_KEY')
    if not api_key:
        print("⚠️ 警告：GRASP_KEY環境変数が設定されていません")
        print("GRASP_KEY環境変数を設定するか、.envファイルで設定してください")
        print("例：export GRASP_KEY=your_api_key_here")
        return

    print("🚀 ブラウザセッションを起動中...")

    # Graspインスタンスを作成
    grasp = Grasp(api_key=api_key)
    
    # 新しいセッションを起動
    session = await grasp.launch({
        'browser': {
            'type': 'chrome-stable',
            'headless': False,
            'adblock': True
        },
        'timeout': 3600000,  # セッションは最大1時間実行
        'debug': True
    })
    
    try:
        print(f"セッションID: {session.id}")
        
        # Playwrightでブラウザに接続
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            # ページを作成してウェブサイトを訪問
            page = await browser.new_page()
            await page.goto('https://getgrasp.ai/', wait_until='domcontentloaded')
            
            # スクリーンショットをリモートディレクトリに保存
            await page.screenshot(path='/home/user/downloads/grasp-ai.png')
            
            # スクリーンショットをローカルにダウンロード
            await session.files.download_file(
                '/home/user/downloads/grasp-ai.png',
                './grasp-ai.png'
            )
            
            await page.close()
            await browser.close()
        
        # ファイルサービスを使用
        await session.files.write_file('/home/user/test.txt', 'Hello Grasp!')
        content = await session.files.read_file('/home/user/test.txt')
        print(f"ファイル内容: {content}")
        
        # ターミナルサービスを使用
        command = await session.terminal.run_command('ls -la /home/user')
        await command.end()
        
        print('✅ タスク完了。')
        
    except Exception as e:
        print(f"❌ 実行中にエラーが発生しました: {str(e)}")
        raise
    
    finally:
        # セッションを閉じてリソースをクリーンアップ
        await session.close()
        print("セッションが閉じられ、リソースがクリーンアップされました")

if __name__ == '__main__':
    # メイン関数を実行
    asyncio.run(main())
```

## APIリファレンス

### Grasp

`Grasp`は、Graspサービスとの接続を管理するメインクラスです。

#### コンストラクタ

```python
Grasp(api_key: str = None)
```

**パラメータ：**
- `api_key` (str, オプション): APIキー（環境変数`GRASP_KEY`が設定されている場合は省略可能）

#### メソッド

##### `launch(options: dict = None) -> GraspSession`

新しいGraspセッションを起動します。

**パラメータ：**
- `options` (dict, オプション): セッション設定オプション
  - `browser` (dict, オプション): ブラウザ設定
    - `type` (str): ブラウザタイプ（デフォルト: 'chrome-stable'）
    - `headless` (bool): ヘッドレスモード（デフォルト: True）
    - `adblock` (bool): 広告ブロック（デフォルト: False）
  - `timeout` (int): タイムアウト（ミリ秒、デフォルト: 300000）
  - `debug` (bool): デバッグモード（デフォルト: False）

**戻り値：**
- `GraspSession`: 新しいセッションインスタンス

##### `connect(session_id: str) -> GraspSession`

既存のセッションに接続します。

**パラメータ：**
- `session_id` (str): 接続するセッションのID

**戻り値：**
- `GraspSession`: セッションインスタンス

### GraspSession

`GraspSession`は、アクティブなGraspセッションを表します。

#### プロパティ

- `id` (str): セッションID
- `browser` (GraspBrowser): ブラウザサービス
- `files` (FileSystemService): ファイルシステムサービス
- `terminal` (TerminalService): ターミナルサービス

#### メソッド

##### `close() -> None`

セッションを閉じ、すべてのリソースをクリーンアップします。

### GraspBrowser

`GraspBrowser`は、ブラウザ関連の操作を提供します。

#### メソッド

##### `get_endpoint() -> str`

Playwrightが接続するためのCDP WebSocket URLを取得します。

**戻り値：**
- `str`: CDP WebSocket URL

### TerminalService

`TerminalService`は、リモートターミナルでのコマンド実行を提供します。

#### メソッド

##### `run_command(command: str, options: dict = None) -> TerminalCommand`

リモートターミナルでコマンドを実行します。

**パラメータ：**
- `command` (str): 実行するコマンド
- `options` (dict, オプション): コマンド実行オプション
  - `cwd` (str, オプション): 作業ディレクトリ
  - `envs` (dict, オプション): 環境変数
  - `timeout_ms` (int, オプション): コマンドタイムアウト（ミリ秒）
  - `user` (str, オプション): コマンドを実行するユーザー
  - `inBackground` (bool, オプション): バックグラウンドでコマンドを実行（自動処理）
  - `nohup` (bool, オプション): バックグラウンド実行にnohupを使用（Grasp固有）

**戻り値：**
- `TerminalCommand`: コマンド実行インスタンス

### FileSystemService

`FileSystemService`は、リモートファイルシステムとの相互作用を提供します。

#### メソッド

##### `upload_file(local_path: str, remote_path: str) -> None`

ローカルファイルをリモートシステムにアップロードします。

**パラメータ：**
- `local_path` (str): ローカルファイルパス
- `remote_path` (str): リモートファイルパス

##### `download_file(remote_path: str, local_path: str) -> None`

リモートファイルをローカルシステムにダウンロードします。

**パラメータ：**
- `remote_path` (str): リモートファイルパス
- `local_path` (str): ローカルファイルパス

##### `write_file(path: str, content: str) -> None`

リモートファイルにコンテンツを書き込みます。

**パラメータ：**
- `path` (str): ファイルパス
- `content` (str): 書き込むコンテンツ

##### `read_file(path: str) -> str`

リモートファイルのコンテンツを読み取ります。

**パラメータ：**
- `path` (str): ファイルパス

**戻り値：**
- `str`: ファイルコンテンツ

## Playwrightとの使用

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def main():
    # Graspインスタンスを作成
    grasp = Grasp()
    
    # 新しいセッションを起動
    session = await grasp.launch({
        'browser': {
            'type': 'chrome-stable',
            'headless': False
        },
        'debug': True
    })
    
    try:
        async with async_playwright() as p:
            # CDPを使用してブラウザに接続
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            # 新しいページを作成
            page = await browser.new_page()
            
            # ウェブサイトに移動
            await page.goto('https://example.com')
            
            # 要素を操作
            await page.fill('input[name="search"]', 'Grasp SDK')
            await page.click('button[type="submit"]')
            
            # 結果を待機
            await page.wait_for_selector('.results')
            
            # スクリーンショットをリモートディレクトリに保存
            await page.screenshot(path='/home/user/downloads/search_results.png')
            
            # スクリーンショットをローカルにダウンロード
            await session.files.download_file(
                '/home/user/downloads/search_results.png',
                './search_results.png'
            )
            
            # ブラウザを閉じる
            await browser.close()
    
    finally:
        # セッションを閉じる
        await session.close()

if __name__ == '__main__':
    asyncio.run(main())
```

## 高度な例

### 複数ページとコンテキスト

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def multiple_pages():
    """複数ページとコンテキストの例"""
    
    grasp = Grasp()
    session = await grasp.launch({'timeout': 3600000})
    
    try:
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
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
            
            # スクリーンショットをリモートディレクトリに保存
            await asyncio.gather(
                page1.screenshot(path='/home/user/downloads/example.png'),
                page2.screenshot(path='/home/user/downloads/httpbin.png')
            )
            
            # スクリーンショットをローカルにダウンロード
            await asyncio.gather(
                session.files.download_file('/home/user/downloads/example.png', './example.png'),
                session.files.download_file('/home/user/downloads/httpbin.png', './httpbin.png')
            )
            
            # クリーンアップ
            await context1.close()
            await context2.close()
            await browser.close()
    
    finally:
        await session.close()

# 例を実行
asyncio.run(multiple_pages())
```

### エラーハンドリング

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def with_error_handling():
    """適切なエラーハンドリングの例"""
    
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
            
            # あなたの自動化コード
            
    except Exception as error:
        print(f"ブラウザ自動化中のエラー: {error}")
        raise
    finally:
        # 常にリソースをクリーンアップ
        if browser:
            await browser.close()
        if session:
            await session.close()

# 例を実行
asyncio.run(with_error_handling())
```

### ウェブスクレイピングの例

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def scrape_website():
    """Grasp SDKを使用したウェブスクレイピングの例"""
    
    grasp = Grasp()
    session = await grasp.launch({
        'browser': {
            'headless': True  # スクレイピングにはヘッドレスモードを使用
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
            
            # 結果をファイルに保存
            import json
            await session.files.write_file(
                '/home/user/quotes.json',
                json.dumps(quotes, ensure_ascii=False, indent=2)
            )
            
            await browser.close()
    
    finally:
        await session.close()

# スクレイピング例を実行
asyncio.run(scrape_website())
```

## リソース管理

**Python SDKの重要な注意事項：**

- **推奨**：上記の例で示されているように`session.close()`を適切に呼び出してください。これにより、コード実行終了時にクラウドブラウザと計算リソースが即座に回収され、消費が最小化されます。

- **代替案**：`session.close()`を明示的に呼び出さない場合、リソースは`browser.close()`後に監視サービスによって破棄されますが、通常数十秒の遅延があり、追加のリソース使用を引き起こす可能性があります。

## ベストプラクティス

### セッション管理

1. **適切なセッション管理**：自動リソースクリーンアップのため常に`session.close()`を使用
2. **セッション再利用**：複数の操作に同じセッションを使用してリソースを節約
3. **タイムアウト設定**：使用ケースに基づいて適切なタイムアウトを設定

### ブラウザ操作

4. **適切なエラーハンドリング**：try-catchブロックを実装し、finallyブロックでクリーンアップ
5. **リソースクリーンアップ**：常にブラウザ、コンテキスト、ページ、セッションを適切に閉じる
6. **ヘッドレスモード**：視覚的レンダリングが不要な場合はパフォーマンス向上のためヘッドレスモードを使用
7. **並行操作**：可能な場合は並行操作に`asyncio.gather()`を使用

### ファイル管理

8. **リモートパス使用**：スクリーンショットやダウンロードには`/home/user/downloads/`を使用
9. **ファイル転送**：リモートファイルシステムとローカルファイルシステム間の適切なファイル転送
10. **ファイルクリーンアップ**：不要なリモートファイルを定期的にクリーンアップ

### ターミナル操作

11. **コマンド終了**：長時間実行されるコマンドには適切な終了処理を実装
12. **作業ディレクトリ**：コマンド実行時に適切な作業ディレクトリを指定

### サービス統合

13. **サービス組み合わせ**：ブラウザ、ファイル、ターミナルサービスを効果的に組み合わせ
14. **エラー処理**：各サービスで適切なエラーハンドリングを実装

### 完全な例

```python
import asyncio
from playwright.async_api import async_playwright
from grasp_sdk import Grasp

async def best_practices_example():
    """すべてのベストプラクティスを示す完全な例"""
    
    grasp = Grasp()
    session = None
    browser = None
    
    try:
        # セッションを起動
        session = await grasp.launch({
            'browser': {
                'type': 'chrome-stable',
                'headless': True,  # パフォーマンス向上のため
                'adblock': True
            },
            'timeout': 3600000,
            'debug': True
        })
        
        print(f"セッション開始: {session.id}")
        
        # ブラウザ操作
        async with async_playwright() as p:
            browser = await p.chromium.connect_over_cdp(
                session.browser.get_endpoint(),
                timeout=150000
            )
            
            page = await browser.new_page()
            await page.goto('https://example.com')
            
            # スクリーンショットをリモートに保存
            await page.screenshot(path='/home/user/downloads/example.png')
            
            await browser.close()
            browser = None
        
        # ファイル操作
        await session.files.write_file(
            '/home/user/report.txt',
            'タスク完了レポート\n'
        )
        
        # ターミナル操作
        command = await session.terminal.run_command(
            'ls -la /home/user/downloads/',
            cwd='/home/user'
        )
        await command.end()
        
        # ファイルをローカルにダウンロード
        await asyncio.gather(
            session.files.download_file(
                '/home/user/downloads/example.png',
                './example.png'
            ),
            session.files.download_file(
                '/home/user/report.txt',
                './report.txt'
            )
        )
        
        print("すべてのタスクが正常に完了しました")
        
    except Exception as e:
        print(f"エラーが発生しました: {e}")
        raise
    
    finally:
        # リソースクリーンアップ
        if browser:
            await browser.close()
        if session:
            await session.close()
            print("セッションが閉じられました")

if __name__ == '__main__':
    asyncio.run(best_practices_example())
```

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
from grasp_sdk import Grasp

# デバッグログを有効にする
logging.basicConfig(level=logging.DEBUG)

grasp = Grasp()
session = await grasp.launch({
    'debug': True,  # デバッグモードを有効にする
    'timeout': 3600000,
})

try:
    # あなたのコード
    pass
finally:
    await session.close()
```