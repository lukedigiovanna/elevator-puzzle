import { Building, Elevator } from "./elevators";

function pauseUntil(condition: () => boolean) {
    return new Promise((resolve: any) => {
      const checkCondition = () => {
        if (condition()) {
          resolve();
        } else {
          setTimeout(checkCondition, 100); // Check condition again after 100ms
        }
      };
  
      checkCondition();
    });
}

/**
 * Wraps an elevator to control it from the code editor.
 * 
 * The functions displayed here are the ones accessible to the player.
 */
class ElevatorCodeWrapper {
    private elevator: Elevator;
    private shouldTerminateObject: any;

    constructor(elevator: Elevator, shouldTerminateObject: any) {
        this.elevator = elevator;
        this.shouldTerminateObject = shouldTerminateObject;
    }

    pickup() {
        this.elevator.pickup();
    }

    dropoff() {
        this.elevator.dropoff();
    }

    async goto(level: number) {
        this.elevator.targetLevel = level;
        // Need to now synchronously wait until this elevator arrives
        await pauseUntil(() => {
            return (this.elevator.state === 'stationary' && this.elevator.currentLevel === this.elevator.targetLevel) || this.shouldTerminateObject.val;
        });
    }

    get level() {
        return this.elevator.currentLevel;
    }

    get destinations() {
        return this.elevator.occupancy.map(person => person.targetLevel);
    }
}

class BuildingCodeWrapper {
    private building: Building;
    private shouldTerminateObject: any;

    constructor(building: Building, shouldTerminateObject: any) {
        this.building = building;
        this.shouldTerminateObject = shouldTerminateObject;
    }

    get height() {
        return this.building.height;
    }

    hasPeople() {
        return this.building.hasPeople();
    }
}

export { ElevatorCodeWrapper, BuildingCodeWrapper };