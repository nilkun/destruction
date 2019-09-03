import Screen from "./engine/Screen.js"
import Player from "./Objects/Player.js"
import World from "./GameWorld/World.js"
import KeyStates from "./KeyStates.js";
import { EventHandler } from "./Game.js";

class Bomb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.damageRadius = 3;
        this.velocity = 0;
    }

    update(elapsed, world) {
        this.velocity += elapsed * world.gravity
        const potentialY = this.y + this.velocity;

        if(world.hasGround(this.x, Math.floor(potentialY + this.radius))) {
            world.filledCircle(this.x, Math.floor(potentialY + this.radius), this.radius * this.damageRadius);
            return false;
        }
        else if(potentialY + this.radius > screen.canvas.height) {            
            world.filledCircle(this.x, screen.canvas.height, this.radius * this.damageRadius);
            return false;
        }
        else {
            this.y = potentialY;
            return true;            
        }
    }
    render(renderer) {
        renderer.beginPath();
        renderer.fillStyle = "black";
        renderer.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        renderer.fill();
    }
}

class Enemies {
    constructor(screen) {
        this.bombs = [];
        setInterval(() => this.bombs.push(new Bomb(Math.floor(Math.random() * screen.canvas.width), 0)), 2000);
    }
    update(elapsed, world) {
        for(let i = this.bombs.length - 1; i >= 0; i--) {
            if(!this.bombs[i].update(elapsed, world)) this.bombs.splice(i, 1);
        }
    }
    render(renderer) {
        this.bombs.forEach(bomb => {
            bomb.render(renderer);
        })
    }
}

// Screen
const screen = new Screen(800, 400);
const renderer = screen.context;

// Misc.
const world = new World(screen);
const player = new Player;
const keyStates = new KeyStates;
const enemies = new Enemies(screen);

// Elapsed time
let prevTime = 0;
let elapsed = 0;

// Event listeners
window.addEventListener("keydown", (e) => keyStates.inputOn(e));
window.addEventListener("keyup", (e) => keyStates.inputOff(e));

const loop = (delta) => {
    
    // Elapsed time
    elapsed = .001 * (delta - prevTime);
    prevTime = delta;

    // Update
    EventHandler(keyStates, player);
    enemies.update(elapsed, world);
    player.update(elapsed, world, screen, enemies);

    // Render
    screen.clear();
    renderer.drawImage(world.canvas, 0, 0)
    player.render(renderer);
    enemies.render(renderer);

    window.requestAnimationFrame(loop);
}


const createArray = (radius) => {
    const arr = [];
    const c = document.createElement("canvas");
    c.width = radius * 2;
    c.height = radius * 2;
    const con = c.getContext("2d");
    con.fillStyle = "red";
    con.arc(radius, radius, radius, 0, Math.PI * 2);
    con.fill();
    // renderer.drawImage(c, 60, 60);
    const image = con.getImageData(0, 0, radius * 2, radius * 2);
    for(let x = 0; x < radius * 2; x++) {
        for(let y = 0; y < radius * 2; y++) {
            if(image.data[(y * radius * 2 + x) * 4] === 255) arr.push({x: x - radius, y: y - radius})
        }
    }
    return arr;
}

player.ball = createArray(10);

// console.log(player.ball);
window.requestAnimationFrame(delta => loop(delta));