# ⭕✖ ゲーム / Tic Tac Toe

消えるマーク付きの三目並べゲーム。盤上に置けるのは3つまで！

## 機能
- 👫 ローカル対戦（ふたりで遊ぶ）
- 🤖 CPU対戦（5段階レベル）
- 🏆 段位システム（10級〜十段）
- 🔊 効果音
- 🌐 日本語/英語切り替え
- 🐶 アバターアイコン（段位で解放）

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド（公開用）
npm run build
```

## Vercelで公開する手順

1. GitHubにリポジトリを作成してpush
2. https://vercel.com でGitHubアカウントでログイン
3. 「Import Project」→ リポジトリを選択
4. 「Deploy」をクリック
5. 完了！URLが発行される

### 独自ドメインを使う場合
1. お名前.com等でドメインを購入
2. Vercelの Settings → Domains でドメインを追加
3. 指示されたDNS設定を反映

## ネット対戦について
現在ネット対戦は「準備中」表示になっています。
実装するには Firebase Realtime Database 等のバックエンドが必要です。
