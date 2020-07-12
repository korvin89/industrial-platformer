import Phaser from 'phaser';
import {IStaticGameConfig} from './typings/common';


interface IGameConfig extends Phaser.Types.Core.GameConfig {
    pixelArt: boolean;
}

export const getGameConfig = (
    staticConfig: IStaticGameConfig,
    scene: object[],
): IGameConfig => {
    return {
        ...staticConfig,
        scene,
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        physics: {
            default: 'arcade',
            arcade: {
                debug: false,
                gravity: {y: 1000},
            },
        },
        input: {
            gamepad: true,
        },
        parent: document.getElementById('app'),
        backgroundColor: '#1d212d',
        pixelArt: true,
        callbacks: {
            preBoot: (game) => {
                if (game.device.input.touch) {
                    document.body.classList.add('touch');
                }
            },
        },
    };
};
