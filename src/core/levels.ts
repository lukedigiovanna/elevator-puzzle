
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
}

const level1: Level = {
    buildingHeight: 2,
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
    ]
}

const levels = [
    level1,
    level2
];

export type { Level };
export { level1, level2 };
export default levels;