import {Scene} from 'phaser';
import TumblerButton from '../components/UI/TumblerButton';
import LevelButton from '../components/UI/LevelButton';
import SoundManager from './SoundManager';
import {Direction, Point} from '../typings/game';


// Не рассматриваем диагональные направления
export const getDirection = (p1: Point, p2: Point): Direction => {
    if (p1.x !== p2.x) {
        return p1.x > p2.x ? 'left' : 'right';
    }

    return p1.y > p2.y ? 'down' : 'up';
};

export const getSceneKeys = ({scene}: Scene): string[] => {
    return scene.manager.scenes.map(({sys}) => sys.config).slice(1);
};

export const createUIControls = (scene: Scene, soundManager: SoundManager) => {
    const {bgMusicMuted, sfxMuted} = soundManager;

    new TumblerButton({
        scene,
        texture: 'button_music',
        x: scene.cameras.main.width - 32,
        y: 32,
        switchedOn: !bgMusicMuted,
        onSwitchOn: () => {
            soundManager.unmuteBGMusic();
        },
        onSwitchOff: () => {
            soundManager.muteBGMusic();
        },
    });

    new TumblerButton({
        scene,
        texture: 'button_sfx',
        x: scene.cameras.main.width - 32,
        y: 74,
        switchedOn: !sfxMuted,
        onSwitchOn: () => {
            soundManager.unmuteSFX();
        },
        onSwitchOff: () => {
            soundManager.muteSFX();
        },
    });

    new LevelButton({
        scene,
        x: scene.cameras.main.width - 32,
        y: 116,
        soundManager: soundManager,
    });
};
