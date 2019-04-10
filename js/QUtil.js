class FPS {
    /**
     * FPS Monitor
     * @param mode
     * @param minimalist
     * @returns {FPS}
     */
    constructor(mode = 0, minimalist = true) {
        this.beginTime = Date.now();
        this.prevTime = this.beginTime;
        this.frames = 0;
        this.fps = 0;
        this.ms = 0;
        let min = Infinity, max = 0;
        
        mode %= 3;
        
        const dom = document.createElement('div');
        
        const css = {
            position: 'absolute',
            top: 0, right: 0,
            margin: '5px',
            padding: '5px 7px',
            borderRadius: '5px',
            whiteSpace: 'pre',
            fontFamily: '"Dejavu Sans Mono", monospace',
            fontSize: '16px',
            color: '#111',
            background: 'hsla(0, 0%, 80%, 0.8)',
            userSelect: 'none',
            mozUserSelect: 'none',
            webkitUserSelect: 'none',
            cursor: 'pointer',
            textAlign: 'right'
        };
        
        if (minimalist) {
            css.backgroundColor = 'transparent';
            css.color = '#ffffff';
            css.textShadow = '0 1px 2px rgba(0, 0, 0, 1)';
            css.opacity = 0.5;
            css.margin = "3px";
            css.fontSize = '13px';
            // css.fontFamily = 'Helvetica, Arial, sans-serif';
        }
        
        dom.onclick = e => {
            e.stopPropagation();
            mode = (mode + 1) % 3;
            this.doupdate();
        };
        
        for (let prop in css) dom.style[prop] = css[prop];
        
        
        this.doupdate = () => {
            min = Math.min(min, this.fps);
            max = Math.max(max, this.fps);
            
            let text = `${this.fps} FPS`;
            
            if (mode >= 1) text = `(${min}-${max}) ${this.fps} FPS`;
            if (mode >= 2) text += `\n${this.ms} MS `;
            
            dom.innerText = text;
        };
        
        
        this.doupdate();
        
        this.dom = dom;
    }
    
    appendTo(element) {
        element.appendChild(this.dom);
        return this;
    }
    
    update() {
        this.beginTime = this.end();
    }
    
    setStyle(style) {
        if (style !== undefined) for (let prop in style)
            if (style.hasOwnProperty(prop)) this.dom.style[prop] = style[prop];
        return this;
    }
    
    end() {
        this.frames++;
        const time = Date.now();
        this.ms = (time - this.beginTime);
        if (time > this.prevTime + 1000) {
            this.fps = Math.round((this.frames * 1000) / (time - this.prevTime));
            this.doupdate();
            this.prevTime = time;
            this.frames = 0;
        }
        return time;
    }
    
    begin() {
        this.beginTime = Date.now();
    }
}

class Canvas {
    /**
     * Canvas and container manipulator.
     *
     * @param {HTMLElement} container
     * @param {HTMLElement} debugDom
     * @returns {Canvas}
     */
    constructor(container, debugDom) {
        const element = document.createElement('Canvas');
        
        this.domDebug = (debugDom !== undefined) ? debugDom : null;
        this.container = container;
        
        /**
         * The canvas element.
         * @type {HTMLCanvasElement}
         */
        this.el = element;
        this.w = 0;
        this.h = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.aspect = 0;
        this.offsetLeft = 0;
        this.offsetTop = 0;
        
        this.container.appendChild(this.el);
        
        
        this.updateSize();
    }
    
    updateSize() {
        this.w = this.el.parentElement.clientWidth;
        this.h = this.el.parentElement.clientHeight;
        
        this.el.width = this.w;
        this.el.height = this.h;
        this.aspect = this.w / this.h;
        this.centerX = this.w / 2;
        this.centerY = this.h / 2;
        const offset = this.el.getBoundingClientRect();
        this.offsetLeft = offset.left;
        this.offsetTop = offset.top;
        if (this.domDebug !== null) {
            this.domDebug.innerText = "W: " + this.w + "\nH: " + this.h + "\nA: " + this.aspect.toFixed(4);
            this.domDebug.innerText += "\n\nOL: " + this.offsetLeft + "\nOT: " + this.offsetTop;
        }
        
        return this;
    }
}

class Camera {
    
    /**
     * Z position based on height
     * @param cam
     * @param height
     * @return {number}
     */
    distance(cam, height) {
        return height / 2 / Math.tan(Math.PI * cam.fov / 360);
    }
    
    /**
     * Current camera view size based on z position.
     * @param {THREE.Camera} cam
     * @param {number} dist
     * @param {boolean} log
     * @return {{w: number, h: number, a: number, d: number}}
     */
    viewSize(cam, dist, log) {
        if (log === undefined) log = false;
        
        var vFOV = cam.fov * Math.PI / 180;        // convert vertical fov to radians
        var height = 2 * Math.tan(vFOV / 2) * dist; // visible height
        
        var aspect = cam.aspect;
        var width = height * aspect;                  // visible width
        
        if (log) console.log("W: ", width, "\nH: ", height, "\nA: ", aspect, "\nD: ", dist);
        
        return {
            w: width,
            h: height,
            a: aspect,
            d: dist
        }
    }
    
}

export default {FPS, Canvas, Camera};



