import Phaser from 'phaser';
import Blink from '../shaders/Blink';


const ROOT = '../assets';
const PATH = {
    SPRITESHEET: `${ROOT}/spritesheets`,
    IMAGES: `${ROOT}/images`,
    TILESETS: `${ROOT}/tilesets`,
    TILEMAPS: `${ROOT}/tilemaps`,
    SOUNDS: `${ROOT}/sounds`,
};
const FRAME_CONFIG = {frameWidth: 32, frameHeight: 32};

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();

        progressBox.fillStyle(0x2f3649, 0.8);
        progressBox.fillRect(width / 2 - 160 - 10, height / 2 - 30, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff',
            },
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff',
            },
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 160, height / 2 - 20, 300 * value, 30);
            percentText.setText(parseInt(String(value * 100), 10) + '%');
        });

        this.load.spritesheet(
            'player',
            `${PATH.SPRITESHEET}/player.png`,
            {...FRAME_CONFIG, margin: 1, spacing: 2},
        );
        this.load.spritesheet(
            'player_flash',
            `${PATH.SPRITESHEET}/player_flash.png`,
            {frameWidth: 48, frameHeight: 32},
        );
        this.load.spritesheet(
            'gun_bullet',
            `${PATH.SPRITESHEET}/gun_bullet.png`,
            {frameWidth: 10, frameHeight: 10},
        );
        this.load.spritesheet('sphere', `${PATH.SPRITESHEET}/sphere.png`, FRAME_CONFIG);
        this.load.spritesheet('gun', `${PATH.SPRITESHEET}/gun.png`, FRAME_CONFIG);
        this.load.spritesheet('button', `${PATH.SPRITESHEET}/button.png`, FRAME_CONFIG);
        this.load.spritesheet('lever', `${PATH.SPRITESHEET}/lever.png`, FRAME_CONFIG);
        this.load.spritesheet('hiding_platform', `${PATH.SPRITESHEET}/hiding_platform.png`, FRAME_CONFIG);
        this.load.spritesheet('reflector', `${PATH.SPRITESHEET}/reflector.png`, FRAME_CONFIG);
        this.load.spritesheet('glorg', `${PATH.SPRITESHEET}/glorg.png`, FRAME_CONFIG);
        this.load.spritesheet('charger', `${PATH.SPRITESHEET}/charger.png`, FRAME_CONFIG);
        this.load.spritesheet('robot1', `${PATH.SPRITESHEET}/robot1.png`, FRAME_CONFIG);
        this.load.spritesheet('bat', `${PATH.SPRITESHEET}/bat.png`, {frameWidth: 16, frameHeight: 16});

        this.load.spritesheet('button_music', `${PATH.SPRITESHEET}/button_music.png`, FRAME_CONFIG);
        this.load.spritesheet('button_sfx', `${PATH.SPRITESHEET}/button_sfx.png`, FRAME_CONFIG);
        this.load.spritesheet(
            'button_left',
            `${PATH.SPRITESHEET}/button_left.png`,
            {frameWidth: 64, frameHeight: 64},
        );
        this.load.spritesheet(
            'button_right',
            `${PATH.SPRITESHEET}/button_right.png`,
            {frameWidth: 64, frameHeight: 64},
        );
        this.load.spritesheet(
            'button_up',
            `${PATH.SPRITESHEET}/button_up.png`,
            {frameWidth: 64, frameHeight: 64},
        );
        this.load.spritesheet(
            'button_hit',
            `${PATH.SPRITESHEET}/button_hit.png`,
            {frameWidth: 64, frameHeight: 64},
        );

        this.load.image('spike', `${PATH.IMAGES}/spike.png`);
        this.load.image('jumper_opened', `${PATH.IMAGES}/jumper_opened.png`);
        this.load.image('tiles', `${PATH.TILESETS}/industrial.png`);
        this.load.tilemapTiledJSON('mapL1', `${PATH.TILEMAPS}/warehouse_v2_L1.json`);
        this.load.tilemapTiledJSON('mapL2', `${PATH.TILEMAPS}/warehouse_v2_L2.json`);
        this.load.tilemapTiledJSON('mapL3', `${PATH.TILEMAPS}/warehouse_v2_L3.json`);

        this.load.audio('bg_1', [`${PATH.SOUNDS}/background/bg_1.ogg`, `${PATH.SOUNDS}/background/bg_1.mp3`]);
        this.load.audio('die', [`${PATH.SOUNDS}/player/die.ogg`, `${PATH.SOUNDS}/player/die.mp3`]);
        this.load.audio('jump', [`${PATH.SOUNDS}/player/jump.ogg`, `${PATH.SOUNDS}/player/jump.mp3`]);
        this.load.audio('land', [`${PATH.SOUNDS}/player/land.ogg`, `${PATH.SOUNDS}/player/land.mp3`]);
        this.load.audio('hit', [`${PATH.SOUNDS}/player/hit.ogg`, `${PATH.SOUNDS}/player/hit.mp3`]);
        this.load.audio('step', [`${PATH.SOUNDS}/player/step.ogg`, `${PATH.SOUNDS}/player/step.mp3`]);
        this.load.audio('sphere', [`${PATH.SOUNDS}/environment/sphere.ogg`, `${PATH.SOUNDS}/environment/sphere.mp3`]);
        this.load.audio('gun', [`${PATH.SOUNDS}/environment/gun.ogg`, `${PATH.SOUNDS}/environment/gun.mp3`]);
        this.load.audio('lever', [`${PATH.SOUNDS}/environment/lever.ogg`, `${PATH.SOUNDS}/environment/lever.mp3`]);
        this.load.audio('jumper', [`${PATH.SOUNDS}/environment/jumper.ogg`, `${PATH.SOUNDS}/environment/jumper.mp3`]);
        this.load.audio('reflector',
            [`${PATH.SOUNDS}/environment/reflector.ogg`, `${PATH.SOUNDS}/environment/reflector.mp3`],
        );
        this.load.audio('reflector_collide',
            [
                `${PATH.SOUNDS}/environment/reflector_collide.ogg`,
                `${PATH.SOUNDS}/environment/reflector_collide.mp3`,
            ],
        );
    }

    addPipelines() {
        const renderer = this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
        renderer.addPipeline('blink', new Blink(this.game));
    }

    create() {
        this.addPipelines();
        this.scene.start('L1');
    }
}
