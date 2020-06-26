import Phaser from 'phaser';
import {ACTION_COOLDOWN} from '../../constants/game';


export interface IHidingPlatform {
    scene: Phaser.Scene;
    tilemap: Phaser.Tilemaps.DynamicTilemapLayer;
    x: number;
    y: number;
    initialVisibility?: boolean;
}

export default class HidingPlatform extends Phaser.GameObjects.Sprite {
    props: IHidingPlatform;;
    lastSwitchTime = Date.now();
    shown: boolean;

    constructor(props: IHidingPlatform) {
        super(props.scene, props.x, props.y, 'hiding_platform', 3);
        this.props = props;
        this.createAnimations();
        this.init();
    }

    createAnimations() {
        this.scene.anims.create({
            key: 'platform-hide',
            frames: this.scene.anims.generateFrameNumbers('hiding_platform', {start: 0, end: 3}),
            frameRate: 12,
        });

        this.scene.anims.create({
            key: 'platform-show',
            frames: this.scene.anims.generateFrameNumbers('hiding_platform', {start: 3, end: 0}),
            frameRate: 12,
        });
    }

    init() {
        const {initialVisibility = false} = this.props;

        this.shown = initialVisibility;
        this.scene.add.existing(this);
    }

    switch() {
        const now = Date.now();

        if (!this.scene || now - this.lastSwitchTime < ACTION_COOLDOWN) {
            return;
        }

        const nextAnimation = this.shown ? 'platform-hide' : 'platform-show';
        this.lastSwitchTime = now;
        this.shown = !this.shown;

        if (!this.shown) {
            this.props.tilemap.removeTileAtWorldXY(this.x, this.y);
        }

        this.play(nextAnimation);

        this.on(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
            if (this.shown) {
                this.props.tilemap
                    .putTileAtWorldXY(353, this.x, this.y)
                    .setCollision(true);
            }
        });
    }
}
