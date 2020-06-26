import Phaser from 'phaser';
import SoundManager from '../../libs/SoundManager';
import {ACTION_COOLDOWN} from '../../constants/game';
import {Direction} from '../../typings/game';


export interface IGun {
    scene: Phaser.Scene;
    soundManager: SoundManager;
    group: Phaser.GameObjects.Group;
    dir: Direction;
    x: number;
    y: number;
}

export class Bullet extends Phaser.GameObjects.Sprite {
    dir: Direction;

    constructor(scene: Phaser.Scene, dir: Direction, x: number, y: number) {
        super(scene, x, y, 'gun_bullet', 0);
        this.dir = dir;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.setAllowGravity(false);
        this.body.setVelocityX(500);
    }
}

export default class Gun extends Phaser.GameObjects.Sprite {
    props: IGun;
    lastShootTime = Date.now();
    opened = false;

    constructor(props: IGun) {
        super(props.scene, props.x, props.y, 'gun', 0);
        this.props = props;
        this.createAnimation();
        this.init();
        this.play('gun-idle');
    }

    createAnimation() {
        this.scene.anims.create({
            key: 'gun-idle',
            frames: this.scene.anims.generateFrameNumbers('gun', {start: 0, end: 2}),
            frameRate: 4,
            repeat: -1,
        });
    }

    init() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setMaxVelocity(0, 0);
    }

    shoot() {
        const now = Date.now();

        if (now - this.lastShootTime < ACTION_COOLDOWN) {
            return;
        }

        const bullet = new Bullet(this.scene, this.props.dir, this.x, this.y);
        this.props.group.add(bullet);

        this.setPipeline('blink');
        setTimeout(() => this.resetPipeline(), 50);

        this.lastShootTime = now;

        this.props.soundManager.gun();
    }
}
