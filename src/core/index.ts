import { Building } from "./elevators";
import { BuildingCodeWrapper, ElevatorCodeWrapper } from "./codeWrapper";
import stickFigureSrc from "../assets/stickman.png";
import { Level } from "./levels";
import { CustomContext, makeCustomContext } from "./customContext";
import { sleep } from "../utils/timeutils";

const STICK_FIGURE = new Image();
STICK_FIGURE.src = stickFigureSrc;

interface EngineObserver {
    setTime: React.Dispatch<React.SetStateAction<number>>;
    setRunning: React.Dispatch<React.SetStateAction<boolean>>;
};

const MAX_TIME_PER_ITERATION = 0.05;

class Engine {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CustomContext | null = null;
    private initialized: boolean = false;
    private running: boolean = false;
    public speed: number = 1.0;

    private y: number = 0;

    private building: Building | null;

    private level: Level | null = null;

    private statusObject = {
        runningCode: false,
        setRunning: (val: boolean) => {
            this.statusObject.runningCode = val;
            this.observer?.setRunning(val);
        }
    };
    private elapsedTime: number = 0.0;

    private observer: EngineObserver | null = null;

    private codeRunnerWorker: Worker;

    constructor() {
        this.loop = this.loop.bind(this);
        this.building = null;
        
        this.codeRunnerWorker = new Worker('./codeRunnerWorker.js');
    }

    loadLevel(level: Level) {
        this.level = level;

        this.building = new Building(level.buildingHeight);
        for (const elevator of level.elevators) {
            this.building.addElevator({
                speed: elevator.speed,
                maxOccupancy: elevator.capacity,
                startingLevel: elevator.startingLevel ? elevator.startingLevel : 0
            });
        }
        for (const person of level.people) {
            this.building.addPerson(person.start, person.end);
        }
    }

    resetLevel() {
        if (!this.level) {
            throw new Error("Cannot reset level when no level is set.");
        }

        this.elapsedTime = 0.0;
        this.observer?.setTime(this.elapsedTime);
        this.loadLevel(this.level);
    }

    stopCode() {
        this.codeRunnerWorker.terminate();
        this.statusObject.setRunning(false);
    }

    async executeUserCode(code: string, logCallback: (msg: any) => void) {
        if (!this.building) {
            throw new Error("Cannot exceute user code when no building is loaded in");
        }

        this.codeRunnerWorker = new Worker('./codeRunnerWorker.js');

        this.codeRunnerWorker.onmessage = (e: any) => {
            if (!this.building) {
                throw new Error("Cannot execute messages on an undefined building");
            }

            const {action, data} = e.data;

            console.log(action, data);

            switch (action) {
                case 'log':
                    logCallback(data.message);
                    break;
                case 'elevator-goto':
                    const { elevatorNumber, destination } = data;
                    console.log(`goto ${destination}`)
                    const elevator = this.building.elevators[elevatorNumber];
                    elevator.targetLevel = destination;
                    elevator.onLand = () => {
                        console.log('landed');
                        this.codeRunnerWorker.postMessage({
                            type: 'elevator-landed',
                            value: {

                            }
                        })
                    }
                    break;
                case 'terminate':
                    this.statusObject.setRunning(false);
            }
        }

        this.codeRunnerWorker.postMessage({
            action: 'execute-code',
            value: code
        });

        this.statusObject.setRunning(true);

        // this.statusObject.shouldTerminate = false;
        // this.statusObject.setRunning(true);
        
        // this.elapsedTime = 0.0;
        // this.observer?.setTime(this.elapsedTime);

        // const addAwaits = code.replaceAll('elevator.goto(', 'await elevator.goto(');
        
        // // Then between each line we can add a check for if we should terminate
        // const addTerminationChecks = addAwaits.replaceAll(
        //     '\n', 
        //     `
        //     await sleep(0);
        //     if (__status.shouldTerminate) { 
        //         __status.setRunning(false); 
        //         return; 
        //     }
        //     `);

        // const surroundAsync = `(async () => {
        //     try {
        //         ${addTerminationChecks}
        //     }
        //     catch (err) {
        //         log(err);
        //         console.log(err);
        //     }
        //     __status.setRunning(false);
        // })();`;

        // const func = new Function('elevator', 'building', 'log', 'sleep', '__status', surroundAsync);
        // const elevatorCW = new ElevatorCodeWrapper(this.building.elevators[0], this.statusObject);
        // const buildingCW = new BuildingCodeWrapper(this.building, this.statusObject);
        // func(elevatorCW, buildingCW, logCallback, sleep, this.statusObject);
    }

    /**
     * Sets the canvas and generates a render context for it.
     * @param canvas The canvas to this engine to render for.
     */
    setCanvas(canvas: HTMLCanvasElement) {
        this.stopLoop();
        this.canvas = canvas;
        this.ctx = makeCustomContext(this.canvas.getContext("2d") as CanvasRenderingContext2D);

        console.log("set canvas");

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

        if (!this.building) return;

        // Draw level markers
        const heightPerFloor = 240;
        const base = 100;
        const margin = 100;
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#666';
        ctx.fillRect(0, this.canvas.height - base + this.y - 1, this.canvas.width, 2);
        
        ctx.font = 'bold 85px sans-serif'
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        for (let i = 0; i < this.building.height; i++) {
            // draw floor marker
            ctx.fillStyle = "#777";
            const fy = this.canvas.height - base + this.y - (i + 1) * heightPerFloor;
            ctx.fillRect(margin, fy, this.canvas.width - margin * 2 - 1, 2);
            
            // draw text background
            const str = i.toString();
            ctx.fillStyle = 'rgb(225, 225, 225)';
            const backgroundWidth = ctx.measureText(str).width + 50;
            ctx.fillRect(margin + 20, this.canvas.height - base + this.y - (i + 1) * heightPerFloor + 2, backgroundWidth, heightPerFloor - 4);
            // draw floor number
            ctx.fillStyle = '#ccc';
            ctx.strokeStyle = '#bbb';
            const ty = this.canvas.height - base + this.y - (i + 1) * heightPerFloor + heightPerFloor / 2 + 20;
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
            const levelStr = `${Math.floor(elevator.currentHeight + 0.5)}`;
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
                    ctx.fillText(`${person.targetLevel}`, px + personWidth / 2 + 4, py - 2);
                    ctx.strokeText(`${person.targetLevel}`, px + personWidth / 2 + 4, py - 2);

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

    setObserver(observer: EngineObserver) {
        this.observer = observer;
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
            // dt = (timeNow - this.timeLastFrame) / 1000.0 * Math.pow(2, this.speed - 1);
            dt = Math.min((timeNow - this.timeLastFrame) / 1000.0, MAX_TIME_PER_ITERATION);
        }
        this.timeLastFrame = timeNow;

        const iterations = Math.floor(Math.pow(2, this.speed - 1));

        if (this.statusObject.runningCode) {
            this.elapsedTime += dt * iterations;
            this.observer?.setTime(this.elapsedTime);
        }
        else {
            dt = 0;
        }

        if (this.building) {
            for (let i = 0; i < iterations; i++)
                this.building.update(dt);
        }

        // Draw the background
        this.ctx.fillStyle = 'rgb(230, 230, 230)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.renderBuildingRegular(this.ctx);

        window.requestAnimationFrame(this.loop);
    }
}

const engine: Engine = new Engine();

export default engine;