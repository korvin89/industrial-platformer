import Phaser from 'phaser';


export interface IMouseTileMarker {
    scene: Phaser.Scene;
    tilemap: Phaser.Tilemaps.Tilemap;
}

export default class MouseTileMarker {
    props: IMouseTileMarker;
    graphics: Phaser.GameObjects.Graphics;

    constructor(props: IMouseTileMarker) {
        this.props = props;

        this.graphics = props.scene.add.graphics();
        this.graphics.lineStyle(5, 0xffffff, 1);
        this.graphics.strokeRect(0, 0, props.tilemap.tileWidth, props.tilemap.tileHeight);
        this.graphics.lineStyle(3, 0xff4f78, 1);
        this.graphics.strokeRect(0, 0, props.tilemap.tileWidth, props.tilemap.tileHeight);
    }

    update(visible: boolean) {
        const pointer = this.props.scene.input.activePointer;
        const worldPoint = pointer.positionToCamera(this.props.scene.cameras.main);
        const pointerTileXY = this.props.tilemap.worldToTileXY(worldPoint.x, worldPoint.y);
        const snappedWorldPoint = this.props.tilemap.tileToWorldXY(pointerTileXY.x, pointerTileXY.y);
        this.graphics.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);
        this.graphics.visible = visible;
    }

    destroy() {
        this.graphics.destroy();
    }
}
