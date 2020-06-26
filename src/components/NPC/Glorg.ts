import Phaser from 'phaser';


export interface IGlorg {
    scene: Phaser.Scene;
    x: number;
    y: number;
    initialFlipX?: boolean;
    onEnter: () => void;
    onLeave: () => void;
}

export default class Glorg extends Phaser.GameObjects.Sprite {
    props: IGlorg;
    entered = false;
    justLeaved = false;

    constructor(props: IGlorg) {
        super(props.scene, props.x, props.y, 'glorg', 0);
        this.props = props;
        this.createAnimations();
        this.init();

        // this.play('glorg-walk');
        // this.scene.tweens.add({
        //     targets: this,
        //     x: this.x + 100,
        //     ease: 'Linear',
        //     duration: 1000,
        //     onComplete: () => {
        //         this.play('glorg-idle');
        //     },
        // });
    }

    createAnimations() {
        const {anims} = this.scene;

        anims.create({
            key: 'glorg-walk',
            frames: anims.generateFrameNumbers('glorg', {start: 0, end: 4}),
            frameRate: 8,
            repeat: -1,
        });
        anims.create({
            key: 'glorg-idle',
            frames: anims.generateFrameNumbers('glorg', {start: 0, end: 1}),
            frameRate: 2,
            repeat: -1,
        });
    }

    init() {
        const {initialFlipX = false} = this.props;

        this.setFlipX(initialFlipX);

        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setSize(64, 32);
        this.play('glorg-idle');
    }

    enter() {
        if (!this.entered) {
            this.props?.onEnter();
        }

        this.entered = true;
    }

    leave() {
        if (this.entered) {
            this.props?.onLeave();
        }

        this.entered = false;
    }
}
