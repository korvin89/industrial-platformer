import Phaser from 'phaser';
import SoundManager from '../../libs/SoundManager';
import {getSceneKeys} from '../../libs/helpers';


interface IVeil {
    scene: Phaser.Scene;
    camera: Phaser.Cameras.Scene2D.Camera;
    soundManager: SoundManager;
}

class Veil extends Phaser.GameObjects.Container {
    props: IVeil;

    constructor(props: IVeil) {
        super(props.scene, props.camera.midPoint.x, props.camera.midPoint.y);
        this.props = props;
        const {width, height} = props.camera;
        const rect = props.scene.add.rectangle(0, 0, width, height, 0x000000, 0.5);
        this.setDepth(20);
        rect.setInteractive();
        this.add(rect);
        this.createButtons();

        props.scene.add.existing(this);

        rect.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.destroy();
        });
    }

    createButtons() {
        const BUTTON_WIDTH = 40;
        const BUTTON_PADDING = 10;
        const sceneKeys = getSceneKeys(this.scene);
        const totalWidth = sceneKeys.length * BUTTON_WIDTH + (sceneKeys.length - 1) * BUTTON_PADDING;
        let x = -totalWidth / 2;

        sceneKeys.forEach((key) => {
            const text = this.scene.add.text(x, 0, key, {
                fontSize: 18,
                fontFamily: 'monospace',
                color: '#000000',
                padding: {x: 10, y: 6},
                backgroundColor: '#ffffff',
            })
                .setOrigin(0.5, 0.5)
                .setInteractive()
                .on(Phaser.Input.Events.POINTER_DOWN, () => {
                    this.scene.scene.start(key);
                    const {volumeConfig} = this.props.soundManager;
                    this.scene.scene.start(key, {volumeConfig});
                });

            this.add(text);

            x += BUTTON_WIDTH + BUTTON_PADDING;
        });
    }
}

export interface ILevelButton {
    scene: Phaser.Scene;
    x: number;
    y: number;
    soundManager: SoundManager;
    onClick?: () => void;
}

export default class LevelButton extends Phaser.GameObjects.Sprite {
    props: ILevelButton;

    constructor(props: ILevelButton) {
        super(props.scene, props.x, props.y, 'button_level', 0);
        this.props = props;
        this.init();
    }

    init() {
        this.setScrollFactor(0)
            .setInteractive()
            .on(Phaser.Input.Events.POINTER_DOWN, () => {
                this.props.onClick?.();

                new Veil({
                    scene: this.props.scene,
                    camera: this.scene.cameras.main,
                    soundManager: this.props.soundManager,
                });
            });

        this.scene.add.existing(this);
    }
}
