import { AnimationLoop, Model } from '@luma.gl/engine';
import { Buffer, clear, Texture2D } from '@luma.gl/webgl';

const loop = new AnimationLoop({
    //@ts-ignore
    onInitialize({ gl }) {
        const texture = new Texture2D(gl, {
            data: 'fujirgb.png',
        });

        const model = new Model(gl, {
            vs: `
                attribute vec2 position;
                varying vec2 uv;
                uniform sampler2D texture;

                vec2 getuv(vec2 xy) {
                    return vec2((xy.x + 1.0) * 0.5,  1.0 - 0.5 * (xy.y + 1.0));
                }

                void main() {
                    uv = getuv(position);
                    gl_Position = vec4(position.xy, 0.0, 1.0);
                }
            `,
            fs: `
                uniform sampler2D texture;
                varying vec2 uv;

                float rgb2height(vec3 rgb) {
                    return -10000.0 + (rgb.r * 6553.6 + rgb.g * 25.6 + rgb.b * 0.1) * 255.0;
                }

                float slope() {
                    float canvas_px_x = 1.0 / 1024.0;
                    float canvas_px_y = 1.0 / 1024.0;
                    
                    //123
                    //456
                    //789
                    //vec4 p1 = texture2D(texture, uv + vec2(-canvas_px_x, -canvas_px_y));
                    vec4 p2 = texture2D(texture, uv + vec2(0, -canvas_px_y));
                    //vec4 p3 = texture2D(texture, uv + vec2(canvas_px_x, -canvas_px_y));
                    vec4 p4 = texture2D(texture, uv + vec2(-canvas_px_x, 0));
                    //vec4 p5 = texture2D(texture, uv + vec2(0, 0));
                    vec4 p6 = texture2D(texture, uv + vec2(canvas_px_x, 0));
                    //vec4 p7 = texture2D(texture, uv + vec2(-canvas_px_x, canvas_px_y));
                    vec4 p8 = texture2D(texture, uv + vec2(0, canvas_px_y));
                    //vec4 p9 = texture2D(texture, uv + vec2(canvas_px_x, canvas_px_y));
                    
                    float h2 = rgb2height(p2.rgb);
                    float h4 = rgb2height(p4.rgb);
                    float h6 = rgb2height(p6.rgb);
                    float h8 = rgb2height(p8.rgb);
                    
                    float distPerPixel = 38.0;
                    return ((abs(h6-h4) + abs(h8-h2)) * 0.5) / distPerPixel;
                }

                float shade() {
                    float canvas_px = 1.0 / 1024.0;
                    
                    //123456789
                    vec4 p1 = texture2D(texture, uv);
                    vec4 p2 = texture2D(texture, uv + vec2(canvas_px * 1.0));
                    vec4 p3 = texture2D(texture, uv + vec2(canvas_px * 2.0));
                    vec4 p4 = texture2D(texture, uv + vec2(canvas_px * 3.0));
                    vec4 p5 = texture2D(texture, uv + vec2(canvas_px * 4.0));
                    vec4 p6 = texture2D(texture, uv + vec2(canvas_px * 5.0));
                    vec4 p7 = texture2D(texture, uv + vec2(canvas_px * 6.0));
                    vec4 p8 = texture2D(texture, uv + vec2(canvas_px * 7.0));
                    vec4 p9 = texture2D(texture, uv + vec2(canvas_px * 8.0));
                    
                    float h1 = rgb2height(p1.rgb);
                    float h2 = rgb2height(p2.rgb);
                    float h3 = rgb2height(p3.rgb);
                    float h4 = rgb2height(p4.rgb);
                    float h5 = rgb2height(p5.rgb);
                    float h6 = rgb2height(p6.rgb);
                    float h7 = rgb2height(p7.rgb);
                    float h8 = rgb2height(p8.rgb);
                    float h9 = rgb2height(p9.rgb);
                    
                    float intensity = 0.0;
                    if (h1 > h2) {
                        intensity += 0.125;
                    };

                    if (h1 > h3) {
                        intensity += 0.125;
                    };

                    if (h1 > h4) {
                        intensity += 0.125;
                    };

                    if (h1 > h5) {
                        intensity += 0.125;
                    };

                    if (h1 > h6) {
                        intensity += 0.125;
                    };

                    if (h1 > h7) {
                        intensity += 0.125;
                    };

                    if (h1 > h8) {
                        intensity += 0.125;
                    };

                    if (h1 > h9) {
                        intensity += 0.125;
                    };
                    
                    return intensity;
                }

                void main() {
                    vec4 texValue = texture2D(texture, uv);
                    float height = rgb2height(texValue.rgb);
                    float slope = slope();
                    float shade = shade();
                    gl_FragColor = vec4(vec3(0.4 * height / 4000.0 + slope * 0.3 + shade * 0.3), 1.0);
                }
            `,
            uniforms: {
                texture,
            },
            attributes: {
                position: new Buffer(
                    gl,
                    new Float32Array([
                        -1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1, -1,
                    ]),
                ),
            },
            vertexCount: 6,
        });

        return { model, texture };
    },

    //@ts-ignore
    onRender({ gl, model }) {
        clear(gl, { color: [0, 0, 0, 1] });
        model.draw();
    },
});

loop.start({ canvas: 'canvas' });
