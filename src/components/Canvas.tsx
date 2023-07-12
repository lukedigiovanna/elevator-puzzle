import React from "react";

import renderer from "../core";

const Canvas = () => {
    const canvasRef = React.createRef<HTMLCanvasElement>();

    // const resizeCanvas = () => {
    //     if (canvasRef.current) {
    //         const size = window.innerHeight;
    //         canvasRef.current.width = size * 2;
    //         canvasRef.current.height = size * 2;
    //     }
    // }

    React.useEffect(() => {
        if (canvasRef.current) {
            // resizeCanvas();
            renderer.setCanvas(canvasRef.current);
            renderer.startLoop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef])

    // React.useEffect(() => {
    //     window.onload = () => {
    //         window.addEventListener("resize", resizeCanvas);
    //     };
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    return  (
        <canvas ref={canvasRef} className='main-canvas' width={1500} height={1500} />
    )
}

export { Canvas };