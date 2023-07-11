interface ElevatorParams {
    startingLevel: number;
    speed: number;
}

class Elevator {
    currentLevel: number; // the level of the elevator 
    currentHeight: number; // the precise pixel height of the elevator
    targetLevel: number;
    reachableLevels: number[]; // all levels which are reachable via this elevator
    speed: number; // levels per second

    constructor(buildingHeight: number, params: ElevatorParams) {
        this.currentLevel = params.startingLevel;
        this.currentHeight = params.startingLevel;
        this.targetLevel = params.startingLevel;
        this.reachableLevels = [];
        for (let i = 0; i < buildingHeight; i++) {
            this.reachableLevels.push(i);
        }
        this.speed = params.speed;
    }

    private static ACCEL_DIST = 0.5;
    private static THRESHOLD = 0.01;

    /**
     * Updates the state of this elevator by the time step.
     * @param dt 
     */
    update(dt: number) {
        // console.log(dt);
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
}

interface Person {
    currentLevel: number;
    targetLevel: number;
}

class Building {
    public people: Person[];
    public elevators: Elevator[];
    public height: number; // number of stories

    constructor(height: number) {
        this.height = height;
        this.people = [];
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
}

export { Building };
export type { Person, Elevator };
