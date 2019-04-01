var QUtil = {};

/**
 * FPS Monitor.
 * @return {QUtil.FPS}
 * @class
 */
QUtil.FPS = function FPS(minimalist_design) {
    if (minimalist_design === undefined) minimalist_design = true;
    var beginTime = Date.now(), prevTime = beginTime, frames = 0;
    var fps = 0, ms = 0;
    var min = Infinity, max = 0;

    var dom = document.createElement('div');

    var css = {
        position: 'absolute',
        margin: '5px',
        backgroundColor: 'rgba(225, 225, 225, 0.952941)',
        padding: '5px 7px',
        borderRadius: '5px',
        whiteSpace: 'pre',
        fontFamily: 'Consolas, monospace',
        fontSize: '16px',
        top: 0,
        right: 0,
        pointerEvents: 'none',
        color: "#000"
    };

    if (minimalist_design) {
        css.backgroundColor = 'transparent';
        css.color = '#ffffff';
        css.textShadow = '0 1px 3px rgba(0, 0, 0, 0.9)';
        css.opacity = 0.4;
        css.margin = "3px";
        css.fontSize = '12px';
        css.fontFamily = 'Roboto, Helvetica, Arial, sans-serif';
    }

    for (var prop in css) dom.style[prop] = css[prop];

    if (minimalist_design) dom.innerText = fps + ' FPS';
    else dom.innerText = 'FPS: ' + fps + ' (' + min + '-' + max + ")\n MS: " + ms;

    function update() {
        min = Math.min(min, fps);
        max = Math.max(max, fps);
        if (minimalist_design) dom.innerText = fps + ' FPS';
        else dom.innerText = 'FPS: ' + fps + ' (' + min + '-' + max + ")\n MS: " + ms;
    }


    /* PUBLIC */

    this.dom = dom;

    this.begin = function () {
        beginTime = Date.now();
    };

    this.end = function () {
        frames++;
        var time = Date.now();
        ms = (time - beginTime);
        if (time > prevTime + 1000) {
            fps = Math.round((frames * 1000) / (time - prevTime));
            update();
            prevTime = time;
            frames = 0;
        }
        return time;
    };

    this.update = function () {
        beginTime = this.end();
    };

    /**
     *
     * @param {HTMLElement} element
     * @return {QUtil.FPS}
     */
    this.appendTo = function (element) {
        element.appendChild(this.dom);
        return this;
    };

    /**
     * Set Custom Style.
     * @param style
     * @return {QUtil.FPS}
     */
    this.setStyle = function (style) {
        if (style !== undefined) for (var prop in style)
            if (style.hasOwnProperty(prop)) dom.style[prop] = style[prop];
        return this;
    };

    return this;
};

/**
 * Canvas and container manipulator.
 * @return {QUtil.Canvas}
 * @class
 * @param {HTMLElement} container
 * @param {HTMLElement} debugDom
 */
QUtil.Canvas = function Canvas(container, debugDom) {
    var element = document.createElement('canvas');

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


    /**
     * Refresh.
     * @return {QUtil.Canvas}
     */
    this.updateSize = function () {
        this.w = this.el.parentElement.clientWidth;
        this.h = this.el.parentElement.clientHeight;
        this.el.width = this.w;
        this.el.height = this.h;
        this.aspect = this.w / this.h;
        this.centerX = this.w / 2;
        this.centerY = this.h / 2;
        var offset = this.el.getBoundingClientRect();
        this.offsetLeft = offset.left;
        this.offsetTop = offset.top;
        if (this.domDebug !== null) {
            this.domDebug.innerText = "W: " + this.w + "\nH: " + this.h + "\nA: " + this.aspect.toFixed(4);
            this.domDebug.innerText += "\n\nOL: " + this.offsetLeft + "\nOT: " + this.offsetTop;
        }

        return this;
    };


    this.updateSize();

    return this;
};





export default QUtil;

