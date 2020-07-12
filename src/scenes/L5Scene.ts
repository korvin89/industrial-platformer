import Phaser from 'phaser';
import Player from '../components/Player';
import Sphere from '../components/enviroment/Sphere';
import SteamBig from '../components/hazard/SteamBig';
import SteamSmall from '../components/hazard/SteamSmall';
import TubeSwitcher from '../components/enviroment/TubeSwitcher';
import Toast from '../components/UI/Toast';
import Jumper from '../components/enviroment/Jumper';
import SoundManager from '../libs/SoundManager';
import {createUIControls} from '../libs/helpers';
import {DEFAULT_VOLUME_CONFIG} from '../constants/game';
import {Point} from '../typings/game';


export default class L1Scene extends Phaser.Scene {
    timer: Phaser.Time.TimerEvent;
    soundManager: SoundManager;
    player: Player;
    isPlayerDisabled: boolean;
    timeoutIds: NodeJS.Timeout[] = [];
    toast: Toast;
    tilemap: Phaser.Tilemaps.Tilemap;
    obstacles: Phaser.Tilemaps.DynamicTilemapLayer;
    spikes: Phaser.Physics.Arcade.StaticGroup;
    hazards: Phaser.GameObjects.Group;
    switchers: Phaser.GameObjects.Group;
    steam1: SteamBig;
    jumper: Jumper;
    sphere: Sphere;

    constructor() {
        super('L5');
    }

    create({volumeConfig}: {volumeConfig?: {[key: string]: number}}) {
        this.soundManager = new SoundManager({
            scene: this,
            volumeConfig: volumeConfig || {...DEFAULT_VOLUME_CONFIG},
        });
        this.isPlayerDisabled = false;

        this.tilemap = this.make.tilemap({key: 'mapL5'});
        const tiles = this.tilemap.addTilesetImage('industrial.v2', 'tiles');
        this.tilemap.createDynamicLayer('background', tiles);
        this.obstacles = this.tilemap.createDynamicLayer('obstacles', tiles);
        this.tilemap.createDynamicLayer('foreground', tiles).setDepth(10);

        createUIControls(this, this.soundManager);
        this.createHelpToast();
        this.createPlayer();
        this.createHazards();
        this.createTubeSwitchers();
        this.createJumper();
        this.createSphere();

        this.obstacles.setCollisionByProperty({collides: true});

        this.physics.world.addCollider(this.player.sprite, this.obstacles);

        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);

        if (!this.soundManager.isBGMusicPlaying()) {
            this.soundManager.playBGMusic();
        }

