import Phaser from 'phaser';


export interface ISphere {
    scene: Phaser.Scene;
    x: number;
    y: number;
    onEnter: () => void;
}

export default class Sphere extends Phaser.GameObjects.Sprite {
    props: ISphere;

    constructor(props: ISphere) {
        super(props.scene, props.x, props.y, 'sphere', 6);
        this.props = props;
        this.init();
    }

    init() {
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setMaxVelocity(0, 0);
    }

    activate() {
        this.props.onEnter();
    }
}
