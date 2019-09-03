import Screen from "./engine/Screen.js"
import Player from "./Objects/Player.js"
import World from "./GameWorld/World.js"
import KeyStates from "./KeyStates.js";
import { EventHandler } from "./Game.js";
import AssetsManager from "./engine/AssetsManager.js";

class Bomb {
    constructor(x, y, destruction) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.damageRadius = this.radius * destruction;
        this.velocity = 0;
        this.isDead = false;
        this.color="black";
    }
    kill() {
        this.isDead = true;
        this.velocity = 0;
        this.damageRadius /= 2;
    }

    update(elapsed, world) {
        if(this.isDead) {
            this.color = this.color==="white" ? "yellow" : "white"
            this.velocity += elapsed * 10;
            this.radius += this.velocity;
            
            if(this.radius > this.damageRadius) {
                world.filledCircle(this.x, Math.floor(this.y), this.damageRadius);
                return false;
            }
            return true;
        }

        this.velocity += elapsed * world.gravity
        const potentialY = this.y + this.velocity;
        if(world.hasGround(this.x, Math.floor(potentialY + this.radius))) {
            // this.damageRadius *= this.radius;
            this.isDead = true;
            this.velocity = 0;
            return true;
        }
        else if(potentialY + this.radius > screen.canvas.height) {            
            // this.damageRadius *= this.radius;            
            // world.filledCircle(this.x, screen.canvas.height, this.damageRadius);
            this.isDead = true;
            this.velocity = 0;
            return true;
        }
        else {
            this.y = potentialY;
            return true;            
        }
    }

    render(renderer, image) {
        if(!this.isDead) {
            renderer.drawImage(image, this.x - 10, this.y - 20)
        }
        else {
            renderer.beginPath();
            renderer.fillStyle = this.color;
            renderer.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            renderer.fill();
        }

    }
}

class Enemies {
    constructor(screen) {
        this.bombs = [];

        this.destruction = 4;

        this.image;

        this.timer = 2000;
        // setInterval(() => this.bombs.push(new Bomb(Math.floor(Math.random() * screen.canvas.width), 0)), 2000);

        this.go = () => {
            this.bombs.push(new Bomb(Math.floor(Math.random() * screen.canvas.width), -20, this.destruction));
            this.timer *= .99;
            setTimeout(() => this.go(), this.timer);
        }
        this.go();


    }
    update(elapsed, world) {
        for(let i = this.bombs.length - 1; i >= 0; i--) {
            if(!this.bombs[i].update(elapsed, world)) {
                this.bombs.splice(i, 1);
                // this.destruction *= 1.1;
            }
        }
    }
    render(renderer) {
        this.bombs.forEach(bomb => {
            bomb.render(renderer, this.image);
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

const assets = new AssetsManager;
assets.addImg("./ball.png");
assets.addImg("./bomb.png");
assets.addImg("./brick.png");

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
// console.log(assets.images);
const start = () => {
    // console.log("hi")
    enemies.image = assets.images[1];
    player.image = assets.images[0];
    world.texture = assets.images[2];
    world.create();
    window.requestAnimationFrame(delta => loop(delta))
}

// console.log(player.ball);
assets.initialize(start);