export default class Level {
    constructor(enemies, bombs = 5, timer = .026) {
        this.bombsOnLevel = bombs;
        this.bombsLeft = bombs;
        // Time in seconds
        this.timer = timer;
        this.enemies = enemies;
        this.countdown = 0;
        this.no = 1;
        
    }
    reset() {
        this.bombsOnLevel = 5;
        this.bombsLeft = 5;
        this.countdown = 0;
        this.no = 1;

        this.timer = .016;
    }
    nextBomb() {
        if(this.bombsLeft > 0) {
            this.bombsLeft--;
            this.enemies.addBomb();
        }
    }
    next() {
        this.no++;
        this.bombsLeft = 4 + Math.ceil(this.no / 2);
        this.bombsOnLevel = this.bombsLeft;
        this.timer-= 0.001;
    }
    update(delta, game) {
        if(this.bombsLeft <= 0 && this.enemies.bombs.length === 0) {
            game();
        }
        else if(this.countdown <= 0) {
            this.nextBomb();
            this.countdown += this.timer;
        }
        this.countdown -= delta;

    }
}