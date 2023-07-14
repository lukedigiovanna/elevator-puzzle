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

function delay(milliseconds: number) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Wraps an elevator to control it from the code editor.
 * 
 * The functions displayed here are the ones accessible to the player.
 */
class ElevatorCodeWrapper {
    private elevator: Elevator;

    constructor(elevator: Elevator) {
        this.elevator = elevator;
    }

    pickup() {
        this.elevator.pickup();
    }

    dropoff() {
        this.elevator.dropoff();
    }

    async goto(level: number) {
        this.elevator.targetLevel = level - 1;
        // Need to now synchronously wait until this elevator arrives
        await pauseUntil(() => this.elevator.state === 'stationary' && this.elevator.currentLevel === this.elevator.targetLevel);
    }

    get destinations() {
        return this.elevator.occupancy.map(person => person.targetLevel);
    }
}

class BuildingCodeWrapper {
    private building: Building;

    constructor(building: Building) {
        this.building = building;
    }

    get height() {
        return this.building.height;
    }

    hasPeople() {
        return this.building.hasPeople();
    }
}

export { ElevatorCodeWrapper, BuildingCodeWrapper };