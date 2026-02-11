---
name: p5-sketch-creator
description: p5.jsプロジェクトの規約に沿った新しいスケッチファイルを作成します。
---

# Instructions

あなたは p5.js ジェネラティブアートのスケッチ開発エキスパートです。ユーザーが新しいスケッチの作成を求めた場合、以下の手順に従ってスケッチを生成してください。

## 1. 要件確認

ユーザーに以下を確認してください（ユーザーが既に指定済みの場合はスキップ）：

1. **スケッチ名**: ケバブケースの英語名（例: `sketch-aurora`）。`sketch-` プレフィックスを必ず付ける。
2. **表現のテーマ / コンセプト**: どのようなビジュアルを生成するか（例: 「オーロラを再現」「パーティクルの群れ」等）
3. **レンダラー**: `P2D`（2D描画）または `WEBGL`（3D / シェーダー使用）
4. **マイク入力**: 音声リアクティブにするか（`useMic: true / false`）
5. **追加ライブラリ**: 既存の依存（p5.js, p5.sound, Tone.js, matter-js, spectral.js）以外に何か必要か

## 2. プロジェクトアーキテクチャ

### ディレクトリ構成

```
src/
├── class/
│   ├── Sketch.ts          # 基底クラス（編集不要）
│   └── AudioAnalyzer.ts   # 音声解析（編集不要）
├── sketch/
│   └── sketch-<name>.ts   # ← ここに新しいスケッチを作成
├── template/
│   └── sketch-template.ts # テンプレート（参照用）
├── util/
│   └── constant.ts        # 定数（TIME_MAX, ALPHA_MAX）
├── index.ts               # スケッチ登録リスト
└── index.html
```

### Sketch 基底クラスの仕様

```typescript
// コンストラクタオプション
super({
  renderer: 'P2D' | 'WEBGL',  // レンダリングモード
  use2D: true | false,         // WEBGL使用時に2D座標変換するか
  useMic: true | false,        // マイク入力を使うか
})
```

**基底クラスが提供するメンバ:**
- `this.p`: p5 インスタンス（すべての p5 API はここから呼ぶ）
- `this.canvas`: p5.Renderer
- `this.graphic`: p5.Graphics（フェード用オフスクリーンバッファ）
- `this.fadeFlag`: boolean（フェードアウト中か）
- `this.audioAnalyzer`: AudioAnalyzer（`useMic: true` 時のみ利用可能）

**音声解析 API（`useMic: true` 時）:**
- `this.getVolume()`: number — マイク音量（0〜1）
- `this.getVolumeEachBand()`: number[] — 周波数帯別音量 `[treble, highMid, mid, lowMid, bass]`
- `this.getHue()`: number — 周波数中心から算出した色相 (0-360)

**ライフサイクルメソッド（オーバーライド可能）:**
- `preload()` — アセット読み込み
- `setup()` — 初期化処理（**必ず `super.setup()` を先頭で呼ぶ**）
- `draw()` — 毎フレーム描画（**必ず `super.draw()` を先頭で呼ぶ**）
- `mousePressed()` — マウスクリック
- `keyTyped()` — キー入力
- `keyPressed()` — キー押下
- `doubleClicked()` — ダブルクリック

### パスエイリアス

Vite の `@` エイリアスにより `@/class/Sketch` のように import できます。

## 3. スケッチファイル生成

### 基本テンプレート（2D スケッチ）

```typescript
'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class Sketch<PascalCaseName> extends Sketch {
  // プロパティ宣言
  // 例: particles: Array<{x: number, y: number}> = []

  constructor() {
    super({
      renderer: 'P2D',
      use2D: true,
      useMic: false,
    })
    // プロパティの初期化
  }

  setup(): void {
    super.setup()
    // セットアップ処理
  }

  draw(): void {
    super.draw()
    if (!this.p) return
    // 描画ロジック
  }
}

export default function (): void {
  const sketch = new Sketch<PascalCaseName>()
  sketch.init()
}
```

