interface Elevator {
    reachableLevels: number[];
    currentLevel: number;
}

interface Person {
    currentLevel: number;
    targetLevel: number;
}

class Building {
    private people: Person[];
    private elevators: Elevator[];

    constructor() {
        this.people = [];
        this.elevators = [];
    }

    
}

export { Building };