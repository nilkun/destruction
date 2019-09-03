class Bullet {
    constructor(x, y, xVel, yVel) {
        this.x = x;
        this.y = y;
        this.xVel = xVel;
        this.yVel = yVel;
        this.speed = 200;
    }
    update(elapsed, enemies) {
        const bombs = enemies.bombs;
        // console.log(bombs)
        this.x += this.xVel * elapsed * this.speed;
        this.y += this.yVel * elapsed * this.speed;
        
        for(let i = 0; i < bombs.length; i++) {
            const x = this.x - bombs[i].x;
            const y = this.y - bombs[i].y;
            const r = 2 + bombs[i].radius;
            // console.log(r)
            if(r * r > x * x + y * y) {
                bombs.splice(i, 1);
                break;
            }
        }
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
        this.y = 100;
        this.angle = 0.5 * Math.PI;
        this.xVel = 0;
        this.yVel = 0;
        this.isJumping = false;
        this.bullets = [];
        this.sin = 0;
        this.cos = 0;
        this.coolDown = 0;
        this.prevY = 0;
        this.maxSpeed = 100;

        this.barrelLength = 15;
        this.barrelWidth = 3;
        this.radius = 10;
        this.ball = [];
    }

    moveTurret(right) {
        const movement = .05;
        if(!right) {
            this.angle -= movement;
            if(this.angle <= -0.5 * Math.PI) this.angle = -.5 * Math.PI;
        } 
        else if(right) {
            this.angle += movement;
            if(this.angle >= .5 * Math.PI) this.angle = .5 * Math.PI;
        } 
    }

    move(right) {
        if(right) {
            this.xVel++;
            if(this.xVel > this.maxSpeed) this.xVel = this.maxSpeed;
        }
        else if(!right) {
            this.xVel--;
            if(this.xVel < -this.maxSpeed) this.xVel = -this.maxSpeed;
        }
    }

    jump() {
        if(!this.isJumping) {
            this.yVel = -1;
            this.isJumping = true;
        }
        else console.log("NO JUMPING")
    }

    update(elapsed, world, screen, enemies) {
    
        // Do Y first
        this.yVel += world.gravity * elapsed;
        const potentialY = this.y + this.yVel;
        let potentialX = this.x + this.xVel * elapsed;
        if(potentialX > screen.canvas.width) potentialX -= screen.canvas.width;
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
                
                if(this.yVel < 4) {
                    this.yVel = -1;
                    this.isJumping = false;
                }
                else this.yVel = -this.yVel * .6;
                
                break;
            }
        }
        if(ok) {
            this.y = potentialY;            
        }


        // if(world.hasGround(Math.floor(this.x), Math.floor(potentialY + 10))) {
        //     if(this.yVel < 4) {
        //         this.yVel = -1;
        //         this.isJumping = false;
        //     }
        //     else this.yVel = -this.yVel * .6;
        // }
        // else if(potentialY > screen.canvas.height) console.log("GAME OVER");
        // else this.y = potentialY;
        for(let i = 0; i < this.bullets.length; i++) {
            this.bullets[i].update(elapsed, enemies);
        } 
        
        // // Do X
        // let potentialX = this.x + this.xVel * elapsed;
        // if(potentialX > screen.canvas.width) potentialX -= screen.canvas.width;
        // else if(potentialX < 0) potentialX += screen.canvas.width;
        // if(potentialX > this.x) {
        //     if(world.hasGround(Math.floor(potentialX + 3), Math.floor(potentialY + this.radius))) {
        //         this.xVel = 0;
        //     }
        //     else this.x = potentialX;
        // }
        // else if(potentialX < this.x) {
        //     if(world.hasGround(Math.floor(potentialX - 3), Math.floor(potentialY + this.radius))) {}
        //     else this.x = potentialX;
        // }
    }    
    
    fire() {
        const time = Date.now();
        if(time - this.coolDown < 300) {}
        else {
            this.coolDown = time;
            this.bullets.push(new Bullet(this.x + this.sin * this.barrelLength, this.y - this.cos * this.barrelLength, this.sin, -this.cos));
        }             
    }

    render(renderer) {        

        // Render bullets
        this.bullets.forEach(bullet => {
            bullet.render(renderer);
        });

        // Render circle
        renderer.beginPath();
        renderer.fillStyle = "green";
        renderer.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        renderer.fill();

        renderer.beginPath();
        
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
    }
}