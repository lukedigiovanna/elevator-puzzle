import engine from "../core";
import React from "react";
import { Level } from "../core/levels";
import levels from "../core/levels";

const tabs = ['Results', 'Console', 'Documentation'];

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
                        <div className='console'>
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
                                        <p key={index}>
                                            {str}
                                        </p>
                                    )
                                })
                            }
                        </div>
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
                            Run your script to see results.
                        </div>
                    }
                </div>
            </div>

            <div className='run-bar'>
                <div className='container'>
                    <button onClick={() => {
                        clearLogMessages();
                        setTab('Results');
                        engine.executeUserCode(props.code, (msg: any) => {
                            addLogMessage(msg);
                        });
                    }}>
                        Run Code
                    </button>
                </div>
            </div>
        </div>
    )
};