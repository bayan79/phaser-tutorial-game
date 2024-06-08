import {AUTO, Game, Types} from 'phaser'

import HelloWorldScene from './HelloWorldScene'

const config: Types.Core.GameConfig = {
    type: AUTO,
    parent: 'app',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {x: 0, y: 900 },
            debug: true,
        },
    },
    scene: [HelloWorldScene],
}

export default new Game(config)
