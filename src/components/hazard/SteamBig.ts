import Phaser from 'phaser';
import SoundManager from '../../libs/SoundManager';
import {Direction} from '../../typings/game';


const DEFAULT_DELAY = 800;

export interface ISteamBig {
    scene: Phaser.Scene;
    soundManager: SoundManager;
    x: number;
    y: number;
    dir?: Direction;
    delay?: number;
}

export default class SteamBig extends Phaser.GameObjects.Sprite {
    props: ISteamBig;
    timer: Phaser.Time.TimerEvent;

    constructor(props: ISteamBig) {
        super(props.scene, props.x, props.y, 'steam_big', 0);
        this.props = props;
        this.createAnimation();
        this.init();
        this.createTimer();
    }

    createAnimation() {
        this.scene.anims.create({
            key: 'steam-big',
            frames: this.scene.anims.generateFrameNumbers('steam_big', {start: 0, end: 9}),
            frameRate: 12,
            hideOnComplete: true,
        });

        this.on(Phaser.Animations.Events.SPRITE_ANIMATION_START, () => {
            this.visible = true;
            this.body.enable = true;
        });

        this.on(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
            this.body.enable = false;
        });
    }

    init() {
        const {dir} = this.props;

        this.visible = false;
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setMaxVelocity(0, 0);
        this.body.setSize(110, 46);

        switch (dir) {
            case 'left': {
                this.angle = -90;
                this.body.setSize(46, 110);
                break;
            }
            case 'right': {
                this.angle = 90;
                this.body.setSize(46, 110);
                break;
            }
            case 'down': {
                this.angle = 180;
                break;
            }
        }

        this.scene.add.existing(this);
    }

    createTimer() {
        const {delay} = this.props;

        this.timer = this.scene.time.addEvent({
            startAt: 0,
            delay: delay || DEFAULT_DELAY,
            callback: () => {
                this.play('steam-big');
                this.props.soundManager.steamBig(this.x, this.y);
            },
            loop: true,
        });
    }

    stop() {
        this.timer.paused = true;
        this.body.enable = false;
    }
}
