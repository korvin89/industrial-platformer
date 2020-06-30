import Phaser from 'phaser';
import SoundManager from '../../libs/SoundManager';
import {ACTION_COOLDOWN} from '../../constants/game';


export interface ITubeSwitcher {
    scene: Phaser.Scene;
    soundManager: SoundManager;
    x: number;
    y: number;
    onComplete: () => void;
    onSwitch?: () => void;
}

export default class TubeSwitcher extends Phaser.GameObjects.Sprite {
    props: ITubeSwitcher;
    lastSwitchTime = Date.now();
    turns = 3;

    constructor(props: ITubeSwitcher) {
        super(props.scene, props.x, props.y, 'tube_switcher', 0);
        this.props = props;
        this.init();
    }

    init() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setMaxVelocity(0, 0);
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

        this.lastSwitchTime = now;

        this.turns -= 1;

        if (this.turns === 0) {
            this.body.enable = false;
            this.setFrame(1);
            this.props.onComplete();
        }

        // this.props.soundManager.reflector();
    }
}
