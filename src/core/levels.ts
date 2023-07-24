
interface IPerson {
    start: number;
    end: number;
}

interface IElevator {
    speed: number;
    capacity: number;
    excludedLevels?: number[];
    startingLevel?: number;
}

interface Level {
    nickname?: string;
    buildingHeight: number;
    elevators: IElevator[];
    people: IPerson[];
    passTime: number;
}

const level1: Level = {
    buildingHeight: 2,
    nickname: "Tutorial",
    elevators: [
        {
            speed: 0.5,
            capacity: 1
        }
    ],
    people: [
        {
            start: 0,
            end: 1
        }
    ],
    passTime: 30
}

const level2: Level = {
    buildingHeight: 3,
    elevators: [
        {
            speed: 0.5,
            capacity: 2
        }
    ],
    people: [
        {
            start: 0,
            end: 1
        },
        {
            start: 0,
            end: 2
        }
    ],
    passTime: 60
}

const level3: Level = {
    buildingHeight: 3,
    elevators: [
        {
            speed: 0.5,
            capacity: 1
        }
    ],
    people: [
        {
            start: 0,
            end: 1
        },
        {
            start: 1,
            end: 0
        },
        {
            start: 2,
            end: 0
        }
    ],
    passTime: 60
};

const impossible: Level = {
    nickname: "Impossible",
    buildingHeight: 50,
    elevators: [
        {
            capacity: 1,
            speed: 10
        }
    ],
    passTime: 10,
    people: [
        {
            start: 0,
            end: 49
        },
        {
            start: 0,
            end: 49
        },
        {
            start: 0,
            end: 49
        }
    ]
}

const levels = [
    level1,
    level2,
    level3,
    impossible
];

export type { Level };
export { level1, level2 };
export default levels;