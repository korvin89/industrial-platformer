import Phaser from 'phaser';


export interface ITumblerButton {
    scene: Phaser.Scene;
    texture: string;
    x: number;
    y: number;
    onSwitchOn: () => void;
    onSwitchOff: () => void;
    switchedOn?: boolean;
}

export default class TumblerButton extends Phaser.GameObjects.Sprite {
    props: ITumblerButton;
    switchedOn: boolean;
    lastSwitchTime = Date.now();

    constructor(props: ITumblerButton) {
        super(props.scene, props.x, props.y, props.texture, 0);
        this.props = props;
        this.init();
    }

    init() {
        const {switchedOn = true} = this.props;

        this.switchedOn = switchedOn;

        if (!this.switchedOn) {
            this.setFrame(1);
        }

        this.scene.add.existing(this);
        this.setScrollFactor(0);
        this.setInteractive();
        this.on(Phaser.Input.Events.POINTER_DOWN, this.switch);
    }

    switchOn() {
        this.setFrame(0);

        this.props.onSwitchOn();

        this.switchedOn = true;
    }

    switchOff() {
        this.setFrame(1);

        this.props.onSwitchOff?.();

        this.switchedOn = false;
    }

    switch() {
        if (this.switchedOn) {
            this.switchOff();
        } else {
            this.switchOn();
        }
    }
}
