import Phaser from 'phaser';
import TumblerButton from '../components/UI/TumblerButton';
import Player from '../components/Player';
import Sphere from '../components/enviroment/Sphere';
import Lever from '../components/enviroment/Lever';
import Jumper from '../components/enviroment/Jumper';
import HidingPlatform from '../components/enviroment/HidingPlatform';
import Bat from '../components/hazard/Bat';
import SoundManager from '../libs/SoundManager';
import {Point} from '../typings/game';


export default class L1Scene extends Phaser.Scene {
    timer: Phaser.Time.TimerEvent;
    soundManager: SoundManager;
    player: Player;
    isPlayerDisabled: boolean;
    tilemap: Phaser.Tilemaps.Tilemap;
    obstacles: Phaser.Tilemaps.DynamicTilemapLayer;
    spikes: Phaser.Physics.Arcade.StaticGroup;
    jumpers: Phaser.GameObjects.Group;
    hazards: Phaser.GameObjects.Group;
    platforms: HidingPlatform[] = [];
    sphere: Sphere;
    jumper: Jumper;
    lever: Lever;

    constructor() {
        super('L3');
    }

    create({volumeConfig}: {volumeConfig: {[key: string]: number}}) {
        this.soundManager = new SoundManager({volumeConfig, manager: this.sound});
        this.isPlayerDisabled = false;

        this.tilemap = this.make.tilemap({key: 'mapL3'});
        const tiles = this.tilemap.addTilesetImage('industrial.v2', 'tiles');
        this.tilemap.createDynamicLayer('background', tiles);
        this.obstacles = this.tilemap.createDynamicLayer('obstacles', tiles);
        this.tilemap.createDynamicLayer('foreground', tiles).setDepth(10);

        this.createUI();
        this.createSpikes();
        this.createPlayer();
        this.createHidingPlatform();
        this.createJumpers();
        this.createHazards();
        this.createSphere();

        this.obstacles.setCollisionByProperty({collides: true});

        this.physics.world.addCollider(this.player.sprite, this.obstacles);

        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels);

        setTimeout(() => {
            this.timer = this.time.addEvent({
                delay: 3000,
                callback: () => {
                    this.platforms.forEach((platform, index) => {
                        setTimeout(() => {
                            platform?.switch();
                        }, 100 * index);
                    });
                },
                callbackScope: this,
                loop: true,
            });
        }, 100);

        this.soundManager.playBGMusic();

        // setTimeout(() => {
        //     // @ts-ignore
        //     this.sound.get('bg_1').volume = 1;
        // }, 3000);
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

    createHidingPlatform() {
        this.getPoints('platforms', [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15',
        ])
            .forEach(({x, y}) => {
                const platform = new HidingPlatform({
                    scene: this, x, y,
                    tilemap: this.obstacles,
                });

                this.platforms.push(platform);
            });
    }

    createJumpers() {
        this.jumpers = this.physics.add.group({allowGravity: false});

        this.getPoints('points', ['jumper1', 'jumper2', 'jumper3', 'jumper4']).forEach(({x, y}, index) => {
            const jumper = new Jumper({
                scene: this, x, y,
                tile: this.obstacles.getTileAtWorldXY(x, y),
                id: `jumper_${index + 1}`,
                soundManager: this.soundManager,
            });

            this.jumpers.add(jumper);
        });
    }

    createHazards() {
        this.hazards = this.physics.add.group({allowGravity: false});

        const [b1Start, b1End] = this.getPoints('points', ['h1_start', 'h1_end']);
        const bat1 = new Bat({
            scene: this,
            x: b1Start.x,
            y: b1Start.y,
            start: b1Start,
            end: b1End,
        });
        bat1.follow();
        this.hazards.add(bat1);

        const [b2Start, b2End] = this.getPoints('points', ['h2_start', 'h2_end']);
        const bat2 = new Bat({
            scene: this,
            x: b2Start.x,
            y: b2Start.y,
            start: b2Start,
            end: b2End,
        });
        bat2.follow();
        this.hazards.add(bat2);
    }

    createSphere() {
        const {x, y} = this.getPoint('points', 'sphere');
        this.sphere = new Sphere({
            scene: this, x, y,
            onEnter: this.nextLevel,
        });
    }

    checkJumpersOverlap() {
        this.physics.world.overlap(this.jumpers, this.player.sprite, (o1, o2) => {
            const jumper = o2 as Jumper;
            const player = o1 as Phaser.GameObjects.Sprite;

            jumper.switch();
            player.setVelocityY(-650);

            switch (jumper.id) {
                case 'jumper_1': {
                    jumper.switch();
                    player.setVelocityY(-650);
                    break;
                }

                default: {
                    jumper.switch();
                    player.setVelocityY(-550);
                    break;
                }
            }
        });
    }

    checkSphereOverlap() {
        this.physics.world.overlap(this.sphere, this.player.sprite, (o1) => {
            (o1 as Sphere).activate();
        });
    }

    checkGameOver() {
        return (
            this.physics.world.overlap(this.player.sprite, this.spikes)
            || this.physics.world.overlap(this.player.sprite, this.hazards)
        );
    }

    restart() {
        this.isPlayerDisabled = true;

        const cam = this.cameras.main;
        cam.shake(100, 0.05);
        cam.fade(250, 0, 0, 0);

        this.player.freeze();
        this.timer.remove();
        this.platforms = [];

        this.soundManager.stopBGMusic();
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
        this.timer.remove();
        this.platforms = [];

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
        this.checkJumpersOverlap();
        this.checkSphereOverlap();

        if (this.checkGameOver()) {
            this.restart();
        }
    }
}
