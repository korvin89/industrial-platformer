export const ACTION_COOLDOWN = 500;

export const UI_ALPHA = 0.25;
export const UI_ALPHA_ACTIVE = 0.5;

export const VOLUME_KEY = {
    STEP: 'step',
    JUMP: 'jump',
    LAND: 'land',
    HIT: 'hit',
    DIE: 'die',
    JUMPER: 'jumper',
    GUN: 'gun',
    REFLECTOR: 'reflector',
    REFLECTOR_COLLIDE: 'reflector_collide',
    LEVER: 'lever',
    SPHERE: 'sphere',
};

export const DEFAULT_VOLUME_CONFIG: {[key: string]: number} = {
    'bg_1': 0.2,
    [VOLUME_KEY.STEP]: 0.5,
    [VOLUME_KEY.JUMP]: 0.5,
    [VOLUME_KEY.LAND]: 0.4,
    [VOLUME_KEY.HIT]: 0.3,
    [VOLUME_KEY.DIE]: 0.5,
    [VOLUME_KEY.JUMPER]: 0.4,
    [VOLUME_KEY.GUN]: 0.4,
    [VOLUME_KEY.REFLECTOR]: 0.5,
    [VOLUME_KEY.REFLECTOR_COLLIDE]: 0.5,
    [VOLUME_KEY.LEVER]: 0.4,
    [VOLUME_KEY.SPHERE]: 0.5,
};
