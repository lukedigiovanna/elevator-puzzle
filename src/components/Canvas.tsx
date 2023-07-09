import React from "react";

import renderer from "../core/render";

const Canvas = () => {
    const canvasRef = React.createRef<HTMLCanvasElement>();

    const resizeCanvas = () => {
        if (canvasRef.current) {
            const size = window.innerHeight;
            canvasRef.current.width = size;
            canvasRef.current.height = size;
        }
    }

    React.useEffect(() => {
        if (canvasRef.current) {
            resizeCanvas();
            renderer.setCanvas(canvasRef.current);
            renderer.render();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasRef])

    React.useEffect(() => {
        window.onload = () => {
            window.addEventListener("resize", resizeCanvas);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return  (
        <canvas ref={canvasRef} className='main-canvas' />
    )
}

export { Canvas };