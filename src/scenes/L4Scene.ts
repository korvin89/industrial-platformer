import Phaser from 'phaser';
import TumblerButton from '../components/UI/TumblerButton';
import Player from '../components/Player';
import Sphere from '../components/enviroment/Sphere';
import Lever from '../components/enviroment/Lever';
import Jumper from '../components/enviroment/Jumper';
import HidingPlatform from '../components/enviroment/HidingPlatform';
import Track from '../components/enviroment/Track';
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
    tracks: Phaser.GameObjects.Group;
    hazards: Phaser.GameObjects.Group;
    platforms: HidingPlatform[];
    sphere: Sphere;
    jumper: Jumper;
    lever: Lever;

    constructor() {
        super('L4');
    }

    create({volumeConfig}: {volumeConfig: {[key: string]: number}}) {
        this.soundManager = new SoundManager({volumeConfig, manager: this.sound});
        this.isPlayerDisabled = false;

        this.tilemap = this.make.tilemap({key: 'mapL4'});
        const tiles = this.tilemap.addTilesetImage('industrial.v2', 'tiles');
        this.tilemap.createDynamicLayer('background', tiles);
        this.obstacles = this.tilemap.createDynamicLayer('obstacles', tiles);
        this.tilemap.createDynamicLayer('foreground', tiles).setDepth(10);

        this.createUI();
        this.createSpikes();
        this.createPlayer();
        this.createLever();
        this.createTracks();
        this.createHidingPlatform();
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

    createLever() {
        const {x, y} = this.getPoint('points', 'lever');
        this.lever = new Lever({
            scene: this, x, y,
            soundManager: this.soundManager,
            onSwitchOn: () => {
                this.platforms.forEach((platform) => platform.switch());
            },
            onSwitchOff: () => {
                this.platforms.forEach((platform) => platform.switch());
            },
        });
    }

    createTracks() {
        this.tracks = this.physics.add.group({allowGravity: false});

        this.getPoints('points', ['track1', 'track2', 'track3']).forEach(({x, y}, index) => {
            this.tracks.add(new Track({
                scene: this, x, y,
                dir: index === 1 ? 'right' : 'left',
            }));
        });
    }

    createHidingPlatform() {
        this.platforms = [];

        this.getPoints('points', ['platform1', 'platform2', 'platform3', 'platform4'])
            .forEach(({x, y}) => {
                const platform = new HidingPlatform({
                    scene: this, x, y,
                    tilemap: this.obstacles,
                });

                this.platforms.push(platform);
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

    checkLeversOverlap() {
        this.physics.world.overlap(this.lever, this.player.flash, (o1) => {
            (o1 as Lever).switch();
        });
    }

    checkTracksOverlap() {
        this.player.deltaHorAcceleration = 0;

        this.physics.world.overlap(this.tracks, this.player.sprite, (_, o2) => {
            const track = o2 as Track;
            this.player.deltaHorAcceleration = track.power;
        });
    }

    checkJumperOverlap() {
        this.physics.world.overlap(this.jumper, this.player.sprite, (o1, o2) => {
            (o1 as Jumper).switch();
            (o2 as Phaser.GameObjects.Sprite).setVelocityY(-600);
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
            || this.player.sprite.y > this.obstacles.height
        );
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
            this.player.destroy();
            this.scene.restart();
        });
    };

    update() {
        if (this.isPlayerDisabled) {
            return;
        }

        this.player.update();
        this.checkLeversOverlap();
        this.checkTracksOverlap();
        this.checkJumperOverlap();
        this.checkSphereOverlap();

        if (this.checkGameOver()) {
            this.restart();
        }
    }
}
