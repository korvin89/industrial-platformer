import Phaser from 'phaser';
import {UI_ALPHA, UI_ALPHA_ACTIVE} from '../../constants/game';


type ButtonType = 'left' | 'right' | 'up' | 'hit';

export interface IActionButton {
    scene: Phaser.Scene;
    type: ButtonType;
    x: number;
    y: number;
    onSwitchOn?: () => void;
    onSwitchOff?: () => void;
}

export default class ActionButton extends Phaser.GameObjects.Sprite {
    props: IActionButton;
    pressed = false;

    constructor(props: IActionButton) {
        super(props.scene, props.x, props.y, `button_${props.type}`, 0);
        this.props = props;
        this.init();
    }

    init() {
        this.setScrollFactor(0)
            .setInteractive()
            .setAlpha(UI_ALPHA)
            .on(Phaser.Input.Events.POINTER_DOWN, this.switchOn)
            .on(Phaser.Input.Events.POINTER_OVER, this.switchOn)
            .on(Phaser.Input.Events.POINTER_UP, this.switchOff)
            .on(Phaser.Input.Events.POINTER_OUT, this.switchOff);

        this.scene.add.existing(this);
    }

    switchOn() {
        if (this.pressed) {
            return;
        }

        this.setFrame(1);
        this.setAlpha(UI_ALPHA_ACTIVE);
        this.pressed = true;
        this.props.onSwitchOn?.();
    }

    switchOff() {
        if (!this.pressed) {
            return;
        }

        this.setFrame(0);
        this.setAlpha(UI_ALPHA);
        this.pressed = false;
        this.props.onSwitchOff?.();
    }
}
