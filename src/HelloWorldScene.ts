import {Scene as Phaser_Scene} from "phaser"

export default class HelloWorldScene extends Phaser_Scene {
    private platforms?: Phaser.Physics.Arcade.StaticGroup
    private player?: Phaser.Physics.Arcade.Sprite
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

    private stars?: Phaser.Physics.Arcade.Group
    private bombs?: Phaser.Physics.Arcade.Group

    private dashSpeed: number = 0
    private noDash?: boolean = false
    private noJump?: boolean = false
    private gameOver: boolean = false
    private score = 0
    private scoreText?: Phaser.GameObjects.Text

    constructor() {
        super('hello-world')
    }

    preload() {
        this.load.image('sky', 'assets/sky.png')
        this.load.image('ground', 'assets/platform.png')
        this.load.image('star', 'assets/star.png')
        this.load.image('bomb', 'assets/bomb.png')
        this.load.spritesheet('dude', 'assets/dude.png', {
            frameWidth: 32, frameHeight: 48,
        })
    }

    create() {
        this.add.image(400, 300, 'sky')
        this.add.image(400, 300, 'star')

        this.platforms = this.physics.add.staticGroup()
        const ground = this.platforms.create(400, 568, 'ground') as Phaser.Physics.Arcade.Image
        ground.setScale(2).refreshBody()
        this.platforms.create(600, 400, 'ground')
        this.platforms.create(50, 250, 'ground')
        this.platforms.create(750, 220, 'ground')

        this.player = this.physics.add.sprite(100, 450, 'dude')
        this.player.setCollideWorldBounds(true)

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', {
                start: 0, end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        })
        this.anims.create({
            key: 'turn',
            frames: [{key: 'dude', frame: 4}],
            frameRate: 20,
        })
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', {
                start: 5, end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        })


        this.physics.add.collider(this.player, this.platforms)

        this.cursors = this.input.keyboard?.createCursorKeys()

        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11, 
            setXY: {x: 12, y: 0, stepX: 70},
        })

        this.stars.children.iterate(
            (c) => {
                const child = c as Phaser.Physics.Arcade.Image
                child.setBounceY(Phaser.Math.FloatBetween(0.5, 0.9))
                return true
            },
        )
        this.physics.add.collider(this.stars, this.platforms)
        this.physics.add.overlap(this.player, this.stars, this.handlerCollectStar, undefined, this)
        this.scoreText = this.add.text(16, 16, "score: 0", {
            fontSize: '32px',
            color: '#000',
        })


        this.bombs = this.physics.add.group()
        this.physics.add.overlap(this.player, this.bombs, this.handlerHitBomb, undefined, this)

        this.physics.add.collider(this.bombs, this.platforms)
        this.physics.add.collider(this.player, this.bombs)

        // this.bombs.children.iterate(
        //     (c) => {
        //         const child = c as Phaser.Physics.Arcade.Image
        //         child.setBounceY(Phaser.Math.FloatBetween(0.5, 0.9))
        //         return true
        //     },
        // )
    }
    private handlerHitBomb(_player: any, _b: any){
        this.physics.pause()
        this.player?.setTint(0xff0000)
        this.player?.anims.play('turn')

        this.gameOver = true
    }

    private handlerCollectStar(_player: any, s: any){
        const star = s as Phaser.Physics.Arcade.Image
        star.disableBody(true, true)    

        this.score += 1
        this.scoreText?.setText(`Score: ${this.score}`)

        if (this.stars?.countActive(true)==0){
            this.stars.children.iterate(c => {
                const child = c as Phaser.Physics.Arcade.Image
                child.enableBody(true, child.x, 0, true, true)
                return true
            })

            if (this.player) {
                const x = this.player.x < 400
                    ? Phaser.Math.Between(400, 800)
                    : Phaser.Math.Between(0, 400)

                const bomb = this.bombs?.create(x, 16, 'bomb')

                bomb.setBounce(1)
                bomb.setCollideWorldBounds(true)
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
            }

        }
    }

    update(): void {
        const is_left = this.cursors?.left.isDown
        const is_right = this.cursors?.right.isDown

        if (this.cursors?.shift.isDown && this.dashSpeed == 0 && this.noDash == false){
            if (is_left) this.dashSpeed = -800
            if (is_right) this.dashSpeed = 800
            this.noDash = true
            this.time.addEvent({
                delay: 120,
                callback: () => {
                    this.dashSpeed = 0
                },
                callbackScope: this,
            })
        }

        if (this.noJump == true && this.player?.body?.touching.down) {
            this.noJump = undefined
            this.time.addEvent({
                delay: 200,
                callback: () => {
                    this.noJump = false
                },
                callbackScope: this,
            })
        }

        if (this.dashSpeed){
            this.player?.setVelocityX(this.dashSpeed)
            this.player?.setVelocityY(0)
            return
        }

        if (this.player?.body?.touching.down && this.noDash) {
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.noDash = false
                },
                callbackScope: this,
            })
            this.noDash = undefined
        }

        if (is_left) {
            this.player?.setVelocityX(-200)
            this.player?.anims.play('left', true)
        }
        else if (is_right) {
            this.player?.setVelocityX(200)
            this.player?.anims.play('right', true)
        }
        else {
            this.player?.setVelocityX(0)
            this.player?.anims.play('turn')                  
        }

        if (this.cursors?.up.isDown && this.player?.body?.touching.down && this.noJump == false){
            this.noJump = true
            this.player.setVelocityY(-555)
        }


        if (this.cursors?.space.isDown && this.gameOver)
        {
            this.scene.restart()
            this.score = 0
        }
    }
}
