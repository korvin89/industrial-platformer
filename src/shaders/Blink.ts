export default class Flash extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game: Phaser.Game) {
        super({
            game: game,
            renderer: game.renderer,
            fragShader: `
            precision mediump float;

            uniform float time;
            uniform sampler2D uMainSampler;
            varying vec2 outTexCoord;

            void main(void) {
                vec4 color = texture2D(uMainSampler, outTexCoord);
                if (color.a != 0.0) {
                    gl_FragColor = mix(color, vec4(1.0), cos(time / 50.0));
                }
            }`,
        });
    }
}
