precision mediump float;
precision mediump int;

uniform sampler2D map;
uniform float fogDistance;
uniform float fogOffset;
uniform float alpha;
uniform vec3 wordColor;
uniform int select;
uniform float aspect;
varying float fogFactor;
varying vec2 texcoord;

float getFogDepth(float depth) {
    float d = depth / -fogDistance - fogOffset;
    float f = d * 5.0;
    float fi = floor(f);
    return clamp(((fi + pow(smoothstep(fi, fi + 1.0, f), 2.0)) / 5.0), 0.0,
                 1.0);
}

void main() {
    vec2 t = texcoord;
    vec4 col = texture2D(map, t);

    col.rgb *= wordColor;
    col.a *= (1.0 - getFogDepth(fogFactor));
    col.a *= alpha;

    const float w = 0.025;
    if (select == 1 &&
        (t.x <= w || t.x >= 1.0 - w || t.y <= w * aspect || t.y >= 1.0 - w * aspect)) {
        col.rgb = vec3(1.00, 0.48, 0.45);
        col.a = 1.0;
    }

    gl_FragColor = col;
}
