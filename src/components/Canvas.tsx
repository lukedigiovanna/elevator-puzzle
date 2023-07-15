import React from "react";

import renderer from "../core";

const Canvas = () => {
    const canvasRef = React.createRef<HTMLCanvasElement>();

    React.useEffect(() => {
        if (canvasRef.current) {
            renderer.setCanvas(canvasRef.current);
            renderer.startLoop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef])

    return  (
        <canvas ref={canvasRef} className='main-canvas' width={1300} height={1500} />
    )
}

export { Canvas };