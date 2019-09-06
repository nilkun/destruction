class Bullet {
    constructor(x, y, xVel, yVel) {
        this.x = x;
        this.y = y;
        this.xVel = xVel;
        this.yVel = yVel;
        this.speed = 45000;
    }
    update(elapsed, enemies, world, player) {
        const bombs = enemies.bombs;
        let oldX = this.x;
        let oldY = this.y;
        this.x += this.xVel * elapsed * this.speed;
        this.y += this.yVel * elapsed * this.speed;
        const difficulty = 5;
        for(let i = 0; i < bombs.length; i++) {
            const x = this.x - bombs[i].x;
            const y = this.y - bombs[i].y;
            const r = 2 + bombs[i].radius + difficulty;
            if(!bombs[i].isDead && r * r > x * x + y * y) {
                bombs[i].kill();
                player.score += bombs[i].value;
                return false;
            }
        }
        if(world.hasGround(Math.floor(this.x), Math.floor(this.y))) {
            oldX += (this.x - oldX) / 2;
            oldY += (this.y - oldY) / 2;
            world.filledCircle(Math.floor(oldX), Math.floor(oldY), 5);
            return false;
        } 
        return true;
    }

    render(renderer) {
        renderer.beginPath();
        renderer.fillStyle = "red";
        renderer.arc(this.x, this.y, 2, 0, 2 * Math.PI);
        renderer.fill();
    }
}

export default class Player {
    constructor() {
        this.x = 400;
        this.y = 475;
        this.angle = 0.5 * Math.PI;
        this.xVel = 0;
        this.yVel = 0;
        this.isJumping = false;
        this.bullets = [];
        this.sin = 0;
        this.cos = 0;
        this.coolDown = 0;
        this.prevY = 0;
        this.maxSpeed = 14000;
        this.image;
        this.score = 0;

        this.collideScore = 50;

        this.rocketCooldown = 0;

        this.barrelLength = 15;
        this.barrelWidth = 3;
        this.radius = 10;
        this.ball = [];

        this.bulletCost = 1;

        this.shotsFired = 0;
        this.hits = 0;
    }

    reset() {
        this.shotsFired = 0;
        this.hits = 0;
        this.xVel = 0;
        this.yVel = 0;
        this.x = 400;
        this.y = 475;
        this.bullets = [];
    }
    moveTurret(right) {
        const movement = .07;
        if(!right) {
            this.angle -= movement;
            if(this.angle <= -.5 * Math.PI) this.angle = -.5 * Math.PI;
        } 
        else if(right) {
            this.angle += movement;
            if(this.angle >= .5 * Math.PI) this.angle = .5 * Math.PI;
        } 
    }

    move(right) {
        const acceleration = 700;
        if(right) {
            this.xVel += acceleration;
            if(this.xVel > this.maxSpeed) this.xVel = this.maxSpeed;
        }
        else if(!right) {
            this.xVel -= acceleration;
            if(this.xVel < -this.maxSpeed) this.xVel = -this.maxSpeed;
        }
    }

    collide(x, y, r) {
        return r * r > x*x + y*y;
    }
    update(elapsed, world, screen, enemies) {

        this.yVel += world.gravity * elapsed;
        const potentialY = this.y + this.yVel * elapsed;
        
        let potentialX = this.x + this.xVel * elapsed;

        if(potentialX > screen.canvas.width) potentialX -= screen.canvas.width;
        else if(potentialX < 0) potentialX += screen.canvas.width;

        // console.log("Where is y: ", this.y);
        // Check collision
        let ok = true;
        for(let i = 0; i < this.ball.length; i++) {
            if(world.hasGround(Math.floor(potentialX + this.ball[i].x), Math.floor(this.y + this.ball[i].y))) {
                ok = false;
                this.xVel = 0;
                break;
            }
        }

        if(ok) {
            this.x = potentialX;            
        }

        ok = true;
        for(let i = 0; i < this.ball.length; i++) {
            if(world.hasGround(Math.floor(this.x + this.ball[i].x), Math.floor(potentialY + this.ball[i].y))) {
                ok = false;                
                // if(this.yVel < 8) {
                    this.yVel = -9000;
                    // this.isJumping = false;
                // }
                // else {
                //     this.yVel = -this.yVel * .5;
                //     console.log("halved", this.yVel);
                // } 
                
                break;
            }
        }
        if(ok) {
            this.y = potentialY;            
        }

        // Update bullets
        for(let i = this.bullets.length - 1; i >= 0; i--) {
            if(!this.bullets[i].update(elapsed, enemies, world, this)) {
                this.bullets.splice(i, 1);
                this.hits++;
            };
        }

        // Collision with bombs
        for(let i = enemies.bombs.length - 1; i >= 0; i--) {
            const dirX = this.x - enemies.bombs[i].x;
            const dirY = this.y - enemies.bombs[i].y
            if(enemies.bombs[i].canHurt && this.collide(dirX, dirY, this.radius + enemies.bombs[i].radius)) {
                enemies.bombs[i].canHurt = false;
                if(!enemies.bombs[i].isDead) {
                    enemies.bombs[i].kill();
                    this.score += this.collideScore;
                }
                this.xVel = 700 * (10 + 20 / dirX);
                this.yVel = 700 * (10 + 20 / dirY);
            };
        }
    }    
    
    fire() {
        const time = Date.now();
        if(time - this.coolDown < 150) {}
        else {
            this.coolDown = time;
            this.bullets.push(new Bullet(this.x + this.sin * this.barrelLength, this.y - this.cos * this.barrelLength, this.sin, -this.cos));
            this.score -= this.bulletCost;
            this.shotsFired++;
        }             
    }

    render(renderer) {        

        // Render bullets
        this.bullets.forEach(bullet => {
            bullet.render(renderer);
        });

        renderer.beginPath();
        renderer.fillStyle = "#619C67";
        this.sin = Math.sin(this.angle);
        this.cos = Math.cos(this.angle);

        const x1 = this.barrelLength * this.sin;
        const y1 = -this.barrelLength * this.cos;
        const x2 = this.barrelWidth * this.cos;
        const y2 = -this.barrelWidth * this.sin;        
        
        // Render barrel
        renderer.moveTo(this.x + x2, this.y - y2);
        renderer.lineTo(this.x + x2 + x1, this.y - y2 + y1);
        renderer.lineTo(this.x - x2 + x1, this.y + y2 + y1);        
        renderer.lineTo(this.x - x2, this.y + y2);
        renderer.lineTo(this.x + x2, this.y - y2);
        renderer.fill();

        renderer.drawImage(this.image, this.x - 10, this.y - 10)
    }
}