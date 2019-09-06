export default class World {
    constructor(screen, level) {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = screen.canvas.width;
        this.canvas.height = screen.canvas.height;
        this.textures = [];
        this.level = level;
        this.backgroundColor = "#050505";

        this.gravity = 800000;
        this.gameOver = false;

        // Sky
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Ground
        this.context.fillStyle = "#654321";
        this.context.fillRect(0, 550, this.canvas.width, this.canvas.height);
    }

    hasGround(x, y) {
        const pixelIndex = (y * this.canvas.width + x) * 4;
        // if(this.image.data[pixelIndex + 2] !== 5 && this.image.data[pixelIndex + 2] !== undefined) 
        if(this.image.data[pixelIndex + 2] > 6 && this.image.data[pixelIndex + 2] !== undefined) 

        {
            return true;
        }
        return false;
    }
    reset() {
        this.gameOver = false;
    }
    ends() {
        this.gameOver = true;
    }
    getRenderer() {
        return this.context;
    }
    create() {
        for(let i = 0; i < 41; i++) {
            for(let j = 0; j < 8; j++) {
                const iPos = j%2===0 ? i * 20 : -10 + i * 20;
                this.context.drawImage(this.textures[0], iPos, 490 + j * 10);
            }
        }
        for(let i = 0; i < 41; i++) {
            for(let j = 0; j < 1; j++) {
                this.context.drawImage(this.textures[1], i * 30, 570 + j * 20);
            }
        }
        this.image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    filledCircle(x, y, radius) {
        // x = Math.floor(x);
        // y = Math.floor(y);

        this.context.imageSmoothingEnabled = false;
        this.context.beginPath();
        this.context.fillStyle = this.backgroundColor;
        this.context.arc(x, y, radius, 0, Math.PI * 2);
        this.context.fill();
        if(x + radius > this.canvas.width) {
            this.context.beginPath();
            this.context.arc(x - this.canvas.width, y, radius, 0, Math.PI * 2);
            this.context.fill();
        }
        else if(x - radius < 0) {
            this.context.beginPath();
            this.context.arc(this.canvas.width + x, y, radius, 0, Math.PI * 2);
            this.context.fill();
        }
        this.image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    setImage() {
        this.image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
}
