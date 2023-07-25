const log = (message) => {
    postMessage({
        action: "log",
        args: [message]
    });
};

console.log = log;



onmessage = (e) => {
    const userCode = e.data;    
    eval(userCode);
};
  