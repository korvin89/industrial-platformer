import Phaser from 'phaser';
import ActionButton from './UI/ActionButton';
import SoundManager from '../libs/SoundManager';
import {ACTION_COOLDOWN} from '../constants/game';


interface IKeys {
    [key: string]: {isDown: boolean};
}

export interface IPlayer {
    scene: Phaser.Scene;
    x: number;
    y: number;
    soundManager: SoundManager;
}

export default class Player {
    scene: Phaser.Scene;
    soundManager: SoundManager;
    sprite: Phaser.GameObjects.Sprite;
    flash: Phaser.GameObjects.Sprite;
    keys: IKeys | null = null;
    leftBtn: ActionButton | null = null;
    rightBtn: ActionButton | null = null;
    upBtn: ActionButton | null = null;
    hitBtn: ActionButton | null = null;
    lastHitTime = Date.now();

    constructor(props: IPlayer) {
        this.scene = props.scene;
        this.soundManager = props.soundManager;
        this.createAnimations();
        this.createControls();
        this.createSprite(props.x, props.y);
    }

    createAnimations() {
        const {anims} = this.scene;

        anims.create({
            key: 'player-idle',
            frames: anims.generateFrameNumbers('player', {start: 0, end: 3}),
            frameRate: 4,
            repeat: -1,
        });
        anims.create({
            key: 'player-run',
            frames: anims.generateFrameNumbers('player', {start: 8, end: 15}),
            frameRate: 12,
            repeat: -1,
        });
        anims.create({
            key: 'player-land',
            frames: anims.generateFrameNumbers('player', {start: 4, end: 7}),
            frameRate: 12,
        });
        anims.create({
            key: 'player-hit',
            frames: anims.generateFrameNumbers('player', {start: 24, end: 27}),
            frameRate: 14,
        });
        anims.create({
            key: 'player-flash',
            frames: anims.generateFrameNumbers('player_flash', {start: 0, end: 3}),
            frameRate: 14,
            hideOnComplete: true,
        });
    }

    createControls() {
        if (this.scene.sys.game.device.input.touch) {
            this.scene.input.addPointer(4);

            this.leftBtn = new ActionButton({
                scene: this.scene,
                x: 48,
                y: this.scene.cameras.main.height - 48,
                type: 'left',
            });

            this.rightBtn = new ActionButton({
                scene: this.scene,
                x: 118,
                y: this.scene.cameras.main.height - 48,
                type: 'right',
            });

            this.hitBtn = new ActionButton({
                scene: this.scene,
                x: this.scene.cameras.main.width - 48,
                y: this.scene.cameras.main.height - 48,
                type: 'hit',
            });

            this.upBtn = new ActionButton({
                scene: this.scene,
                x: this.scene.cameras.main.width - 48,
                y: this.scene.cameras.main.height - 122,
                type: 'up',
            });
        } else {
            const {SPACE, LEFT, RIGHT, UP, W, A, D} = Phaser.Input.Keyboard.KeyCodes;

            this.keys = this.scene.input.keyboard.addKeys({
                space: SPACE,
                left: LEFT,
                right: RIGHT,
                up: UP,
                w: W,
                a: A,
                d: D,
            }) as IKeys;
        }
    }

    createSprite(x: number, y: number) {
        this.sprite = this.scene.physics.add
            .sprite(x, y, 'player', 0)
            .setDrag(1000, 0)
            .setMaxVelocity(200, 1000)
            .setSize(18, 24)
            .setOffset(7, 9)
            .setDepth(2);
    }

    createFlash() {
        this.flash = this.scene.add
            .sprite(this.sprite.x, this.sprite.y, 'player_flash', 0)
            .setFlipX(this.sprite.flipX)
            .play('player-flash', true)
            .on(Phaser.Animations.Events.SPRITE_ANIMATION_COMPLETE, () => {
                this.flash.destroy();
            });

        this.flash.x += this.sprite.flipX
            ? -this.flash.width / 2 - this.sprite.width / 2
            : this.flash.width / 2 + this.sprite.width / 2;

        this.scene.physics.add.existing(this.flash);

        this.flash.body.enable = false;
        this.flash.body
            .setMaxVelocity(0, 0)
            .setSize(48, 32);

        setTimeout(() => {
            this.flash.body.enable = true;
        }, 0);
    }

    hit() {
        if (this.flash?.anims?.isPlaying) {
            return;
        }

        this.createFlash();
        this.soundManager.hit();
    }

    freeze() {
        this.sprite.body.moves = false;
    }

    // eslint-disable-next-line complexity
    update() {
        const {keys, sprite} = this;

        const now = Date.now();
        const onGround = sprite.body.blocked.down;
        const acceleration = onGround ? 400 : 200;
        const left = keys?.left.isDown || keys?.a.isDown || this.leftBtn?.pressed;
        const right = keys?.right.isDown || keys?.d.isDown || this.rightBtn?.pressed;
        const up = keys?.up.isDown || keys?.w.isDown || this.upBtn?.pressed;
        const hit = keys?.space.isDown || this.hitBtn?.pressed;

        if (left) {
            sprite.setAccelerationX(-acceleration);
            sprite.setFlipX(true);

            if (onGround && !sprite.body.blocked.left) {
                this.soundManager.step();
            }
        } else if (right) {
            sprite.setAccelerationX(acceleration);
            sprite.setFlipX(false);

            if (onGround && !sprite.body.blocked.right) {
                this.soundManager.step();
            }
        } else {
            sprite.setAccelerationX(0);
        }

        if (onGround && up) {
            this.soundManager.jump();
            sprite.setVelocityY(-400);
        }

        if (hit && now - this.lastHitTime >= ACTION_COOLDOWN) {
            sprite.anims.play('player-hit', true);
            this.lastHitTime = now;
            this.hit();
        }

        if (sprite.anims.isPlaying && sprite.anims.currentAnim?.key === 'player-hit') {
            return;
        }

        // вместо 0.3 должен быть 0, надо разобраться
        if (sprite.body.deltaY() > 0.3 && onGround) {
            sprite.anims.play('player-land', true);
            this.soundManager.land();
        }

        if (sprite.anims.isPlaying && sprite.anims.currentAnim?.key === 'player-land') {
            return;
        }

        if (onGround && sprite.body.velocity.x === 0) {
            sprite.anims.play('player-idle', true);
        } else if (onGround) {
            sprite.anims.play('player-run', true);
        } else {
            sprite.anims.stop();
            sprite.setTexture('player', 10);
        }
    }

    destroy() {
        this.sprite.destroy();
    }
}
