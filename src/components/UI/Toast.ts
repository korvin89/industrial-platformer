import Phaser from 'phaser';


export interface IToast {
    scene: Phaser.Scene;
    text: string;
    x: number;
    y: number;
}

export default class Toast extends Phaser.GameObjects.Text {
    props: IToast;

    constructor(props: IToast) {
        super(
            props.scene,
            props.x,
            props.y,
            props.text,
            {
                fontSize: 18,
                fontFamily: 'monospace',
                color: '#000000',
                padding: {x: 20, y: 10},
                backgroundColor: '#ffffff',
            },
        );
        this.props = props;
        this.init();
    }

    init() {
        this.x = -this.width;
        this.setScrollFactor(0)
            .setAlpha(0)
            .setDepth(11);
        this.scene.add.existing(this);
    }

    setValue(text: string) {
        this.text = text;
        this.x = -this.width;
        this.setAlpha(0);
    }

    show(cb?: () => void) {
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            x: this.props.x,
            ease: 'Back.easeOut',
            duration: 400,
            onComplete: () => cb?.(),
        });
    }

    hide(cb?: () => void) {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            x: -this.width,
            ease: 'Back.easeIn',
            duration: 400,
            onComplete: () => cb?.(),
        });
    }
}
