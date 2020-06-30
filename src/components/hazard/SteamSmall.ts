import Phaser from 'phaser';
import SoundManager from '../../libs/SoundManager';
import {getDirection} from '../../libs/helpers';
import {Direction, Point} from '../../typings/game';


export interface ISteamSmall {
    scene: Phaser.Scene;
    soundManager: SoundManager;
    start: Point;
    end: Point;
    switchedOn?: boolean;
}

export default class SteamSmall extends Phaser.GameObjects.Sprite {
    props: ISteamSmall;
    dir: Direction;
    defaultSize: {x: number; y: number};
    defaultOffset: {x: number; y: number};
    timer: Phaser.Time.TimerEvent | null = null;
    switchedOn: boolean;

    constructor(props: ISteamSmall) {
        super(props.scene, props.start.x, props.start.y, 'steam_small', 0);
        this.props = props;
        this.createAnimation();
        this.init();
    }

    createAnimation() {
        this.scene.anims.create({
            key: 'steam-small',
            frames: this.scene.anims.generateFrameNumbers('steam_small', {start: 0, end: 11}),
            frameRate: 12,
            hideOnComplete: true,
        });
    }

    createTimer() {
        this.timer = this.scene.time.addEvent({
            delay: 1500,
            callback: this.fire,
            loop: true,
        });
    }

    init() {
        const {switchedOn, start, end} = this.props;

        this.visible = false;
        this.switchedOn = switchedOn ?? true;
        this.dir = getDirection(start, end);

        this.scene.physics.add.existing(this);
        this.body.setMaxVelocity(0, 0);
        // up
        this.body.setSize(20, 20);
        this.body.setOffset(5, 8);

        switch (this.dir) {
            case 'left': {
                this.angle = -90;
                this.defaultSize = {x: 20, y: 20};
                this.defaultOffset = {x: 8, y: 8};
                break;
            }
            case 'right': {
                this.angle = 90;
                this.defaultSize = {x: 20, y: 20};
                this.defaultOffset = {x: 2, y: 8};
                break;
            }
            case 'down': {
                this.angle = 180;
                this.defaultSize = {x: 20, y: 20};
                this.defaultOffset = {x: 6, y: 4};
                break;
            }
            // up
            default: {
                this.defaultSize = {x: 20, y: 20};
                this.defaultOffset = {x: 5, y: 8};
            }
        }

        this.scene.add.existing(this);

        if (this.switchedOn) {
            this.createTimer();
        }
    }

    setInitialState = () => {
        const {start: {x, y}} = this.props;

        this.body.enable = false;
        this.body.setSize(this.defaultSize.x, this.defaultSize.y);
        this.body.setOffset(this.defaultOffset.x, this.defaultOffset.y);

        if (this.dir === 'up' || this.dir === 'down') {
            this.y = y;
        } else {
            this.x = x;
        }
    };

    fire = () => {
        this.play('steam-small');
        this.props.soundManager.steamSmall(this.x, this.y);

        this.visible = true;
        this.body.enable = true;
        this.scene.tweens.add({
            targets: this,
            x: this.props.end.x,
            ease: 'Linear',
            duration: 1000,
            onComplete: this.setInitialState,
            onUpdate: (_, target) => {
                // В данном случае значение target.frame.name отлично
                // вписалось для описания изменения контуров тела
                switch (this.dir) {
                    case 'left': {
                        this.body.setSize(this.defaultSize.x - target.frame.name, this.defaultSize.y);
                        this.body.setOffset(this.defaultOffset.x + target.frame.name, this.defaultOffset.y);
                        break;
                    }
                    case 'right': {
                        this.body.setSize(this.defaultSize.x - target.frame.name, this.defaultSize.y);
                        this.body.setOffset(this.defaultOffset.x, this.defaultOffset.y);
                        break;
                    }
                    case 'down': {
                        this.body.setSize(this.defaultSize.x, this.defaultSize.y - target.frame.name);
                        this.body.setOffset(this.defaultOffset.x, this.defaultOffset.y);
                        break;
                    }
                    default: {
                        this.body.setSize(this.defaultSize.x, this.defaultSize.y - target.frame.name);
                        this.body.setOffset(this.defaultOffset.x, this.defaultOffset.y + target.frame.name);
                    }
                }
            },
        });
    };

    switch() {
        if (!this.switchedOn && !this.timer) {
            this.createTimer();
        }

        this.switchedOn = !this.switchedOn;
    }
}
