import Phaser from 'phaser';
import TumblerButton from '../components/UI/TumblerButton';
import Player from '../components/Player';
import Sphere from '../components/enviroment/Sphere';
import Lever from '../components/enviroment/Lever';
import HidingPlatform from '../components/enviroment/HidingPlatform';
import SoundManager from '../libs/SoundManager';
import {DEFAULT_VOLUME_CONFIG} from '../constants/game';
import {Point} from '../typings/game';


export default class L1Scene extends Phaser.Scene {
    player: Player;
    soundManager: SoundManager;
    isPlayerDisabled: boolean;
    tilemap: Phaser.Tilemaps.Tilemap;
    obstacles: Phaser.Tilemaps.DynamicTilemapLayer;
    sphere: Sphere;
    platform: HidingPlatform;
    lever: Lever;

    constructor() {
        super('L1');
    }

    create({volumeConfig}: {volumeConfig?: {[key: string]: number}}) {
        const isTouch = this.sys.game.device.input.touch;

        this.soundManager = new SoundManager({
            manager: this.sound,
            volumeConfig: volumeConfig || {...DEFAULT_VOLUME_CONFIG},
        });

        this.isPlayerDisabled = false;

        if (!isTouch) {
            this.add
                .text(16, 16, 'Arrow keys or WASD to move & jump\nSpace to hit', {
                    font: '18px monospace',
                    fill: '#000000',
                    padding: {x: 20, y: 10},
                    backgroundColor: '#ffffff',
                })
                .setScrollFactor(0)
                .setDepth(11);
        }

        this.tilemap = this.make.tilemap({key: 'mapL1'});
        const tiles = this.tilemap.addTilesetImage('industrial.v2', 'tiles');
        this.tilemap.createDynamicLayer('background', tiles);
        this.obstacles = this.tilemap.createDynamicLayer('obstacles', tiles);
        this.tilemap.createDynamicLayer('foreground', tiles).setDepth(10);

        this.createUI();
        this.createPlayer();
        this.createHidingPlatform();
        this.createLever();
        this.createSphere();

        this.obstacles.setCollisionByProperty({collides: true});
        this.physics.world.addCollider(this.player.sprite, this.obstacles);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);

        if (!this.soundManager.isBGMusicPlaying()) {
            this.soundManager.playBGMusic();
        }

        if (isTouch) {
            setTimeout(() => {
                this.scale.startFullscreen();
            }, 1000);
        }
    }

    getPoint(scope: string, target: string) {
        return this.tilemap.findObject(scope, ({name}) => name === target) as Point;
    }

    createUI() {
        const {bgMusicMuted, sfxMuted} = this.soundManager;

        new TumblerButton({
            scene: this,
            texture: 'button_music',
            x: this.cameras.main.width - 32,
            y: 32,
            switchedOn: !bgMusicMuted,
            onSwitchOn: () => {
                this.soundManager.unmuteBGMusic();
            },
            onSwitchOff: () => {
                this.soundManager.muteBGMusic();
            },
        });

        new TumblerButton({
            scene: this,
            texture: 'button_sfx',
            x: this.cameras.main.width - 32,
            y: 74,
            switchedOn: !sfxMuted,
            onSwitchOn: () => {
                this.soundManager.unmuteSFX();
            },
            onSwitchOff: () => {
                this.soundManager.muteSFX();
            },
        });
    }

    createPlayer() {
        const {x, y} = this.getPoint('points', 'spawn');
        this.player = new Player({
            scene: this, x, y,
            soundManager: this.soundManager,
        });
    }

    createHidingPlatform() {
        const {x, y} = this.getPoint('points', 'platform');
        this.platform = new HidingPlatform({
            scene: this, x, y,
            tilemap: this.obstacles,
        });
    }

    createLever() {
        const {x, y} = this.getPoint('points', 'lever');
        this.lever = new Lever({
            scene: this, x, y,
            soundManager: this.soundManager,
            onSwitchOn: () => {
                this.platform.switch();
            },
            onSwitchOff: () => {
                this.platform.switch();
            },
        });
    }

    createSphere() {
        const {x, y} = this.getPoint('points', 'sphere');
        this.sphere = new Sphere({
            scene: this, x, y,
            onEnter: this.nextLevel,
        });
    }

    checkLeversOverlap() {
        this.physics.world.overlap(this.lever, this.player.flash, (o1) => {
            (o1 as Lever).switch();
        });
    }

    checkSphereOverlap() {
        this.physics.world.overlap(this.sphere, this.player.sprite, (o1) => {
            (o1 as Sphere).activate();
        });
    }

    checkGameOver() {
        return this.player.sprite.y > this.obstacles.height;
    }

    restart() {
        this.isPlayerDisabled = true;

        const cam = this.cameras.main;
        cam.shake(100, 0.05);
        cam.fade(250, 0, 0, 0);

        this.player.freeze();

        this.soundManager.die();

        cam.once('camerafadeoutcomplete', () => {
            const {volumeConfig} = this.soundManager;
            this.player.destroy();
            this.scene.restart({volumeConfig});
        });
    }

    nextLevel = () => {
        this.isPlayerDisabled = true;

        const cam = this.cameras.main;
        cam.zoomTo(2, 1000);

        this.player.freeze();

        this.soundManager.stopBGMusic();
        this.soundManager.sphere();

        cam.once('camerazoomcomplete', () => {
            cam.fade(1000, 29, 33, 45);
        });

        cam.once('camerafadeoutcomplete', () => {
            const {volumeConfig} = this.soundManager;

            this.player.destroy();
            this.scene.start('L2', {volumeConfig});
        });
    };

    update() {
        if (this.isPlayerDisabled) {
            return;
        }

        this.player.update();
        this.checkLeversOverlap();
        this.checkSphereOverlap();

        if (this.checkGameOver()) {
            this.restart();
        }
    }
}
