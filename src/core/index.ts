import { Building } from "./elevators";

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

class Engine {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CustomContext | null = null;
    private initialized: boolean = false;
    private running: boolean = false;

    private y: number = 0;

    private building: Building;

    constructor() {
        this.renderLoop = this.renderLoop.bind(this);
        this.building = new Building(5);
        this.building.addElevator({
            startingLevel: 0,
            speed: 1
        });
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

        this.canvas.addEventListener('mousedown', (ev) => {
            this.building.elevators[0].targetLevel = (this.building.elevators[0].targetLevel + 1) % this.building.height;
            console.log('click');
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

    private timeLastFrame: number | null = null;
    private renderLoop() {
        if (!this.canvas || !this.ctx) {
            throw Error("Attempting to render with error in initialization.");
        }

        if (!this.running) {
            return;
        }

        const timeNow = Date.now();
        let dt = 0;
        if (this.timeLastFrame) {
            dt = (timeNow - this.timeLastFrame) / 1000.0;
        }
        this.timeLastFrame = timeNow;
        this.building.update(dt);

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
        for (let i = 1; i <= this.building.height; i++) {
            // draw floor marker
            this.ctx.fillStyle = "#777";
            this.ctx.fillRect(margin, this.canvas.height - base + this.y - i * heightPerFloor, this.canvas.width - margin * 2, 1);
            // draw text background
            const str = i.toString();
            this.ctx.fillStyle = "rgb(225, 225, 225)";
            const backgroundWidth = this.ctx.measureText(str).width + 20;
            this.ctx.fillRect(margin + 20, this.canvas.height - base + this.y - i * heightPerFloor + 1, backgroundWidth, heightPerFloor - 2);
            // draw floor number
            this.ctx.fillStyle = "#ccc";
            this.ctx.strokeStyle = "#bbb";
            this.ctx.lineWidth = 2;
            const ty = this.canvas.height - base + this.y - i * heightPerFloor + heightPerFloor / 2 + 20;
            this.ctx.fillText(`${i}`, margin + 30, ty);
            this.ctx.strokeText(`${i}`, margin + 30, ty);
        }

        // this.ctx.fillStyle = '#111';
        // const height = (Math.sin(Date.now() / 1000) * 0.5 + 0.5) * 100;
        // this.ctx.shadowBlur = height;
        // this.ctx.shadowOffsetY = height;
        // this.ctx.shadowColor = 'gray';
        // // this.ctx.fillRect(this.canvas.width / 2 - 200, this.canvas.height - height - 50, 400, 20);
        // this.ctx.fillRoundedRect(this.canvas.width / 2 - 200, this.canvas.height - height - base + this.y, 400, 20, 8);
        
        const elevatorWidth = 80; // width of elevator
        const elevatorHeight = heightPerFloor * 0.8;
        const elevatorMargin = 10; // space around an elevator, i.e. total width = ewidth + 2 * emargin
        const totWidth = elevatorWidth + elevatorMargin * 2;
        let ex = this.canvas.width / 2 - (this.building.elevators.length * totWidth) / 2
        for (const elevator of this.building.elevators) {
            this.ctx.fillStyle = '#444';
            const ey = this.canvas.height - base + this.y - elevator.currentHeight * heightPerFloor - elevatorHeight;
            this.ctx.fillRoundedRect(ex + elevatorMargin, ey, elevatorWidth, elevatorHeight, 5);
            ex += totWidth;
        }

        window.requestAnimationFrame(this.renderLoop);
    }
}

const engine: Engine = new Engine();

export default engine;