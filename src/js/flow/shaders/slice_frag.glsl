uniform sampler2D u_texture;
uniform vec2 u_size;
uniform vec3 u_borderColor;
uniform vec3 u_backgroundColor;
uniform vec3 u_headerColor;
varying vec2 vUv;

vec2 getSliceUV(vec2 uv, vec2 scale) {
    
    float left = 1. - step(0.5, uv.x * scale.x);
    float right = step(0.5, 1. - (1. - uv.x) * scale.x);
    float centerX = 1. - max(left, right);
    uv.x = mix(uv.x * scale.x, 1. - (1. - uv.x) * scale.x, right);
    uv.x = mix(uv.x, 0.5, centerX);

    float top = 1. - step(0.5, uv.y * scale.y);
    float bottom = step(0.5, 1. - (1. - uv.y) * scale.y);
    float centerY = 1. - max(top, bottom);
    uv.y = mix(uv.y * scale.y, 1. - (1. - uv.y) * scale.y, bottom);
    uv.y = mix(uv.y, 0.5, centerY);

    return uv;
}

void main(void) {
    vec2 uv = vUv;
    vec2 scale = u_size / 32. / 1.5;

    uv = getSliceUV(uv, scale);

    vec4 t = texture2D(u_texture, uv);
    if (t.a < 0.5) discard;

    vec4 col = vec4(0., 0., 0., t.a);
    col.rgb = mix(col.rgb, u_backgroundColor, t.b);
    col.rgb = mix(col.rgb, u_headerColor, t.g);
    col.rgb = mix(col.rgb, u_borderColor, t.r);

    gl_FragColor = col;

}