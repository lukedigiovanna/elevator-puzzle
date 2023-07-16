import engine from "../core";
import React from "react";
import levels from "../core/levels";
import { delay } from "../utils/timeutils";

const tabs = ['Results', 'Console', 'Documentation'];

const MAX_SPEED = 3;

export const ControlArea = (props: {code: string}) => {
    const [reactLogMessages, setReactLogMessages] = React.useState<any[]>([]);
    const logMessages: any[] = [];
    const addLogMessage = (msg: any) => {
        logMessages.push(msg);
        setReactLogMessages([...logMessages]);
    }

    const clearLogMessages = () => {
        logMessages.splice(0);
        setReactLogMessages(logMessages);
    }

    const [tab, setTab] = React.useState<string>(tabs[0]);

    const [level, setLevel] = React.useState<number>(0);

    React.useEffect(() => {
        engine.loadLevel(levels[level]);
    }, [level]);

    const [speed, setSpeed] = React.useState<number>(1);

    const [time, setTime] = React.useState<number>()

    React.useEffect(() => {
        engine.setObserver({
            setTime
        })
    }, []);

    return (
        <div className='control-area'>
            <div className='info-region'>
                <div className='tabs'>
                    {
                        tabs.map((tabName: string, index: number) => {
                            return (
                                <p className={tab === tabName ? 'selected' : ''} onClick={() => {
                                    setTab(tabName);
                                }}>
                                    {tabName}
                                </p>
                            )
                        })
                    }
                </div>
                <div className='tab'>
                    { 
                        tab === 'Console' &&
                        <>
                            {
                                reactLogMessages.map((msg: any, index: number) => {
                                    let str: string;
                                    if (typeof msg === 'string') {
                                        str = msg;
                                    }
                                    else {
                                        str = JSON.stringify(msg);
                                    }
                                    return (
                                        <p className="console-line" key={index}>
                                            {str}
                                        </p>
                                    )
                                })
                            }
                        </>
                    }
                    {
                        tab === 'Documentation' &&
                        <div className='documentation'>
                            The docs:
                            <p>
                                Elevator:
                            </p>
                            <p>
                                Building:
                            </p>
                        </div>
                    }
                    {
                        tab === 'Results' &&
                        <div className='results'>
                            <p id='title'> 
                                Level: {level + 1} <span id='nickname'>{levels[level].nickname ? `("${levels[level].nickname}")` : ''}</span>
                            </p>

                            <p>
                                Time: {time?.toFixed(2) || "0.00"}
                            </p>

                            <br />

                            <button onClick={() => {
                                setLevel(level - 1);
                                // engine.loadLevel(levels[level - 1]);
                            }} disabled={level <= 0}>
                                Previous level
                            </button>
                            <button onClick={() => {
                                setLevel(level + 1);
                                // engine.loadLevel(levels[level + 1]);
                            }} disabled={level >= levels.length - 1}>
                                Next level
                            </button>
                            <button onClick={() => {
                                engine.resetLevel();
                            }}>
                                Reset
                            </button>
                        </div>
                    }
                </div>
            </div>

            <div className='run-bar'>
                <div className='container'>
                    <button id='run-button' onClick={async () => {
                        engine.resetLevel();
                        await delay(500);
                        clearLogMessages();
                        engine.executeUserCode(props.code, (msg: any) => {
                            addLogMessage(msg);
                        });
                    }}>
                        Run Code
                    </button>
                    <button id='reset-button' onClick={() => {
                        engine.resetLevel();
                    }}>
                        Reset
                    </button>
                    <button id='stop-button' onClick={() => {
                        engine.stopCode();
                    }}>
                        Stop
                    </button>
                    <button id='speed-button' onClick={() => {
                        const newSpeed = speed % MAX_SPEED + 1;
                        setSpeed(newSpeed);
                        engine.speed = newSpeed;
                    }}>
                        {
                            speed === 1 &&
                            <>
                                <span className='on'>▶</span>
                                <span className='off'>▶▶</span>
                            </>
                        }
                        {
                            speed === 2 &&
                            <>
                                <span className='on'>▶▶</span>
                                <span className='off'>▶</span>
                            </>
                        }
                        {
                            speed === 3 &&
                            <>
                                <span className='on'>▶▶▶</span>
                            </>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
};