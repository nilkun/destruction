export default class World {
    constructor(screen) {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = screen.canvas.width;
        this.canvas.height = screen.canvas.height;

        this.gravity = .8;

        // Sky
        this.context.fillStyle = "blue";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Ground
        this.context.fillStyle = "#654321";
        this.context.fillRect(0, 250, this.canvas.width, this.canvas.height);

        this.image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    hasGround(x, y) {
        const pixelIndex = (y * this.canvas.width + x) * 4;
        if(this.image.data[pixelIndex + 2] === 33) return true;
        return false;
    }
    
    getRenderer() {
        return this.context;
    }

    filledCircle(x, y, radius) {
        this.context.beginPath();
        this.context.fillStyle = "blue";
        this.context.arc(x, y, radius, 0, Math.PI * 2);
        this.context.fill();
        if(x + radius > this.canvas.width) {
            this.context.beginPath();
            // this.context.fillStyle = "blue";
            this.context.arc(this.canvas.width - x, y, radius, 0, Math.PI * 2);
            this.context.fill();
        }
        else if(x - radius < 0) {
            this.context.beginPath();
            // this.context.fillStyle = "blue";
            this.context.arc(this.canvas.width + x, y, radius, 0, Math.PI * 2);
            this.context.fill();
        }
        this.image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    setImage() {
        this.image = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
}