        if (this.sys.game.device.input.touch) {
            setTimeout(() => {
                this.scale.startFullscreen();
            }, 1000);
        }

        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.toast.show();
            },
        });
    }

    getPoint(scope: string, target: string) {
        return this.tilemap.findObject(scope, ({name}) => name === target) as Point;
    }

    getPoints(scope: string, targets: string[]) {
        return targets.map((target) => this.getPoint(scope, target));
    }

    hideLines(count: number) {
        for (let line = 1; line <= count; line++) {
            const id = setTimeout(() => {
                this.tilemap.getObjectLayer(`line${line}`).objects.forEach(({x, y}, index) => {
                    setTimeout(() => {
                        const tile = this.obstacles.getTileAtWorldXY(x, y);
                        this.tweens.add({
                            targets: tile,
                            alpha: 0,
                            ease: 'Linear',
                            duration: 500,
                            onComplete: () => {
                                this.obstacles.removeTileAtWorldXY(x, y);
                            },
                        });
                    }, index * 100);
                });
            }, 1500 * line);

            this.timeoutIds.push(id);
        }
    }

    clearTimers() {
        this.timeoutIds.forEach((id) => clearTimeout(id));
        this.timeoutIds = [];
    }

    createHelpToast() {
        this.toast = new Toast({
            scene: this,
            x: 16,
            y: 16,
            text: 'Hit switcher several times',
        });
    }

    createPlayer() {
        const {x, y} = this.getPoint('points', 'spawn');
        this.player = new Player({
            scene: this, x, y,
            soundManager: this.soundManager,
        });
    }

    createHazards() {
        this.hazards = this.physics.add.group({allowGravity: false});

        const steam1Pos = this.getPoint('points', 'steam1');
        this.steam1 = new SteamBig({
            scene: this,
            x: steam1Pos.x,
            y: steam1Pos.y,
            soundManager: this.soundManager,
        });
        this.hazards.add(this.steam1);

        const steam2Pos = this.getPoint('points', 'steam2');
        this.hazards.add(new SteamBig({
            scene: this,
            x: steam2Pos.x,
            y: steam2Pos.y,
            dir: 'left',
            delay: 3000,
            soundManager: this.soundManager,
        }));

        const pos1 = this.getPoints('points', ['steam_s_1_start', 'steam_s_1_end']);
        const pos2 = this.getPoints('points', ['steam_s_2_start', 'steam_s_2_end']);
        const pos3 = this.getPoints('points', ['steam_s_3_start', 'steam_s_3_end']);

        [pos1, pos2, pos3].forEach(([start, end], index) => {
            const steam = new SteamSmall({
                scene: this,
                start,
                end,
                switchedOn: false,
                soundManager: this.soundManager,
            });

            this.hazards.add(steam);

            this.time.addEvent({
                delay: 1000 * index,
                callback: () => steam.switch(),
                loop: true,
            });
        });
    }

    createTubeSwitchers() {
        this.switchers = this.physics.add.group({allowGravity: false});

        const switcher1Pos = this.getPoint('points', 'tube_switcher1');
        this.switchers.add(new TubeSwitcher({
            scene: this,
            x: switcher1Pos.x,
            y: switcher1Pos.y,
            soundManager: this.soundManager,
            onComplete: () => {
                this.steam1.stop();
                this.toast.hide(() => {
                    this.toast.setValue('Hurry up!');
                    this.toast.show();
                    this.hideLines(10);
                });
            },
        }));
    }

    createJumper() {
        const {x, y} = this.getPoint('points', 'jumper');
        this.jumper = new Jumper({
            scene: this, x, y,
            tile: this.obstacles.getTileAtWorldXY(x, y),
            soundManager: this.soundManager,
        });
    }

    createSphere() {
        const {x, y} = this.getPoint('points', 'sphere');
        this.sphere = new Sphere({
            scene: this, x, y,
            onEnter: this.nextLevel,
        });
    }

    checkSwitchersOverlap() {
        this.physics.world.overlap(this.switchers, this.player.flash, (_, o) => {
            (o as TubeSwitcher).switch();
        });
    }

    checkJumpersOverlap() {
        this.physics.world.overlap(this.jumper, this.player.sprite, (o1, o2) => {
            (o1 as Jumper).switch();
            (o2 as Phaser.GameObjects.Sprite).setVelocityY(-650);
        });
    }

    checkSphereOverlap() {
        this.physics.world.overlap(this.sphere, this.player.sprite, (o1) => {
            (o1 as Sphere).activate();
        });
    }

    checkGameOver() {
        return (
            this.player.sprite.y > this.obstacles.height
            || this.physics.world.overlap(this.player.sprite, this.hazards)
        );
    }

    restart() {
        this.isPlayerDisabled = true;

        const cam = this.cameras.main;
        cam.shake(100, 0.05);
        cam.fade(250, 0, 0, 0);

        this.player.freeze();
        this.clearTimers();

        this.soundManager.die();

        cam.once('camerafadeoutcomplete', () => {
            this.player.destroy();
            this.scene.restart();
        });
    }

    nextLevel = () => {
        this.isPlayerDisabled = true;

        const cam = this.cameras.main;
        cam.zoomTo(2, 1000);

        this.player.freeze();
        this.clearTimers();

        this.soundManager.stopBGMusic();
        this.soundManager.sphere();

        cam.once('camerazoomcomplete', () => {
            cam.fade(1000, 29, 33, 45);
        });

        cam.once('camerafadeoutcomplete', () => {
            this.player.destroy();
            this.scene.restart();
        });
    };

    update() {
        if (this.isPlayerDisabled) {
            return;
        }

        this.player.update();
        this.checkSwitchersOverlap();
        this.checkJumpersOverlap();
        this.checkSphereOverlap();

        if (this.checkGameOver()) {
            this.restart();
        }
    }
}
