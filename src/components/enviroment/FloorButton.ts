import Phaser from 'phaser';


export interface IFloorButton {
    scene: Phaser.Scene;
    x: number;
    y: number;
    onSwitchOn: () => void;
    onSwitchOff: () => void;
}

export default class FloorButton extends Phaser.GameObjects.Sprite {
    props: IFloorButton;
    pressed = false;

    constructor(props: IFloorButton) {
        super(props.scene, props.x, props.y, 'button', 0);
        this.props = props;
        this.init();
    }

    init() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setSize(32, 6);
        this.body.setOffset(0, 25);
    }

    switchOn() {
        this.setFrame(1);

        if (!this.pressed) {
            this.props.onSwitchOn();
        }

        this.pressed = true;
    }

    switchOff() {
        this.setFrame(0);

        if (this.pressed) {
            this.props.onSwitchOff();
        }

        this.pressed = false;
    }
}
