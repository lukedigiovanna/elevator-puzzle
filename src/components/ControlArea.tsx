import engine from "../core";
import React from "react";

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

    return (
        <div className='control-area'>

            <button onClick={() => {
                clearLogMessages();
                engine.executeUserCode(props.code, (msg: any) => {
                    addLogMessage(msg);
                });
            }}>
                Run Code
            </button>

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
        </div>
    )
};