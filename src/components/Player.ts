import Phaser from 'phaser';
// @ts-ignore
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
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
    keys: IKeys;
    joystick: VirtualJoystick | null = null;
    flashBtn: Phaser.GameObjects.Arc;
    flashBtnPressed = false;
    lastFlashTime = Date.now();
    inJump = false;

    constructor(props: IPlayer) {
        this.scene = props.scene;
        this.soundManager = props.soundManager;

        this.createAnimations();
        this.createKeys();
        this.createSprite(props.x, props.y);

        if (this.scene.sys.game.device.input.touch) {
            this.createJoystick();

            const x = this.scene.cameras.main.width - 57;
            const y = this.scene.cameras.main.height - 75;
            this.flashBtn = this.scene.add.circle(x, y, 25, 0xffffff)
                .setAlpha(0.25)
                .setDepth(20)
                .setScrollFactor(0);

            this.flashBtn.setInteractive()
                .on(Phaser.Input.Events.POINTER_DOWN, () => {
                    this.flashBtn.setAlpha(0.5);
                    this.flashBtnPressed = true;
                })
                .on(Phaser.Input.Events.POINTER_UP, () => {
                    this.flashBtn.setAlpha(0.25);
                    this.flashBtnPressed = false;
                });
        }
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

    createKeys() {
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

    createJoystick() {
        this.joystick = new VirtualJoystick(this.scene, {
            x: 82,
            y: 334,
            radius: 50,
            base: this.scene.add.circle(0, 0, 50, 0x4d5762, 0.5).setDepth(20),
            thumb: this.scene.add.circle(0, 0, 25, 0xffffff, 0.25).setDepth(20),
            dir: '8dir',
            // forceMin: 16,
            // enable: true
        });
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
        const onGround = sprite.body.blocked.down;
        const acceleration = onGround ? 400 : 200;
        const now = Date.now();

        const left = keys.left.isDown || keys.a.isDown || this.joystick?.left;
        const right = keys.right.isDown || keys.d.isDown || this.joystick?.right;
        const up = keys.up.isDown || keys.w.isDown || this.joystick?.up;

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

        if ((keys.space.isDown || this.flashBtnPressed) && now - this.lastFlashTime >= ACTION_COOLDOWN) {
            sprite.anims.play('player-hit', true);
            this.lastFlashTime = now;
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
