import Phaser from 'phaser';


export interface Point extends Phaser.GameObjects.GameObject {
    x: number;
    y: number;
}

export type HazardType = 'common' | 'special';

export type Direction = 'left' | 'right' | 'up' | 'down';
