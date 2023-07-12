interface ElevatorParams {
    startingLevel: number;
    speed: number;
}

type ElevatorState = 'door-opening' | 'door-closing' | 'stationary' | 'moving';

class Elevator {
    currentLevel: number; // the level of the elevator 
    currentHeight: number; // the precise pixel height of the elevator
    targetLevel: number;
    reachableLevels: number[]; // all levels which are reachable via this elevator
    speed: number; // levels per second
    doorSpeed: number;
    doorStatus: number; // 0 is open, 1 is closed  
    state: ElevatorState;

    constructor(buildingHeight: number, params: ElevatorParams) {
        this.currentLevel = params.startingLevel;
        this.currentHeight = params.startingLevel;
        this.targetLevel = params.startingLevel;
        this.speed = params.speed;
        this.doorSpeed = 0.8;
        
        this.doorStatus = 0;
        this.state = 'stationary';

        this.reachableLevels = [];
        for (let i = 0; i < buildingHeight; i++) {
            this.reachableLevels.push(i);
        }
    }

    private static ACCEL_DIST = 0.5;
    private static THRESHOLD = 0.01;

    /**
     * Updates the state of this elevator by the time step.
     * @param dt 
     */
    update(dt: number) {
        // determine our state.
        // Door is open and we are on the right level.
        if (this.doorStatus === 0 && this.currentHeight === this.targetLevel) {
            this.state = 'stationary';
        }
        // Door is closed and we are on the wrong level: start/continue moving
        else if (this.doorStatus === 1 && this.currentHeight !== this.targetLevel) {
            this.state = 'moving';
        }
        // We are on the right level: open the door
        else if (this.currentHeight === this.targetLevel) {
            this.state = 'door-opening';
        }
        // We are on the wrong level: close the door
        else if (this.currentHeight !== this.targetLevel) {
            this.state = 'door-closing';
        }

        if (this.state === 'moving') {
            const distanceTo = Math.abs(this.targetLevel - this.currentHeight);
            if (distanceTo < Elevator.THRESHOLD) {
                this.currentHeight = this.targetLevel;
                this.currentLevel = this.targetLevel;
            }
            else {
                const distanceFrom = Math.abs(this.currentLevel - this.currentHeight);
                const distance = Math.min(distanceTo, distanceFrom);
                const direction = Math.sign(this.targetLevel - this.currentHeight);
                let speed = this.speed;
                if (distance < Elevator.ACCEL_DIST) {
                    speed = distance / Elevator.ACCEL_DIST * this.speed + 0.1;
                }
                speed *= direction;
                this.currentHeight += speed * dt;
            }
        }
        else if (this.state === 'door-closing') {
            this.doorStatus = Math.min(this.doorStatus + this.doorSpeed * dt, 1.0);
        }
        else if (this.state === 'door-opening') {
            this.doorStatus = Math.max(this.doorStatus - this.doorSpeed * dt, 0.0);
        }
        // if stationary we don't need to do anything!
    }
}

interface Person {
    currentLevel: number;
    targetLevel: number;
    elevator: Elevator | null; // gives the elevator the person is in, or null if not in an elevator
}

class Building {
    private queues: Person[][];
    public elevators: Elevator[];
    public height: number; // number of stories

    constructor(height: number) {
        this.height = height;
        this.queues = [];
        // Add an empty array for each level of the queue.
        for (let i = 0; i < height; i++) {
            this.queues.push([]);
        }
        this.elevators = [];
    }

    addElevator(params: ElevatorParams) {
        this.elevators.push(new Elevator(this.height, params));
    }

    update(dt: number) {
        for (const elevator of this.elevators) {
            elevator.update(dt);
        }
    }

    /**
     * Gets the people waiting on the given level
     * @param level The level to look at
     * @returns An array of the people waiting on the floor in the order they arrived.
     */
    getPeople(level: number) {
        if (level < 0 || level >= this.height) {
            throw new Error("Level outside of bounds of building.");
        }

        return this.queues[level];
    }

    addPerson(currentLevel: number, targetLevel: number) {
        const person: Person = {
            currentLevel,
            targetLevel,
            elevator: null
        };

        this.getPeople(currentLevel).push(person);
    }
}

export { Building };
export type { Person, Elevator };
