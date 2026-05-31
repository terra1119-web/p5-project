'use strict'
import Sketch from '@/class/Sketch'
import p5 from 'p5'

class AcousticEchoesSketch extends Sketch {
  private fbo1!: p5.Graphics
  private fbo2!: p5.Graphics
  private toggleFbo: boolean = true
  private time: number = 0
  private particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: p5.Color }> = []
  private nodes: Array<{ x: number; y: number; phaseOffset: number }> = []

  constructor() {
    super({
      renderer: 'WEBGL',
      use2D: false,
      useMic: true,
    })
  }

  setup(): void {
    super.setup()
    if (!this.p) return

    this.p.colorMode(this.p.HSB, 360, 100, 100, 1)

    // Ping-pong 用の FBO を 2 つ作成
    this.fbo1 = this.p.createGraphics(this.p.width, this.p.height, this.p.WEBGL)
    this.fbo1.colorMode(this.p.HSB, 360, 100, 100, 1)
    this.fbo1.clear(0, 0, 0, 0) // 第4引数アルファ0の場合はclear()でOKなはずだがWEBGLなのでclear()を利用

    this.fbo2 = this.p.createGraphics(this.p.width, this.p.height, this.p.WEBGL)
    this.fbo2.colorMode(this.p.HSB, 360, 100, 100, 1)
    this.fbo2.clear(0, 0, 0, 0)

    this.p.background(0)

    // 複数の発生源（ノード）をランダムな位置に定義
    const numNodes = 5
    for (let i = 0; i < numNodes; i++) {
      this.nodes.push({
        x: this.p.random(-this.p.width / 3, this.p.width / 3),
        y: this.p.random(-this.p.height / 3, this.p.height / 3),
        phaseOffset: this.p.random(this.p.TWO_PI)
      })
    }
  }

  draw(): void {
    super.draw()
    if (!this.p || !this.fbo1 || !this.fbo2) return

    this.time += 0.01

    // 1. 音声データの取得
    const bands = this.getVolumeEachBand()
    const treble = bands[0]
    const highMid = bands[1]
    const mid = bands[2]
    const lowMid = bands[3]
    const bass = bands[4]
    const vol = this.getVolume()
    const hue = this.getHue()

    // 2. ピンポン FBO の対象を決定
    const srcFbo = this.toggleFbo ? this.fbo1 : this.fbo2
    const dstFbo = this.toggleFbo ? this.fbo2 : this.fbo1

    // 3. フィードバックループ（過去のフレームを変形して描画）
    dstFbo.push()
    dstFbo.clear(0, 0, 0, 0) // WEBGLのクリア

    dstFbo.imageMode(this.p.CENTER)

    // 低音が強いとスケールが 1.0 よりも大きくなり、画面外へ拡散する
    // 低音が弱い場合はスケールが 0.99 程度になり、画面中央へ収束する
    const bassScale = this.p.map(bass, 0, 255, 0.98, 1.15)
    
    // 高音が強いと回転量が増え、カオスな動きになる
    const trebleRot = this.p.map(treble, 0, 255, -0.01, 0.1)

    dstFbo.scale(bassScale)
    dstFbo.rotateZ(trebleRot * Math.sin(this.time))

    // 前のフレームを少し暗く（アルファを下げて）描画して残像効果を作る
    dstFbo.tint(360, 0, 100, 0.93)
    dstFbo.image(srcFbo, 0, 0)
    dstFbo.pop()

    // 4. 現在のフレームの新しい要素を描画
    dstFbo.push()
    
    // パーティクルの更新（全体で1回）と描画
    this.updateParticles()
    this.drawParticles(dstFbo)

    // 複数のノード（発生源）ごとに波形を描画し、新しいパーティクルを生成
    for (const node of this.nodes) {
      dstFbo.push()
      dstFbo.translate(node.x, node.y)
      
      // 中央のオーガニックな波形（音量と低音パラメータも渡す）
      this.drawOrganicShape(dstFbo, mid, hue, node.phaseOffset, vol, bass)
      
      // パーティクルの新規発生（ノードの位置から）
      this.emitParticles(hue, vol, node.x, node.y)
      
      dstFbo.pop()
    }

    dstFbo.pop()

    // 5. メインキャンバスに結果を描画
    this.p.background(0) // 背景は黒
    this.p.imageMode(this.p.CENTER)
    
    // WEBGLで加算合成っぽい見せ方をするためブレンドモードを設定
    this.p.blendMode(this.p.BLEND)
    this.p.image(dstFbo, 0, 0)

    // FBOを切り替える
    this.toggleFbo = !this.toggleFbo
  }

  private drawOrganicShape(fbo: p5.Graphics, mid: number, baseHue: number, phaseOffset: number, vol: number, bass: number): void {
    if (!this.p) return

    fbo.push()
    
    // 1. 音が鳴った瞬間にフラッシュする明るいコア（中心の発光）を描画
    fbo.noStroke()
    const currentHue = (baseHue + this.time * 20 + phaseOffset * 20) % 360
    const coreAlpha = this.p.map(vol, 0, 0.4, 0, 1) // ある程度大きな音が出た時だけ明るくなる
    fbo.fill(currentHue, 20, 100, coreAlpha)
    // 低音と全体音量でコアのサイズがドクンと脈打つ
    const coreRadius = this.p.map(bass, 0, 255, 20, 200) * (1.0 + vol * 1.5)
    fbo.circle(0, 0, coreRadius)

    // 2. オーガニック波形の描画
    fbo.noFill()
    
    // 波形の大きさと太さを中音域に連動
    let radius = this.p.map(mid, 0, 255, 100, 600)
    // 全体音量に比例して全体が大きくポンピングする（スピーカーのように）
    radius *= (1.0 + vol * 1.5)
    
    const weight = this.p.map(mid, 0, 255, 2, 10) * (1.0 + vol)
    fbo.strokeWeight(weight)
    
    fbo.stroke(currentHue, 80, 100, 0.8)

    const numPoints = 100
    fbo.beginShape()
    for (let i = 0; i < numPoints; i++) {
      const angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI)
      // Perlinノイズで波形を有機的に歪ませる（ノードごとに異なる動き）
      const nOffset = this.time * 4 + phaseOffset
      const n = this.p.noise(Math.cos(angle) * 1.5 + nOffset, Math.sin(angle) * 1.5 + nOffset)
      // 音量が大きいとノイズの歪み（トゲトゲしさ）も激しくなる
      const distortion = this.p.map(vol, 0, 0.3, 100, 500)
      const r = (radius * 0.5) + this.p.map(n, 0, 1, -distortion, distortion)
      
      const x = r * Math.cos(angle)
      const y = r * Math.sin(angle)
      fbo.vertex(x, y)
    }
    fbo.endShape(this.p.CLOSE)
    fbo.pop()
  }

  private emitParticles(hue: number, vol: number, px: number, py: number): void {
    if (!this.p) return

    // 音量が一定以上の時にパーティクルを発生
    if (vol > 0.05) {
      // 複数ノードから発生するため1ノードあたりの量は少し減らす
      const numToEmit = Math.floor(this.p.map(vol, 0.05, 1.0, 1, 15))
      for (let i = 0; i < numToEmit; i++) {
        const angle = this.p.random(this.p.TWO_PI)
        // 音量が大きいほどパーティクルの初速が速くなり、爆発感が出る
        const speed = this.p.random(2, 10) * (1.0 + vol * 3.0)

        this.particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          color: this.p.color((hue + this.p.random(-30, 30)) % 360, 80, 100, 1)
        })
      }
    }
  }

  private updateParticles(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.02
      
      p.vx *= 0.95
      p.vy *= 0.95

      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  private drawParticles(fbo: p5.Graphics): void {
    fbo.push()
    fbo.noStroke()
    for (const p of this.particles) {
      if (p.life > 0) {
        p.color.setAlpha(p.life)
        fbo.fill(p.color)
        fbo.circle(p.x, p.y, p.life * 10)
      }
    }
    fbo.pop()
  }
}

export default function (): void {
  const sketch = new AcousticEchoesSketch()
  sketch.init()
}
