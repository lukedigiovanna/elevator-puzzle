
interface CustomContext extends CanvasRenderingContext2D {
    fillRoundedRect(x: number, y: number, width: number, height: number, radius: number): void;
}

function makeCustomContext(ctx: CanvasRenderingContext2D): CustomContext {
    const _this = ctx as CustomContext;

    _this.fillRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
        _this.beginPath();
        _this.moveTo(x + radius, y);
        _this.lineTo(x + width - radius, y);
        _this.arcTo(x + width, y, x + width, y + radius, radius);
        _this.lineTo(x + width, y + height - radius);
        _this.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        _this.lineTo(x + radius, y + height);
        _this.arcTo(x, y + height, x, y + height - radius, radius);
        _this.lineTo(x, y + radius);
        _this.arcTo(x, y, x + radius, y, radius);
        _this.closePath();
        _this.fill();
    }

    return _this;
}

class Renderer {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CustomContext | null = null;
    private initialized: boolean = false;
    private running: boolean = false;

    private y: number = 0;

    constructor() {
        this.renderLoop = this.renderLoop.bind(this);
    }

    /**
     * Sets the canvas and generates a render context for it.
     * Will compile necessary shaders and define buffers.
     * @param canvas 
     */
    setCanvas(canvas: HTMLCanvasElement) {
        this.stopRendering();
        this.canvas = canvas;
        this.ctx = makeCustomContext(this.canvas.getContext("2d") as CanvasRenderingContext2D);

        this.canvas.addEventListener("wheel", (ev) => {
            this.y = Math.max(this.y - ev.deltaY, 0);
        })

        this.initialized = true;
    }

    /**
     * Begins the render loop if it has not already begun.
     * If it has already begun, this function does nothing.
     */
    render() {
        if (!this.initialized) {
            throw Error("Trying to render an uninitialized renderer.");
        }

        if (!this.running) {
            this.running = true;
            this.renderLoop();
        }
    }

    /**
     * Will suspend the render loop temporarily.
     */
    stopRendering() {
        this.running = false;
    }

    /**
     * Determins if this renderer is currently rendering.
     * @returns True if this renderer is currently executing its render loop
     */
    isRendering() {
        return this.running;
    }

    private renderLoop() {
        if (!this.canvas || !this.ctx) {
            throw Error("Attempting to render with error in initialization.");
        }

        if (!this.running) {
            return;
        }

        // Draw the background
        this.ctx.fillStyle = 'rgb(230, 230, 230)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw level markers
        const heightPerFloor = 140;
        const base = 50;
        const margin = 100;

        
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(0, this.canvas.height - base + this.y - 1, this.canvas.width, 2);
        
        this.ctx.font = "bold 55px sans-serif"
        for (let i = 1; i <= 5; i++) {
            this.ctx.fillStyle = "#777";
            this.ctx.fillRect(margin, this.canvas.height - base + this.y - i * heightPerFloor, this.canvas.width - margin * 2, 1);
            this.ctx.fillStyle = "rgb(225, 225, 225)";
            this.ctx.fillRect(margin + 20, this.canvas.height - base + this.y - i * heightPerFloor + 1, 50, heightPerFloor - 2);
            this.ctx.fillStyle = "#ccc";
            this.ctx.strokeStyle = "#bbb";
            this.ctx.lineWidth = 2;
            const ty = this.canvas.height - base + this.y - i * heightPerFloor + heightPerFloor / 2 + 20;
            this.ctx.fillText(`${i}`, margin + 30, ty);
            this.ctx.strokeText(`${i}`, margin + 30, ty);
        }

        this.ctx.fillStyle = '#111';
        const height = (Math.sin(Date.now() / 1000) * 0.5 + 0.5) * 100;
        this.ctx.shadowBlur = height;
        this.ctx.shadowOffsetY = height;
        this.ctx.shadowColor = 'gray';
        // this.ctx.fillRect(this.canvas.width / 2 - 200, this.canvas.height - height - 50, 400, 20);
        this.ctx.fillRoundedRect(this.canvas.width / 2 - 200, this.canvas.height - height - base + this.y, 400, 20, 8);
        
        window.requestAnimationFrame(this.renderLoop);
    }
}

const renderer: Renderer = new Renderer();

export default renderer;