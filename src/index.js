'use strict'

import Screen from "./engine/Screen.js"
import Player from "./Objects/Player.js"
import World from "./GameWorld/World.js"
import KeyStates from "./engine/KeyStates.js";
import { EventHandler } from "./engine/EventHandler.js";
import AssetsManager from "./engine/AssetsManager.js";
import Enemies from "./Objects/Enemies.js"
import Level from "./GameWorld/Level.js";

// Screen
const screen = new Screen(800, 600);
const renderer = screen.context;
screen.setBackground("black");

// Misc.
const player = new Player;
const keyStates = new KeyStates;
const enemies = new Enemies(screen);
const score = document.querySelector(".score");
const highscore = document.querySelector(".highscore");
const level = new Level(enemies);
const world = new World(screen, level);
let currentHighscore = highscore.innerHTML;
let pauseTime = 0;
let prevTime = 0;

const assets = new AssetsManager;
assets.addImg("../resources/images/ball.png");
assets.addImg("../resources/images/bomb.png");
assets.addImg("../resources/images/brick.png");
assets.addImg("../resources/images/radioactive.png");

// Elapsed time
// let prevTime = 0;
let elapsed = 0;
let isPaused = false;

let newGame = true;
let newLevel = false;
const stats = {
    accuracy: 0,
    damage: 0,
    update() {
        this.accuracy = player.shotsFired > 0 ? Math.round(100 * player.hits / player.shotsFired) : 0;
        
        let total = 0;
        for(let x = 0; x < screen.canvas.width; x++) {
            for(let y = 490; y < 570; y++) {
                if(!world.hasGround(x, y)){
                    total++;
                } 
            }
        }
        this.damage = Math.round( 100 * total / (80 * screen.canvas.width));
    }
}

const pauseGame = () => { 
    state = pauseLoop; 
    isPaused = true;
    pauseTime = Date.now();
    state();
}

const drawText = (text, size, position) => {
    renderer.font = `${size}px Arial`;
    const width = renderer.measureText(text).width;
    const center = Math.floor(400 - (width / 2));
    renderer.fillText(text, center, position);
}

const pauseLoop = (delta) => {
    renderer.beginPath();
    renderer.fillStyle = "black";
    renderer.fillRect(0, 0, 800, 600);
    
    renderer.fillStyle = "white"

    const position = 200;

    const currentLevel = `LEVEL ${level.no }`;
    const bombsRemaining = `-:  ${level.bombsOnLevel} BOMBS INCOMING  :-`;
    const info = "Press SPACE to play..."

    drawText(currentLevel, 40, position);
    drawText(bombsRemaining, 25, position + 40);
    drawText(info, 15, position + 70);

    if(!newGame) {
        const congrats = `Congratulations. You survived level ${level.no - 1}`
        const congrats2 = "Now, get ready for"
        const statsInfo = `YOUR STATS FOR LEVEL ${level.no - 1}:`
        const shotsFired = `Shots fired: ${ player.shotsFired }`;
        const accuracy = `Accuracy: ${ stats.accuracy }%`;
        const damage = `Territorial damage: ${stats.damage}%`;


        drawText(congrats, 15, position -60);
        drawText(congrats2, 15, position -40);

        drawText(statsInfo, 15, position + 120);
        drawText(accuracy, 15, position + 140);
        drawText(damage, 15, position + 160);

        drawText(shotsFired, 15, position + 180);
    }

    if(keyStates.inputs[" "] && Date.now() > pauseTime + 500) {
        isPaused = false;
        pauseTime = Date.now();
    }
    if(!isPaused) state = resume;
    window.requestAnimationFrame(state);
}

const resume = (delta) => {
    prevTime = delta;
    state = loop;
    newGame = true;
    if(newLevel) {
        newLevel = false;
        player.reset();
    }
    window.requestAnimationFrame(state);
}


// Event listeners
window.addEventListener("keydown", (e) => keyStates.inputOn(e));
window.addEventListener("keyup", (e) => keyStates.inputOff(e));
window.addEventListener("blur", () => pauseGame());

