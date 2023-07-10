interface Elevator {
    reachableLevels: number[]; // all levels which are reachable via this elevator
    currentLevel: number | null; // the level of the elevator or null if 
    currentHeight: number; // the precise pixel height of the elevator
    speed: number; // levels per second
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

    
}

export { Building };
export type { Person, Elevator };
