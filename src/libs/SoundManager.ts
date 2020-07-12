import Phaser from 'phaser';
import {VOLUME_KEY, DEFAULT_VOLUME_CONFIG} from '../constants/game';


const STEP_COOLDOWN = 300;

export interface ISoundManager {
    scene: Phaser.Scene;
    volumeConfig: {[key: string]: number};
    bgKey?: string;
}

export default class SoundManager {
    scene: Phaser.Scene;
    manager: Phaser.Sound.BaseSoundManager;
    bgKey = 'bg_1';
    volumeConfig: {[key: string]: number};
    lastStepTime = Date.now();
    bgMusicMuted: boolean;
    sfxMuted: boolean;

    constructor(props: ISoundManager) {
        this.scene = props.scene;
        this.manager = props.scene.sound;
        this.volumeConfig = props.volumeConfig;
        this.bgMusicMuted = this.volumeConfig[this.bgKey] === 0;
        this.sfxMuted = this.volumeConfig[VOLUME_KEY.JUMP] === 0;
    }

    playBGMusic() {
        const sound = this.manager.get(this.bgKey);

        if (sound) {
            sound.play();
        } else {
            this.manager.play(this.bgKey, {
                volume: 0.2,
                loop: true,
            });
        }
    }

    muteBGMusic() {
        // @ts-ignore
        this.manager.get(this.bgKey).volume = 0;
        this.volumeConfig[this.bgKey] = 0;
        this.bgMusicMuted = true;
    }

    unmuteBGMusic() {
        const sound = this.manager.get(this.bgKey);

        // @ts-ignore
        sound.volume = DEFAULT_VOLUME_CONFIG[this.bgKey];
        this.volumeConfig[this.bgKey] = DEFAULT_VOLUME_CONFIG[this.bgKey];
        this.bgMusicMuted = false;

        if (!sound.isPlaying) {
            sound.play();
        }
    }

    stopBGMusic() {
        this.manager.stopByKey(this.bgKey);
    }

    isBGMusicPlaying() {
        const sound = this.manager.get(this.bgKey);
        return sound?.isPlaying;
    }

    step() {
        const {STEP} = VOLUME_KEY;
        const now = Date.now();

        if (this.manager.get(VOLUME_KEY.STEP)?.isPlaying || now - this.lastStepTime < STEP_COOLDOWN) {
            return;
        }

        this.lastStepTime = now;
        this.manager.play(STEP, {volume: this.volumeConfig[STEP]});
    }

    jump() {
        // Between
        const index = Phaser.Math.Between(1, 8);
        const {JUMP} = VOLUME_KEY;
        this.manager.play(`jump${index}`, {volume: this.volumeConfig[JUMP]});
    }

    land() {
        const {LAND} = VOLUME_KEY;
        this.manager.play(LAND, {volume: this.volumeConfig[LAND]});
    }

    hit() {
        const {HIT} = VOLUME_KEY;
        this.manager.play(HIT, {volume: this.volumeConfig[HIT]});
    }

    die() {
        const {DIE} = VOLUME_KEY;
        this.manager.play(DIE, {volume: this.volumeConfig[DIE]});
    }

    jumper() {
        const {JUMPER} = VOLUME_KEY;
        this.manager.play(JUMPER, {volume: this.volumeConfig[JUMPER]});
    }

    gun() {
        const {GUN} = VOLUME_KEY;
        this.manager.play(GUN, {volume: this.volumeConfig[GUN]});
    }

    reflector() {
        const {REFLECTOR} = VOLUME_KEY;
        this.manager.play(REFLECTOR, {volume: this.volumeConfig[REFLECTOR]});
    }

    reflectorCollide() {
        const {REFLECTOR_COLLIDE} = VOLUME_KEY;
        this.manager.play(REFLECTOR_COLLIDE, {volume: this.volumeConfig[REFLECTOR_COLLIDE]});
    }

    lever() {
        const {LEVER} = VOLUME_KEY;
        this.manager.play(LEVER, {volume: this.volumeConfig[LEVER]});
    }

    steamSmall(x: number, y: number) {
        const {STEAM_SMALL} = VOLUME_KEY;
        const inViewport = this.scene.cameras.main.worldView.contains(x, y);

        if (!inViewport) {
            return;
        }

        this.manager.play(STEAM_SMALL, {volume: this.volumeConfig[STEAM_SMALL]});
    }

    steamBig(x: number, y: number) {
        const {STEAM_BIG} = VOLUME_KEY;
        const inViewport = this.scene.cameras.main.worldView.contains(x, y);

        if (!inViewport) {
            return;
        }

        this.manager.play(STEAM_BIG, {volume: this.volumeConfig[STEAM_BIG]});
    }

    sphere() {
        const {SPHERE} = VOLUME_KEY;
        this.manager.play(SPHERE, {volume: this.volumeConfig[SPHERE]});
    }

    muteSFX() {
        Object.keys(this.volumeConfig).forEach((key) => {
            if (key === this.bgKey) {
                return;
            }

            this.volumeConfig[key] = 0;
        });

        this.sfxMuted = true;
    }

    unmuteSFX() {
        Object.keys(this.volumeConfig).forEach((key) => {
            if (key === this.bgKey) {
                return;
            }

            this.volumeConfig[key] = DEFAULT_VOLUME_CONFIG[key];
        });

        this.sfxMuted = false;
    }
}
