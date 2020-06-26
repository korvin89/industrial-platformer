import Phaser from 'phaser';


export interface ICharger {
    scene: Phaser.Scene;
    x: number;
    y: number;
    onChargeFilled: () => void;
    onChargeEmptied?: () => void;
}

const MIN_CHARGE_VOLUME = 0;
const MAX_CHARGE_VOLUME = 3;

export default class Charger extends Phaser.GameObjects.Sprite {
    props: ICharger;
    chargeVolume = 0;

    constructor(props: ICharger) {
        super(props.scene, props.x, props.y, 'charger', 0);
        this.props = props;
        this.init();
    }

    init() {
        this.scene.add.existing(this);
    }

    increment() {
        if (this.chargeVolume < MAX_CHARGE_VOLUME) {
            this.chargeVolume += 1;
        }

        this.setFrame(this.chargeVolume);

        if (this.chargeVolume === MAX_CHARGE_VOLUME) {
            this.props.onChargeFilled();
        }
    }

    decrement() {
        if (this.chargeVolume > MIN_CHARGE_VOLUME) {
            this.chargeVolume -= 1;
        }

        this.setFrame(this.chargeVolume);

        if (this.chargeVolume === MIN_CHARGE_VOLUME) {
            this.props?.onChargeEmptied();
        }
    }
}
