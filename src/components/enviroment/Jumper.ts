import Phaser from 'phaser';
import SoundManager from '../../libs/SoundManager';
import {ACTION_COOLDOWN} from '../../constants/game';


export interface IJumper {
    scene: Phaser.Scene;
    soundManager: SoundManager;
    tile: Phaser.Tilemaps.Tile;
    x: number;
    y: number;
    id?: string;
}

export default class Jumper extends Phaser.GameObjects.Sprite {
    props: IJumper;
    id: string;
    lastSwitchTime = Date.now();
    opened = false;

    constructor(props: IJumper) {
        super(props.scene, props.x, props.y, 'jumper_opened');
        this.props = props;
        this.id = props.id;
        this.init();
    }

    init() {
        this.visible = false;
        this.y -= 16;
        this.scene.physics.add.existing(this);
        this.body.enable = true;
        this.body.setMaxVelocity(0, 0);
        this.body.setSize(28, 2);
        this.body.setOffset(2, 31);
        this.scene.add.existing(this);
    }

    toggleView = () => {
        if (this.opened) {
            this.props.tile.visible = false;
            this.visible = true;
        } else {
            this.props.tile.visible = true;
            this.visible = false;
        }
    };

    switch() {
        const now = Date.now();

        if (now - this.lastSwitchTime < ACTION_COOLDOWN) {
            return;
        }

        this.opened = !this.opened;
        this.lastSwitchTime = now;
        this.toggleView();
        setTimeout(() => {
            this.opened = !this.opened;
            this.toggleView();
        }, ACTION_COOLDOWN);

        this.props.soundManager.jumper();
    }
}
