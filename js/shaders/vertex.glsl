precision mediump float;
precision mediump int;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float offset;
uniform vec3 eyePosition;

attribute vec3 position;
attribute vec2 uv;

varying vec2 texcoord;
varying float fogFactor;

void main() {
    texcoord = uv;
    vec3 p = position.xyz;
    p.z = sin(time + offset) * 0.1;

    vec3 pos = (modelMatrix * vec4(p, 1.0)).xyz;
    fogFactor = length(eyePosition - pos);
    fogFactor = (viewMatrix * modelMatrix * vec4(p, 1.0)).z;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
}
