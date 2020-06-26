import Phaser from 'phaser';
import SoundManager from '../../libs/SoundManager';
import {ACTION_COOLDOWN} from '../../constants/game';


export interface ILever {
    scene: Phaser.Scene;
    soundManager: SoundManager;
    x: number;
    y: number;
    onSwitchOn: () => void;
    onSwitchOff?: () => void;
}

export default class Lever extends Phaser.GameObjects.Sprite {
    props: ILever;
    lastSwitchTime = Date.now();
    switchedOn = false;

    constructor(props: ILever) {
        super(props.scene, props.x, props.y, 'lever', 0);
        this.props = props;
        this.init();
    }

    init() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setMaxVelocity(0, 0);
        this.body.setSize(24, 20);
        this.body.setOffset(6, 12);
    }

    blink() {
        this.setPipeline('blink');
        setTimeout(() => this.resetPipeline(), 50);
    }

    checkSwitchAccessibility() {
        const now = Date.now();

        if (now - this.lastSwitchTime < ACTION_COOLDOWN) {
            return false;
        }

        this.lastSwitchTime = now;

        return true;
    }

    switchOn() {
        this.setFrame(4);

        this.props.onSwitchOn();

        this.switchedOn = true;
    }

    switchOff() {
        this.setFrame(0);

        this.props.onSwitchOff?.();

        this.switchedOn = false;
    }

    switch() {
        if (!this.checkSwitchAccessibility()) {
            return;
        }

        if (this.switchedOn) {
            this.switchOff();
        } else {
            this.switchOn();
        }

        this.blink();

        this.props.soundManager.lever();
    }
}