### 音声リアクティブスケッチのパターン

```typescript
draw(): void {
  super.draw()
  if (!this.p) return

  // 各周波数帯の音量を取得
  const bands = this.getVolumeEachBand()
  // bands = [treble, highMid, mid, lowMid, bass]

  // 全体音量
  const volume = this.getVolume()

  // 音量をビジュアルにマッピング
  const bass = this.p.map(bands[4], 0, 255, 0, 1.0)
  // ...
}
```

### WebGL / シェーダースケッチのパターン

WebGL + カスタムシェーダーを使う場合は、以下のパターンを参照してください：

1. コンストラクタで `renderer: 'WEBGL'`, `use2D: false` を設定
2. `setup()` で `(this.p as any).drawingContext` から `WebGLRenderingContext` を取得
3. 頂点/フラグメントシェーダーをインラインで文字列として定義
4. WebGL API で直接コンパイル・リンクして uniform を設定
5. `draw()` で毎フレーム描画

> 参考実装: `src/sketch/sketch-lightning.ts`, `src/sketch/sketch-nebula.ts`

### GLSL シェーダーのノイズ関数

シェーダーで頻繁に使用するノイズ関数:

```glsl
// ランダム関数
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D バリューノイズ
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// fBm (フラクショナル・ブラウニアン・モーション)
#define OCTAVES 6
float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * noise(st);
    st *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}
```

## 4. index.ts への登録

新しいスケッチを作成したら、`src/index.ts` の `files` 配列にスケッチ名を追加します。

```typescript
const files: readonly string[] = Object.freeze([
  // 既存のスケッチ...
  'sketch-<new-name>',  // ← 追加（有効化する場合はコメントアウトしない）
])
```

> **注意**: 一度にアクティブにするスケッチは通常1つです。他のスケッチはコメントアウトして、新しいスケッチだけを有効にしてください。

## 5. 動作確認

スケッチ作成後、`npm run dev` で開発サーバーを起動し、ブラウザで確認します。

```bash
cd /Users/teraokakazutaka/works/p5-project
npm run dev
```

ブラウザで `http://localhost:8000` を開き、スケッチが正常に動作することを確認してください。

## 6. コーディング規約

- **`'use strict'`**: ファイル先頭に必ず記述
- **命名規則**:
  - ファイル名: `sketch-<ケバブケース>.ts`（例: `sketch-aurora-borealis.ts`）
  - クラス名: `PascalCase`（例: `AuroraBorealisSketch`）
- **`super` 呼び出し**: `setup()` と `draw()` ではメソッド先頭で必ず `super.setup()` / `super.draw()` を呼ぶ
- **null チェック**: `draw()` メソッドでは `if (!this.p) return` を `super.draw()` 直後に入れる
- **export**: ファイル末尾に `export default function` でインスタンス生成と `init()` 呼び出しをまとめる
- **フォーマッタ**: Prettier + ESLint が設定済み（タブインデント、セミコロンなし）

# Examples

## 例1: シンプルな2Dスケッチ作成

**ユーザー**: 「キラキラ光る星空を作りたい」

→ 生成ファイル: `src/sketch/sketch-starfield.ts`
→ renderer: `P2D`, useMic: `false`
→ パーティクルシステムでランダムに配置した星を明滅させる

## 例2: 音声リアクティブスケッチ作成

**ユーザー**: 「マイクの音量に反応する波のアニメーション」

→ 生成ファイル: `src/sketch/sketch-audio-wave.ts`
→ renderer: `P2D`, useMic: `true`
→ `getVolumeEachBand()` で周波数帯別の音量を取得し、波の高さに反映

## 例3: WebGL シェーダースケッチ作成

**ユーザー**: 「音に反応するネビュラ（星雲）」

→ 生成ファイル: `src/sketch/sketch-nebula.ts`
→ renderer: `WEBGL`, use2D: `false`, useMic: `true`
→ フラグメントシェーダーでfBm/ノイズを使い、音声データを uniform で渡す
