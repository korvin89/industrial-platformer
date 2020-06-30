import Phaser from 'phaser';
import TumblerButton from '../components/UI/TumblerButton';
import Player from '../components/Player';
import Sphere from '../components/enviroment/Sphere';
import Lever from '../components/enviroment/Lever';
import Jumper from '../components/enviroment/Jumper';
import Gun, {Bullet} from '../components/enviroment/Gun';
import Reflector from '../components/enviroment/Reflector';
import SoundManager from '../libs/SoundManager';
import {Point} from '../typings/game';


const REFLECTOR_COLLIION_TIMEOUT = 100;

export default class L1Scene extends Phaser.Scene {
    player: Player;
    soundManager: SoundManager;
    isPlayerDisabled: boolean;
    tilemap: Phaser.Tilemaps.Tilemap;
    obstacles: Phaser.Tilemaps.DynamicTilemapLayer;
    spikes: Phaser.Physics.Arcade.StaticGroup;
    bullets: Phaser.GameObjects.Group;
    reflectors: Phaser.GameObjects.Group;
    sphere: Sphere;
    jumper: Jumper;
    lever: Lever;
    gun: Gun;

    constructor() {
        super('L2');
    }

    create({volumeConfig}: {volumeConfig: {[key: string]: number}}) {
        this.soundManager = new SoundManager({volumeConfig, manager: this.sound});
        this.isPlayerDisabled = false;

        this.tilemap = this.make.tilemap({key: 'mapL2'});
        const tiles = this.tilemap.addTilesetImage('industrial.v2', 'tiles');
        this.tilemap.createDynamicLayer('background', tiles);
        this.obstacles = this.tilemap.createDynamicLayer('obstacles', tiles);
        this.tilemap.createDynamicLayer('foreground', tiles).setDepth(10);

        this.createUI();
        this.createSpikes();
        this.createPlayer();
        this.createGun();
        this.createReflectors();
        this.createLever();
        this.createJumper();
        this.createSphere();

        this.obstacles.setCollisionByProperty({collides: true});

        this.physics.world.addCollider(this.player.sprite, this.obstacles);
        this.physics.world.addCollider(
            this.bullets,
            this.obstacles,
            (o1) => {
                o1.destroy();
            },
        );

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
    }

    getPoint(scope: string, target: string) {
        return this.tilemap.findObject(scope, ({name}) => name === target) as Point;
    }

