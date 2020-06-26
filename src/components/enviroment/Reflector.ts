import Phaser from 'phaser';
import SoundManager from '../../libs/SoundManager';
import {ACTION_COOLDOWN} from '../../constants/game';


export interface IReflector {
    scene: Phaser.Scene;
    soundManager: SoundManager;
    x: number;
    y: number;
    onSwitch?: () => void;
}

export default class Reflector extends Phaser.GameObjects.Sprite {
    props: IReflector;
    lastSwitchTime = Date.now();
    lastCollisionTime = Date.now();
    opened = false;

    constructor(props: IReflector) {
        super(props.scene, props.x, props.y, 'reflector', 0);
        this.props = props;
        this.init();
    }

    init() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setMaxVelocity(0, 0);
    }

    collide() {
        this.setFrame(1);

        setTimeout(() => {
            this.setFrame(0);
        }, 100);

        this.props.soundManager.reflectorCollide();
    }

    switch() {
        const now = Date.now();

        if (now - this.lastSwitchTime < ACTION_COOLDOWN) {
            return;
        }

        this.props.onSwitch?.();

        const nextAngle = this.angle === 360 ? 0 : this.angle + 90;

        this.scene.tweens.add({
            targets: this,
            angle: nextAngle,
            ease: 'Linear',
            duration: 200,
        });

        this.setPipeline('blink');
        setTimeout(() => this.resetPipeline(), 50);

        this.lastSwitchTime = now;

        this.props.soundManager.reflector();
    }
}
