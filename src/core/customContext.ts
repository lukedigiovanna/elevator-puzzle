interface CustomContext extends CanvasRenderingContext2D {
    fillRoundedRect(x: number, y: number, width: number, height: number, radius: number): void;
    strokeRoundedRect(x: number, y: number, width: number, height: number, radius: number): void;
    fillEquilateralTriangle(x: number, y: number, size: number, flipVertically?: boolean): void;
}

function makeCustomContext(ctx: CanvasRenderingContext2D): CustomContext {
    const _this = ctx as CustomContext;

    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
        _this.beginPath();
        _this.moveTo(x + radius, y);
        _this.lineTo(x + width - radius, y);
        _this.arcTo(x + width, y, x + width, y + radius, radius);
        _this.lineTo(x + width, y + height - radius);
        _this.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        _this.lineTo(x + radius, y + height);
        _this.arcTo(x, y + height, x, y + height - radius, radius);
        _this.lineTo(x, y + radius);
        _this.arcTo(x, y, x + radius, y, radius);
        _this.closePath();
    }

    _this.fillRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
        drawRoundedRect(x, y, width, height, radius);
        _this.fill();
    }

    _this.strokeRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
        drawRoundedRect(x, y, width, height, radius);
        _this.stroke();
    }

    _this.fillEquilateralTriangle = (x: number, y: number, size: number, flipVertically: boolean=false) => {
        const height = (Math.sqrt(3) / 2) * size;
  
        const sign = flipVertically ? -1 : 1;
        const offset = flipVertically ? height : 0;

        _this.beginPath();
        _this.moveTo(x, y + offset);
        _this.lineTo(x + size / 2, y + sign * height + offset);
        _this.lineTo(x - size / 2, y + sign * height + offset);
        _this.closePath();
  
        _this.fill();
    }

    return _this;
}

export type { CustomContext };
export { makeCustomContext };