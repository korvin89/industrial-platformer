import Phaser from 'phaser';
import {Point, HazardType} from '../../typings/game';


export interface IBat {
    scene: Phaser.Scene;
    x: number;
    y: number;
    start: Point;
    end: Point;
    followDuration?: number;
}

export default class Bat extends Phaser.GameObjects.Sprite {
    props: IBat;
    hazardType: HazardType = 'common';

    constructor(props: IBat) {
        super(props.scene, props.x, props.y, 'bat', 0);
        this.props = props;
        this.createAnimations();
        this.init();
    }

    createAnimations() {
        const {anims} = this.scene;

        anims.create({
            key: 'bat-fly',
            frames: anims.generateFrameNumbers('bat', {start: 0, end: 4}),
            frameRate: 8,
            repeat: -1,
        });
    }

    init() {
        this.setScale(1.5);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setMaxVelocity(0, 0);

        this.play('bat-fly');
    }

    follow() {
        const {
            start,
            end,
            followDuration = 2000,
        } = this.props;

        const flip = end.x < start.x;

        this.setFlipX(flip);
        this.scene.tweens.add({
            targets: this,
            x: end.x,
            y: end.y,
            ease: 'Sine',
            duration: followDuration,
            onComplete: () => {
                this.setFlipX(!flip);
                this.scene.tweens.add({
                    targets: this,
                    x: start.x,
                    y: start.y,
                    ease: 'Sine',
                    duration: followDuration,
                    onComplete: () => {
                        this.follow();
                    },
                });
            },
        });
    }

    die() {
        this.anims.stop();
        this.body.setMaxVelocity(0, 1000);
        this.body.setVelocityY(300);
    }
}
