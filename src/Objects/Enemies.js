class Bomb {
    constructor(x, y, destruction) {
        this.x = x;
        this.y = y;
        this.radius = 10;
        this.damageRadius = this.radius * destruction;
        this.velocity = 0;
        this.isDead = false;
        this.color="black";
        this.canHurt = true;
        this.value = 20;
        this.speed = 1000;
    }
    kill() {
        this.isDead = true;
        this.velocity = 0;
        this.damageRadius /= 2;
    }

    update(elapsed, world) {
        if(this.isDead) {
            this.color = this.color==="white" ? "yellow" : "white"
            this.velocity += elapsed * this.speed;
            this.radius += this.velocity;
            if(this.radius + this.y > 570) {
                world.ends();
            }
            
            if(this.radius > this.damageRadius) {
                world.filledCircle(this.x, Math.floor(this.y), this.damageRadius);
                return false;
            }
            return true;
        }

        this.velocity += elapsed * world.gravity * ( 1 + world.level.no / 200); 
        const potentialY = this.y + this.velocity * elapsed;
        if(world.hasGround(this.x, Math.floor(potentialY + this.radius))) {
            this.isDead = true;
            this.velocity = 0;
            return true;
        }
        else if(potentialY + this.radius > world.canvas.height) {  
            this.isDead = true;
            this.velocity = 0;
            return true;
        }
        else {
            this.y = potentialY;
            return true;            
        }
    }

    render(renderer, image, world) {
        if(!this.isDead) {
            renderer.drawImage(image, this.x - 10, this.y - 20)
        }
        else {
            renderer.beginPath();
            renderer.fillStyle = this.color;
            renderer.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            renderer.fill();

            if(this.x + this.radius > world.canvas.width) {
                renderer.beginPath();
                renderer.fillStyle = this.color;
                renderer.arc(this.x - world.canvas.width, this.y, this.radius, 0, Math.PI * 2);
                renderer.fill();
            }
            else if (this.x - this.radius < 0) {
                renderer.beginPath();
                renderer.fillStyle = this.color;
                renderer.arc(this.x + world.canvas.width, this.y, this.radius, 0, Math.PI * 2);
                renderer.fill();
            }
        }

    }
}



export default class Enemies {
    constructor(screen) {
        this.bombs = [];

        this.destruction = 4;

        this.image;

    }
    addBomb() {
        this.bombs.push(new Bomb(Math.floor(Math.random() * 800), -20, this.destruction));
    }
    update(elapsed, world) {
        for(let i = this.bombs.length - 1; i >= 0; i--) {
            if(!this.bombs[i].update(elapsed, world)) {
                this.bombs.splice(i, 1);
                // this.destruction *= 1.1;
            }
        }
    }
    render(renderer, world) {
        this.bombs.forEach(bomb => {
            bomb.render(renderer, this.image, world);
        })
    }
}