precision mediump float;

// 変数の定義
varying vec2 vTexCoord;
uniform sampler2D texture;
uniform float segments;

void main() {
    vec2 uv = vTexCoord;

    // テクスチャ座標を -1 から 1 の範囲に変換
    vec2 pos = uv * 2.0 - 1.0;

    // 極座標への変換
    float r = length(pos);
    float theta = atan(pos.y, pos.x);

    // 万華鏡のセグメント数に基づいて角度を分割
    float angle = theta;
    float segmentAngle = 3.14159 * 2.0 / segments;
    angle = mod(angle, segmentAngle);
    if (mod(floor(theta / segmentAngle), 2.0) == 1.0) {
        angle = segmentAngle - angle;
    }

    // デカルト座標に戻す
    vec2 newPos = vec2(cos(angle), sin(angle)) * r;

    // テクスチャ座標に戻す
    newPos = (newPos + 1.0) * 0.5;

    // 色の取得と出力
    vec4 color = texture2D(texture, newPos);
    gl_FragColor = color;
}
