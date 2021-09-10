varying vec2 vUv;
uniform sampler2D u_texture;
uniform float u_scale;

void main() {
    vec4 t = texture2D(u_texture, fract(vUv * u_scale));
    gl_FragColor = t;
}