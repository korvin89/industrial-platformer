import Phaser from 'phaser';


type Direction = 'left' | 'right';

export interface ITrack {
    scene: Phaser.Scene;
    x: number;
    y: number;
    dir?: Direction;
    power?: number;
}

export default class Track extends Phaser.GameObjects.Sprite {
    props: ITrack;
    power: number;

    constructor(props: ITrack) {
        super(props.scene, props.x, props.y, 'track', 0);
        this.props = props;
        this.createAnimations();
        this.init();
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'track-left',
            frames: this.scene.anims.generateFrameNumbers('track', {start: 2, end: 0}),
            frameRate: 12,
            repeat: -1,
        });

        this.scene.anims.create({
            key: 'track-right',
            frames: this.scene.anims.generateFrameNumbers('track', {start: 0, end: 2}),
            frameRate: 12,
            repeat: -1,
        });
    }

    init() {
        const {dir = 'left', power} = this.props;

        if (this.props.power) {
            this.power = power;
        } else {
            this.power = dir === 'left' ? -150 : 150;
        }

        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setMaxVelocity(0, 0);
        this.body.setSize(128, 2);
        this.body.setOffset(0, -1);
        this.scene.add.existing(this);

        if (dir === 'left') {
            this.play('track-left');
        } else {
            this.play('track-right');
        }
    }
}
