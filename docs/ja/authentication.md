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
const connection = await grasp.launchBrowser({
  key: 'your_api_key_here',
  // その他のオプション...
});
```

@tab Python

```python
async with GraspServer({
    'key': 'your_api_key_here',
    # その他のオプション...
}) as connection:
    # あなたのコード
```

:::

## 設定パラメータ

SDKインスタンスを作成する際、以下の設定パラメータを設定できます：

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `key` | string | はい* | `$GRASP_KEY` | APIキー（`GRASP_KEY`環境変数が設定されている場合はオプション） |
| `type` | enum | いいえ | `chromium` | リモートブラウザタイプ：`chromium` または `chrome-stable` |
| `headless` | boolean | いいえ | `true` | ヘッドレスモード（ヘッドレスはリソースを節約しますが、ボットとして検出されやすい場合があります） |
| `timeout` | integer | いいえ | 900000 (15分) | Graspサービスのタイムアウト（ミリ秒）（最大：86400000 - 24時間） |
| `adblock` | boolean | いいえ | `false` | 広告ブロックを有効にする（実験的機能） |
| `debug` | boolean | いいえ | `false` | より詳細なターミナル出力のためのデバッグモードを有効にする |

## ベストプラクティス

1. **環境変数を使用**：APIキーをハードコーディングする代わりに環境変数を使用してセキュリティを保つ
2. **タイムアウト設定**：使用ケースに基づいて適切なタイムアウトを設定（最大24時間）
3. **リソース管理**：リソースリークを避けるため、常にブラウザとページを適切に閉じる