class Draw {
    static canvas = document.querySelector('canvas');
    static ctx = this.canvas.getContext('2d');

    static #root = document.querySelector(':root');

    static xResolution = this.canvas.width;
    static yResolution = this.canvas.height;

    static multiplier = 1;

    static font = 'Arial';

    static #bgColor = '#cccccc';

    static init() {
        this.canvas.parentElement.addEventListener('resize', this.onResize);

        this.onResize();

        this.color = '#ff0000';
        this.background = '#cccccc';
    }

    /**
     * @param {string} color 
     */
    static set color(color) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
    }

    /**
     * @param {string} color 
     */
    static set background(color) {
        if (this.#bgColor === color) {
            return;
        }
        this.#bgColor = color;
        this.#root.style.setProperty('--bg-color', color);
    }

    static onResize() {
        const boundingRect = this.canvas.parentElement.getBoundingClientRect();

        this.multiplier = Math.floor(Math.min(boundingRect.width / this.xResolution, boundingRect.height / this.yResolution));

        this.canvas.width = this.multiplier * this.xResolution;
        this.canvas.height = this.multiplier * this.yResolution;
    }

    /**
     * @param {number} a 
     * @param {number} b 
     * @param {number} c 
     * @param {number} d 
     * @param {number} e 
     * @param {number} f
     */
    static transform(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        this.ctx.setTransform(a, b, c, d, this.multiplier * e, this.multiplier * f)
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     */
    static rect(x, y, w, h) {
        this.ctx.fillRect(
            x * this.multiplier,
            y * this.multiplier,
            w * this.multiplier,
            h * this.multiplier
        );
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number[]} points - The points composing the polygon as x y pairs
     */
    static poly(x, y, points) {
        this.ctx.beginPath();
        this.ctx.moveTo(
            (points[0] + x) * this.multiplier,
            (points[1] + y) * this.multiplier
        );
        for (let i = 2; i < points.length; i += 2) {
            this.ctx.lineTo(
                (points[i] + x) * this.multiplier,
                (points[i + 1] + y) * this.multiplier
            );
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius 
     */
    static circle(x, y, radius) {
        this.ctx.beginPath();
        this.ctx.arc(
            x * this.multiplier,
            y * this.multiplier,
            radius * this.multiplier,
            0, Math.PI * 2
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} radius 
     * @param {number} thickness 
     * @param {number} start - The start position of the arc in radians 
     * @param {number} end - The end position of the arc in radians 
     */
    static arc(x, y, radius, thickness, start = 0, end = Math.PI * 2) {
        this.ctx.beginPath();
        this.ctx.arc(
            x * this.multiplier,
            y * this.multiplier,
            radius * this.multiplier,
            start, end
        );
        this.ctx.closePath();
        this.ctx.lineWidth = thickness * this.multiplier;
        this.ctx.stroke();
    }

    /**
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {number} thickness 
     */
    static line(x1, y1, x2, y2, thickness) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1 * this.multiplier, y1 * this.multiplier);
        this.ctx.lineTo(x2 * this.multiplier, y2 * this.multiplier);
        this.ctx.lineWidth = thickness * this.multiplier;
        this.ctx.stroke();
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number[]} points - The points composing the line as x y pairs
     * @param {number} thickness 
     */
    static lines(x, y, points, thickness) {
        this.ctx.beginPath();
        this.ctx.moveTo(
            (points[0] + x) * this.multiplier,
            (points[1] + y) * this.multiplier
        );
        for (let i = 2; i < points.length; i += 2) {
            this.ctx.lineTo(
                (points[i] + x) * this.multiplier,
                (points[i + 1] + y) * this.multiplier
            );
        }
        this.ctx.closePath();
        this.ctx.lineWidth = thickness * this.multiplier;
        this.ctx.stroke();
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {string} str - The displayed string
     * @param {number} size - Font size
     * @param {boolean} center - Weather the text will be centered on the x axis
     * @param {boolean} bold
     */
    static text(x, y, str, size, center = false, bold = false) {
        this.ctx.textAlign = center ? 'center' : 'left'
        this.ctx.font = `${bold?'bold ':''}${Math.round(size * this.multiplier)}px '${this.font}'`;
        this.ctx.fillText(str, x * this.multiplier, y * this.multiplier);
    }

    /**
     * @param {string} str - The measured string
     * @param {number} size - Font size
     * @param {boolean} bold 
     * @returns {TextMetrics}
     */
    static getTextSize(str, size, bold = false) {
        this.ctx.font = `${bold?'bold ':''}${size}px '${this.font}'`;
        return this.ctx.measureText(str);
    }

    /**
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     */
    static clear(x = 0, y = 0, w = this.xResolution, h = this.yResolution) {
        this.ctx.clearRect(
            x * this.multiplier,
            y * this.multiplier,
            w * this.multiplier,
            h * this.multiplier
        );
    }
}

class Key {
    /**
     * @type {Object.<string, boolean>}
     */
    static #key = {};

    /**
     * @type {Object.<string, boolean>}
     */
    static buffer = {};

    static init() {
        window.addEventListener('keyup', this.keyUp.bind(this));
        window.addEventListener('keydown', this.keyDown.bind(this));
        window.addEventListener('blur', this.unfocus.bind(this));
    }

    /**
     * @param {KeyboardEvent} event 
     */
    static keyDown(event) {
        if (event.repeat) {
            return;
        }
        let keyStr = event.key;
        if (keyStr === ' ') {
            keyStr = 'space';
        } else if (keyStr.length === 0) {
            return;
        } else {
            keyStr = keyStr.replace(/^./, keyStr.charAt(0).toLowerCase());
        }

        this[keyStr] = true;
        this.#key[keyStr] = true;
        this.buffer[keyStr] = true;
    }

    /**
     * @param {KeyboardEvent} event 
     */
    static keyUp(event) {
        let keyStr = event.key;
        if (keyStr === ' ') {
            keyStr = 'space';
        } else if (keyStr.length === 0) {
            return;
        } else {
            keyStr = keyStr.replace(/^./, keyStr.charAt(0).toLowerCase());
        }

        if (!this.#key[keyStr]) {
            return;
        }

        delete this[keyStr];
        delete this.#key[keyStr];
    }

    /**
     * @param {FocusEvent} event
     */
    static unfocus(event) {
        const keys = Object.keys(this.#key);

        for (let i = 0; i < keys.length; i++) {
            delete this[keys[i]];
            delete this.#key[keys[i]];
        }

        this.buffer = {};
    }

    /**
     * @returns {Object.<string, boolean>}
     */
    static update() {
        const temp = this.buffer;
        this.buffer = {};
        return temp;
    }
}

class Mouse {
    static container = Draw.canvas;

    static rawX = 0;
    static rawY = 0;

    static left = false;
    static right = false;

    static pressedLeft = false;
    static pressedRight = false;

    static get x() {
        return this.rawX / Draw.multiplier;
    }

    static get y() {
        return this.rawY / Draw.multiplier;
    }

    static init() {
        window.addEventListener('mousemove', this.mouseMove.bind(this));
        window.addEventListener('mousedown', this.mouseDown.bind(this));
        window.addEventListener('mouseup', this.mouseUp.bind(this));
        window.addEventListener('contextmenu', event => {
            event.preventDefault();
            return false;
        });
        window.addEventListener('blur', event => {
            this.left = false;
            this.right = false;
        });
    }

    static getRelativePos(x, y) {
        const rect = this.container.getBoundingClientRect();
        return [x - rect.left, y - rect.top];
    }

    /**
     * @param {MouseEvent} event 
     */
    static mouseMove(event) {
        const [x, y] = this.getRelativePos(event.clientX, event.clientY);
        this.rawX = x;
        this.rawY = y;
    }

    /**
     * @param {MouseEvent} event 
     */
    static mouseDown(event) {
        const [x, y] = this.getRelativePos(event.clientX, event.clientY);
        this.rawX = x;
        this.rawY = y;
        
        switch (event.button) {
            case 0:
                this.pressedLeft = true;
                this.left = true;
                break;
            case 2:
                this.pressedRight = true;
                this.right = true;
                event.preventDefault();
                return false;
            default:
                console.warn(`Unexpected mouse button pressed. Code: ${event.button}`);
        }
    }

    /**
     * @param {MouseEvent} event 
     */
    static mouseUp(event) {
        const [x, y] = this.getRelativePos(event.clientX, event.clientY);
        this.rawX = x;
        this.rawY = y;
        
        switch (event.button) {
            case 0:
                this.left = false;
                break;
            case 2:
                this.right = false;
                break;
            default:
                console.warn(`Unexpected mouse button released. Code: ${event.button}`);
        }
    }

    /**
     * @returns {Object.<string, number>}
     */
    static update() {
        const temp = {
            left: this.pressedLeft,
            right: this.pressedRight
        };

        this.pressedLeft = false;
        this.pressedRight = false;

        return temp;
    }
}

class Color {
    /**
     * @type {number}
     */
    r;
    /**
     * @type {number}
     */
    g;
    /**
     * @type {number}
     */
    b;
    /**
     * @type {number}
     */
    a;

    /**
     * @param {number} r Can alternately be of the form 0x[color]
     * @param {number} g 
     * @param {number} b 
     * @param {number} a 
     */
    constructor(r, g = NaN, b = NaN, a = 1) {
        if (isNaN(g)) {
            this.r = Math.floor(r / 65536);
            this.g = Math.floor(r / 256) % 256;
            this.b = r % 256;
            this.a = 1;
            return;
        }

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * @param {Color} color 
     * @param {number} n this * (1 - n) + color * n
     */
    blend(color, n = 0.5) {
        return new Color(
            Math.round(this.r + n * (color.r - this.r)),
            Math.round(this.g + n * (color.g - this.g)),
            Math.round(this.b + n * (color.b - this.b)),
            Math.round(this.a + n * (color.a - this.a))
        );
    }

    toString() {
        const rgb = '#' +
            this.r.toString(16).padStart(2, '0') +
            this.g.toString(16).padStart(2, '0') +
            this.b.toString(16).padStart(2, '0');
        return this.a === 1 ? rgb : rgb + this.a.toString(16).padStart(2, '0');
    }
}

Draw.init();
Key.init();
Mouse.init();