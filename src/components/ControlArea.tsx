import engine from "../core";
import React from "react";
import levels from "../core/levels";
import { sleep } from "../utils/timeutils";

const tabs = ['Results', 'Console', 'Documentation'];

const MAX_SPEED = 3;

const MAX_LOG_MESSAGES = 250;

export const ControlArea = (props: {code: string}) => {
    const [reactLogMessages, setReactLogMessages] = React.useState<any[]>([]);
    const logMessages: any[] = [];
    const addLogMessage = (msg: any) => {
        logMessages.push(msg);
        if (logMessages.length > MAX_LOG_MESSAGES) {
            logMessages.shift();
        }
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

    const [time, setTime] = React.useState<number>(0)
    const [running, setRunning] = React.useState<boolean>(false);

    React.useEffect(() => {
        engine.setObserver({
            setTime,
            setRunning
        })
    }, []);

    return (
        <div className='control-area'>
            <div className='info-region'>
                <div className='navbar'>
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
                        <div id='console' onWheel={() => { 
                            console.log('scrolling');
                        }}>
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
                        </div>
                    }
                    {
                        tab === 'Documentation' &&
                        <div id='documentation'>
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
                        <div id='results'>
                            <p id='title'> 
                                Level: {level + 1} <span id='nickname'>{levels[level].nickname ? `("${levels[level].nickname}")` : ''}</span>
                            </p>

                            <p id='pass-time'>
                                Pass Time: {levels[level].passTime}s
                            </p>

                            <div id='status'>
                                <p>
                                    <span className='title'>Time:</span> <span className={time >= levels[level].passTime ? 'over-time' : ''}>{time.toFixed(2)}</span>
                                </p>
                                <p>
                                    <span className='title'>Remaining:</span> {levels[level].people.length}
                                </p>
                            </div>

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
                        </div>
                    }
                </div>
            </div>

            <div className='run-bar'>
                <div className='container'>
                    <button id='run-button' disabled={running} onClick={async () => {
                        engine.resetLevel();
                        await sleep(250);
                        clearLogMessages();
                        engine.executeUserCode(props.code, (msg: any) => {
                            addLogMessage(msg);
                        });
                    }}>
                        Run Code
                    </button>
                    <button id='reset-button' disabled={running} onClick={() => {
                        engine.resetLevel();
                    }}>
                        Reset
                    </button>
                    <button id='stop-button' disabled={!running} onClick={() => {
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