const log = (message) => {
    postMessage({
        action: 'log',
        data: {
            message
        }
    });
};

// console.log = log;

let waitingOnElevator = false;

const elevator = {
    goto: (target) => {
        postMessage({
            action: 'elevator-goto',
            data: {
                elevatorNumber: 0,
                destination: target
            }
        });
        waitingOnElevator = true;
        while (waitingOnElevator);
    }
}

onmessage = (e) => {
    console.log(e)

    const { action } = e.data;    

    switch (action) {
        case 'execute-code':
            const userCode = e.data.value;
            eval(userCode);
            postMessage({
                action: 'terminate'
            })
            break;
        case 'elevator-landed':
            console.log('landed');
            waitingOnElevator = false;
            break;
    }
};
  