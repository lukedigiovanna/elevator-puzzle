import { Building } from "./elevators";
import { BuildingCodeWrapper, ElevatorCodeWrapper } from "./codeWrapper";
import stickFigureSrc from "../assets/stickman.png";

const STICK_FIGURE = new Image();
STICK_FIGURE.src = stickFigureSrc;

interface CustomContext extends CanvasRenderingContext2D {
    fillRoundedRect(x: number, y: number, width: number, height: number, radius: number): void;
    strokeRoundedRect(x: number, y: number, width: number, height: number, radius: number): void;
    fillEquilateralTriangle(x: number, y: number, size: number, flipVertically?: boolean): void;
}

function makeCustomContext(ctx: CanvasRenderingContext2D): CustomContext {
    const _this = ctx as CustomContext;

    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
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
    }

    _this.fillRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
        drawRoundedRect(x, y, width, height, radius);
        _this.fill();
    }

    _this.strokeRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
        drawRoundedRect(x, y, width, height, radius);
        _this.stroke();
    }

    _this.fillEquilateralTriangle = (x: number, y: number, size: number, flipVertically: boolean=false) => {
        const height = (Math.sqrt(3) / 2) * size;
  
        const sign = flipVertically ? -1 : 1;
        const offset = flipVertically ? height : 0;

        _this.beginPath();
        _this.moveTo(x, y + offset);
        _this.lineTo(x + size / 2, y + sign * height + offset);
        _this.lineTo(x - size / 2, y + sign * height + offset);
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
        this.loop = this.loop.bind(this);
        this.building = new Building(6);
        for (let i = 0; i < 1; i++) {
            const elevator = this.building.addElevator({
                startingLevel: i,
                speed: 2,
                maxOccupancy: 8
            });
            // elevator.onLand = () => {
            //     elevator.dropoff();
            //     setTimeout(() => {
            //         elevator.pickup();
            //         elevator.targetLevel = (elevator.targetLevel + 1) % elevator.building.height;
            //     }, 500);
            // }
        }
        for (let i = 0; i < 20; i++) {
            this.building.addPerson(
                Math.floor(Math.random() * this.building.height),
                Math.floor(Math.random() * this.building.height)
            );
        }
    }

    async executeUserCode(code: string, logCallback: (msg: any) => void) {
        const addAwaits = code.replaceAll('elevator.goto(', 'await elevator.goto(');
        const func = new Function('elevator', 'building', 'log', `(async () => {${addAwaits}})();`);
        const elevatorCW = new ElevatorCodeWrapper(this.building.elevators[0]);
        const buildingCW = new BuildingCodeWrapper(this.building);
        func(elevatorCW, buildingCW, logCallback);
    }

    /**
     * Sets the canvas and generates a render context for it.
     * @param canvas The canvas to this engine to render for.
     */
    setCanvas(canvas: HTMLCanvasElement) {
        this.stopLoop();
        this.canvas = canvas;
        this.ctx = makeCustomContext(this.canvas.getContext("2d") as CanvasRenderingContext2D);

        this.canvas.addEventListener("wheel", (ev) => {
            this.y = Math.max(this.y - ev.deltaY, 0);
        });

        this.initialized = true;
    }

    /**
     * Begins the render loop if it has not already begun.
     * If it has already begun, this function does nothing.
     */
    startLoop() {
        if (!this.initialized) {
            throw Error("Trying to render an uninitialized renderer.");
        }

        if (!this.running) {
            this.running = true;
            this.loop();
        }
    }

    /**
     * Will suspend the engine loop temporarily.
     */
    stopLoop() {
        this.running = false;
    }

    /**
     * Determins if this engine is currently running.
     * @returns True if this engine is currently executing its loop
     */
    isRunning() {
        return this.running;
    }

    private renderBuildingRegular(ctx: CustomContext) {
        if (!this.canvas) return;

        // Draw level markers
        const heightPerFloor = 240;
        const base = 100;
        const margin = 200;
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#666';
        ctx.fillRect(0, this.canvas.height - base + this.y - 1, this.canvas.width, 2);
        
        ctx.font = 'bold 85px sans-serif'
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        for (let i = 1; i <= this.building.height; i++) {
            // draw floor marker
            ctx.fillStyle = "#777";
            const fy = this.canvas.height - base + this.y - i * heightPerFloor;
            ctx.fillRect(margin, fy, this.canvas.width - margin * 2 - 1, 2);
            
            // draw text background
            const str = i.toString();
            ctx.fillStyle = 'rgb(225, 225, 225)';
            const backgroundWidth = ctx.measureText(str).width + 50;
            ctx.fillRect(margin + 20, this.canvas.height - base + this.y - i * heightPerFloor + 2, backgroundWidth, heightPerFloor - 4);
            // draw floor number
            ctx.fillStyle = '#ccc';
            ctx.strokeStyle = '#bbb';
            const ty = this.canvas.height - base + this.y - i * heightPerFloor + heightPerFloor / 2 + 20;
            ctx.fillText(`${i}`, margin + 20 + backgroundWidth / 2, ty);
            ctx.strokeText(`${i}`, margin + 20 + backgroundWidth / 2, ty);
        }

        const elevatorWidth = 140; // width of elevator
        const elevatorHeight = heightPerFloor * 0.8;
        const elevatorMargin = 20; // space around an elevator
        const totWidth = elevatorWidth + elevatorMargin * 2;
        let ex = this.canvas.width / 2 - (this.building.elevators.length * totWidth) / 2
        for (const elevator of this.building.elevators) {
            const ey = this.canvas.height - base + this.y - elevator.currentHeight * heightPerFloor - elevatorHeight;
            
            ctx.fillStyle = '#888';
            ctx.fillRoundedRect(ex + elevatorMargin, ey, elevatorWidth, elevatorHeight, 15);
            
            ctx.fillStyle = '#bbb';
            ctx.fillRect(ex + elevatorMargin, ey, elevatorWidth / 2 * elevator.doorStatus, elevatorHeight);
            ctx.fillRect(ex + elevatorMargin + elevatorWidth / 2 + elevatorWidth / 2 * (1 - elevator.doorStatus), ey, elevatorWidth / 2 * elevator.doorStatus, elevatorHeight);
            
            ctx.fillStyle = '#777';
            ctx.fillRect(ex + elevatorMargin + elevatorWidth / 2 * elevator.doorStatus, ey, 2, elevatorHeight);
            ctx.fillRect(ex + elevatorMargin + elevatorWidth / 2 + elevatorWidth / 2 * (1 - elevator.doorStatus) - 2, ey, 2, elevatorHeight);
            
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 8;
            ctx.strokeRoundedRect(ex + elevatorMargin, ey, elevatorWidth, elevatorHeight, 15);

            // Draw elevator info: Level, Direction, Occupancy
            ctx.font = '24px Arial';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#f7b928';
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            const levelStr = `${Math.floor(elevator.currentHeight + 1.5)}`;
            const strWidth = ctx.measureText(levelStr).width; 
            ctx.fillText(levelStr, ex + 24, ey - 10);
            ctx.strokeText(levelStr, ex + 24, ey - 10);

            // Direction arrow
            if (elevator.direction === 'up') {
                ctx.fillStyle = 'green';
                ctx.fillEquilateralTriangle(ex + 24 + strWidth + 15, ey - 28, 20);
            }
            else {
                ctx.fillStyle = 'red';
                ctx.fillEquilateralTriangle(ex + 24 + strWidth + 15, ey - 28, 20, true);
            }

            // Occupancy
            const figureHeight = 24;
            const figureWidth = STICK_FIGURE.width / STICK_FIGURE.height * figureHeight + 2;
            ctx.drawImage(STICK_FIGURE, ex + 24 + strWidth + 15 + 20, ey - 31, figureWidth, figureHeight);

            ctx.fillStyle = '#555';
            ctx.fillText(`${elevator.occupancy.length}/${elevator.maxOccupancy}`, ex + 24 + strWidth + 15 + 20 + figureWidth + 7, ey - 10);
            ctx.strokeText(`${elevator.occupancy.length}/${elevator.maxOccupancy}`, ex + 24 + strWidth + 15 + 20 + figureWidth + 7, ey - 10);

            ex += totWidth;
        }

        // Draw people on each level
        ctx.font = '34px sans-serif';
        ctx.textAlign = 'right';
        ctx.lineWidth = 1;
        // Stick figure's dimension is 308x811
        const personHeight = 120;
        const personWidth = STICK_FIGURE.width / STICK_FIGURE.height * personHeight;
        const personMargin = 10;
        for (let i = 0; i < this.building.height; i++) {
            const people = this.building.getPeople(i);
            const py = this.canvas.height - base + this.y - i * heightPerFloor - personHeight;
            const sx = margin + 140;
            let px = sx;
            let wpx = sx;
            for (let j = 0; j < people.length; j++) {
                const person = people[j];

                if (person.currentLevel !== person.targetLevel) {
                    ctx.drawImage(STICK_FIGURE, px, py, personWidth, personHeight);
                    ctx.fillStyle = '#ddd';
                    ctx.strokeStyle = '#111';
                    ctx.fillText(`${person.targetLevel + 1}`, px + personWidth / 2, py - 2);
                    ctx.strokeText(`${person.targetLevel + 1}`, px + personWidth / 2, py - 2);

                    if (person.currentLevel < person.targetLevel) {
                        ctx.fillStyle = 'green';
                        ctx.fillEquilateralTriangle(px + personWidth / 2 + 15, py - 2 - 20, 20);
                    }
                    else {
                        ctx.fillStyle = 'red';
                        ctx.fillEquilateralTriangle(px + personWidth / 2 + 15, py - 2 - 20, 20, true);
                    }
                    px += personWidth + personMargin;
                }
                else {
                    ctx.drawImage(STICK_FIGURE, wpx + person.walkingOffset, py, personWidth, personHeight);
                    wpx += personWidth + personMargin;
                }
            }
        }
    }

    private renderBuildingZoomedOut(ctx: CustomContext) {

    }

    private timeLastFrame: number | null = null;
    private loop() {
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

        this.renderBuildingRegular(this.ctx);

        window.requestAnimationFrame(this.loop);
    }
}

const engine: Engine = new Engine();

export default engine;