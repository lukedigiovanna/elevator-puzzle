interface ElevatorParams {
    startingLevel: number;
    maxOccupancy: number;
    speed: number;
}

type ElevatorState = 'door-opening' | 'door-closing' | 'stationary' | 'moving';
type ElevatorDirection = 'up' | 'down';

class Elevator {
    currentLevel: number; // the level of the elevator 
    currentHeight: number; // the precise pixel height of the elevator
    targetLevel: number;
    reachableLevels: number[]; // all levels which are reachable via this elevator
    speed: number; // levels per second
    doorSpeed: number;
    doorStatus: number; // 0 is open, 1 is closed  
    maxOccupancy: number;
    occupancy: Person[];
    direction: ElevatorDirection;

    building: Building;

    state: ElevatorState;

    // Callback function for when the elevator lands on a floor.
    onLand: (() => void) | undefined;

    constructor(building: Building, {startingLevel, speed, maxOccupancy }: ElevatorParams) {
        this.currentLevel = startingLevel;
        this.currentHeight = startingLevel;
        this.targetLevel = startingLevel;
        this.speed = speed;
        this.doorSpeed = 0.8;
        this.building = building;

        this.doorStatus = 0;
        this.state = 'stationary';
        this.direction = 'up';

        this.reachableLevels = [];
        for (let i = 0; i < building.height; i++) {
            this.reachableLevels.push(i);
        }

        this.maxOccupancy = maxOccupancy;
        this.occupancy = [];
    }

    private static ACCEL_DIST = 0.5;
    private static THRESHOLD = 0.01;

    /**
     * Updates the state of this elevator by the time step.
     * @param dt 
     */
    update(dt: number) {
        // Door is open and we are on the right level.
        if (this.doorStatus === 0 && this.currentHeight === this.targetLevel) {
            // If changing from the door-opening to stationary state, then that means we landed on a floor.
            if (this.state === 'door-opening') {
                this.state = 'stationary';

                if (this.onLand) {
                    this.onLand(); // So call that callback function if it exists.
                }
            }
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
                if (direction < 0) {
                    this.direction = 'down';
                }
                else {
                    this.direction = 'up';
                }

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


    pickup() {
        if (this.state !== 'stationary') {
            throw new Error("Elevator cannot pickup passengers when not stationary");
        }

        // pick up as many people from the level we are on as we can
        const people = this.building.getPeople(this.currentLevel);
        // Only take people who want to leave this level.
        for (let i = 0; i < people.length; i++) {
            if (people[i].targetLevel !== people[i].currentLevel) {
                this.occupancy.push(people[i]);
                people.splice(i, 1);
                i--;
            }
            if (this.occupancy.length >= this.maxOccupancy) {
                break;
            }
        }
    }

    dropoff() {
        if (this.state !== 'stationary') {
            throw new Error("Elevator cannot drop off passengers when not stationary");
        }

        // Drop off any passengers who are supposed to get off at this floor
        for (let i = 0; i < this.occupancy.length; i++) {
            if (this.occupancy[i].targetLevel === this.currentLevel) {
                this.building.getPeople(this.currentLevel).push(this.occupancy[i]);
                this.occupancy[i].currentLevel = this.currentLevel;
                this.occupancy.splice(i, 1);
                i--;
            }
        }
    }
}

interface Person {
    currentLevel: number;
    targetLevel: number;
    elevator: Elevator | null; // gives the elevator the person is in, or null if not in an elevator
    walkingOffset: number;
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

    /**
     * 
     * @param params The parameters object that defines the elevator.
     * @returns 
     */
    addElevator(params: ElevatorParams): Elevator {
        const elevator = new Elevator(this, params);
        this.elevators.push(elevator);
        return elevator;
    }

    update(dt: number) {
        for (const elevator of this.elevators) {
            elevator.update(dt);
        }
        const walkingSpeed = 200;
        for (let i = 0; i < this.height; i++) {
            const people = this.getPeople(i);
            for (let j = 0; j < people.length; j++) {
                const person = people[j];
                if (person.currentLevel === person.targetLevel) {
                    person.walkingOffset += walkingSpeed * dt;
                    if (person.walkingOffset > 1500) {
                        people.splice(j, 1);
                        j--;
                    }
                }
            }
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
            elevator: null,
            walkingOffset: 0
        };

        this.getPeople(currentLevel).push(person);
    }

    /**
     * Returns true if there is anyone waiting in this building.
     */
    hasPeople() {
        for (let level = 0; level < this.height; level++) {
            for (const person of this.getPeople(level)) {
                if (person.currentLevel !== person.targetLevel) {
                    return true;
                }
            }
        }
        return false;
    }
}

export { Building };
export type { Person, Elevator };