    getPoints(scope: string, targets: string[]) {
        return targets.map((target) => this.getPoint(scope, target));
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

    createSpikes() {
        this.spikes = this.physics.add.staticGroup();
        this.obstacles.forEachTile((tile) => {
            if (tile.index === 77) {
                const spike = this.spikes.create(tile.getCenterX(), tile.getCenterY(), 'spike');

                spike.rotation = tile.rotation;
                if (spike.angle === 0) {
                    spike.body.setSize(32, 6).setOffset(0, 26);
                } else if (spike.angle === -90) {
                    spike.body.setSize(6, 32).setOffset(26, 0);
                } else if (spike.angle === 90) {
                    spike.body.setSize(6, 32).setOffset(0, 0);
                } else if (spike.angle === -180) {
                    spike.body.setSize(32, 6).setOffset(0, 0);
                }

                this.obstacles.removeTileAt(tile.x, tile.y);
            }
        });
    }

    createPlayer() {
        const {x, y} = this.getPoint('points', 'spawn');
        this.player = new Player({
            scene: this, x, y,
            soundManager: this.soundManager,
        });
    }

    createGun() {
        this.bullets = this.add.group();
        const {x, y} = this.getPoint('points', 'gun');
        this.gun = new Gun({
            scene: this, x, y,
            group: this.bullets,
            dir: 'right',
            soundManager: this.soundManager,
        });
    }

    createReflectors() {
        this.reflectors = this.physics.add.group({allowGravity: false});
        this.getPoints('points', ['reflector_top', 'reflector_bottom'])
            .forEach(({x, y}) => this.reflectors.add(new Reflector({
                scene: this, x, y,
                soundManager: this.soundManager,
            })));
    }

    createLever() {
        const {x, y} = this.getPoint('points', 'lever');
        const tilePos = this.getPoint('points', 'removable');
        this.lever = new Lever({
            scene: this, x, y,
            soundManager: this.soundManager,
            onSwitchOn: () => {
                this.obstacles.removeTileAtWorldXY(tilePos.x, tilePos.y);
            },
            onSwitchOff: () => {
                const tile = this.obstacles.putTileAtWorldXY(14, tilePos.x, tilePos.y);
                tile.setCollision(true);
            },
        });
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

    checkGunOverlap() {
        this.physics.world.overlap(this.gun, this.player.flash, (o) => {
            (o as Gun).shoot();
        });
    }

    checkReflectorsOverlap() {
        this.physics.world.overlap(this.reflectors, this.player.flash, (_, o) => {
            (o as Reflector).switch();
        });
    }

    checkBulletReflectorOverlap() {
        this.physics.world.overlap(
            this.bullets,
            this.reflectors,
            (o1, o2) => {
                const now = Date.now();
                const bullet = o1 as Bullet;
                const reflector = o2 as Reflector;

                if (now < reflector.lastCollisionTime + REFLECTOR_COLLIION_TIMEOUT) {
                    return;
                }

                const angle = reflector.angle;

                switch (bullet.dir) {
                    case 'right':
                        if (![-90, -180].includes(angle)) {
                            o1.destroy();
                            break;
                        }

                        bullet.dir = angle === -180 ? 'down' : 'up';
                        bullet.x = reflector.x - bullet.width / 2;
                        bullet.body.setVelocity(0, angle === -180 ? 500 : -500);
                        reflector.collide();
                        break;
                    case 'left':
                        if (![0, 90].includes(angle)) {
                            bullet.destroy();
                            break;
                        }

                        bullet.dir = angle === 90 ? 'down' : 'up';
                        bullet.x = reflector.x + bullet.width / 2;
                        bullet.body.setVelocity(0, angle === 90 ? 500 : -500);
                        reflector.collide();
                        break;
                    case 'up':
                        if (![90, -180].includes(angle)) {
                            bullet.destroy();
                            break;
                        }

                        bullet.dir = angle === -180 ? 'left' : 'right';
                        bullet.x = reflector.x;
                        bullet.y = reflector.y + bullet.height / 2;
                        bullet.body.setVelocity(angle === -180 ? -500 : 500, 0);
                        reflector.collide();
                        break;
                    case 'down':
                        if (![0, -90].includes(angle)) {
                            bullet.destroy();
                            break;
                        }

                        bullet.dir = angle === -90 ? 'left' : 'right';
                        bullet.x = reflector.x;
                        bullet.y = reflector.y - bullet.height / 2;
                        bullet.body.setVelocity(angle === -90 ? -500 : 500, 0);
                        reflector.collide();
                        break;
                    default:
                        bullet.destroy();
                }

                reflector.lastCollisionTime = now;
            },
        );
    }

    checkLeversOverlap() {
        this.physics.world.overlap(this.lever, this.bullets, (o1) => {
            (o1 as Lever).switch();
        });
    }

    checkJumpersOverlap() {
        this.physics.world.overlap(this.jumper, this.player.sprite, (o1, o2) => {
            (o1 as Jumper).switch();
            (o2 as Phaser.GameObjects.Sprite).setVelocityY(-1000);
        });
    }

    checkSphereOverlap() {
        this.physics.world.overlap(this.sphere, this.player.sprite, (o1) => {
            (o1 as Sphere).activate();
        });
    }

    checkGameOver() {
        return this.physics.world.overlap(this.player.sprite, this.spikes);
    }

    restart() {
        this.isPlayerDisabled = true;

        const cam = this.cameras.main;
        cam.shake(100, 0.05);
        cam.fade(250, 0, 0, 0);

        this.player.freeze();

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

        this.soundManager.stopBGMusic();
        this.soundManager.sphere();

        cam.once('camerazoomcomplete', () => {
            cam.fade(1000, 29, 33, 45);
        });

        cam.once('camerafadeoutcomplete', () => {
            const {volumeConfig} = this.soundManager;
            this.player.destroy();
            this.scene.start('L3', {volumeConfig});
        });
    };

    update() {
        if (this.isPlayerDisabled) {
            return;
        }

        this.player.update();
        this.checkGunOverlap();
        this.checkReflectorsOverlap();
        this.checkBulletReflectorOverlap();
        this.checkLeversOverlap();
        this.checkJumpersOverlap();
        this.checkSphereOverlap();

        if (this.checkGameOver()) {
            this.restart();
        }
    }
}