// window.addEventListener("focus", () => pauseGame());

const nextLevel = () => {
    stats.update();
    newLevel = true;
    newGame = false;
    level.next();
    state = pauseGame;
}


const loop = (delta) => {

    elapsed =  .00001 * (delta - prevTime);
    prevTime = delta;    

    if(world.gameOver) {
        state = prepareGameOver;
    }    
    else if(keyStates.inputs["p"] && Date.now() > pauseTime + 500) {
        state = pauseGame;
        pauseTime = Date.now();
    }    
    else {
        // Elapsed time


        // Update
        EventHandler(keyStates, player);
        level.update(elapsed, () => nextLevel());
        enemies.update(elapsed, world);
        player.update(elapsed, world, screen, enemies);

        // Render
        screen.clear();
        renderer.drawImage(world.canvas, 0, 0)
        player.render(renderer);
        enemies.render(renderer, world);

        score.innerHTML = player.score;
        if(player.score > currentHighscore) highscore.innerHTML = player.score;
        else highscore.innerHTML = currentHighscore;
    }

    window.requestAnimationFrame(state);
}

const prepareGameOver = (delta) =>  {
    elapsed =  .00001 * (delta - prevTime);
    prevTime = delta;
    const gameoverCanvas = document.createElement("canvas");
    gameoverCanvas.width = screen.canvas.width;
    gameoverCanvas.height = screen.canvas.height;
    gameoverCanvas.getContext("2d").drawImage(screen.canvas, 0, 0);
    state = gameOver2;
    window.requestAnimationFrame(delta => state(delta, gameoverCanvas, 8));
}
const gameOver2 = (delta, image, frame) => {
    elapsed =  .00001 * (delta - prevTime);
    prevTime = delta;
    frame -= elapsed * 500;
    if (frame < 0) state = gameOver;
    else {
        const ceiling = Math.ceil(frame);
        const direction = ceiling%2===0 ? 8 : 8;
        const position = (ceiling - frame) * direction;

        screen.clear();
        renderer.drawImage(image, position, 0, screen.canvas.width, screen.canvas.height);
    }
    window.requestAnimationFrame(delta => state(delta, image, frame));
}
const gameOver = () => {
    renderer.beginPath();
    renderer.fillStyle = "black";
    renderer.fillRect(0, 0, 800, 600);
    
    renderer.fillStyle = "white"

    const position = 270;

    const message = `GAME OVER!`;
    const finalScore = `FINAL SCORE:  ${player.score}`;
    if(player.score >= currentHighscore) {
        currentHighscore = player.score;
        highscore.innerHTML = player.score;
        const msg = "-: NEW HIGH SCORE !!! :-"
        drawText(msg, 15, position + 60);
    }
    const info = "Play again? ( Y / N )"
    const disclaimer = "(disclaimer: pressing N does absolutely nothing.)"

    drawText(message, 60, position);
    drawText(finalScore, 25, position + 40);

    drawText(info, 25, position + 100);

    drawText(disclaimer, 11, position + 125);


    if(keyStates.inputs["y"] && Date.now() > pauseTime + 500) {
        state = restart;
    }
    window.requestAnimationFrame(state);
}

let state = pauseGame;

const restart = () => {
    enemies.bombs = [];
    world.create();
    player.reset();
    player.score = 0;
    level.reset();
    world.reset();
    newGame = true;
    newLevel = false;
    pauseGame();
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
    const image = con.getImageData(0, 0, radius * 2, radius * 2);
    for(let x = 0; x < radius * 2; x++) {
        for(let y = 0; y < radius * 2; y++) {
            if(image.data[(y * radius * 2 + x) * 4] === 255) arr.push({x: x - radius, y: y - radius})
        }
    }
    return arr;
}

player.ball = createArray(10);
const start = () => {
    enemies.image = assets.images[1];
    player.image = assets.images[0];
    world.textures.push(assets.images[2]);
    world.textures.push(assets.images[3]);
    world.create();
    window.requestAnimationFrame(delta => state(delta))
}

assets.initialize(start);