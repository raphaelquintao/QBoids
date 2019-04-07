import * as THREE from './libs/three.module.js';
import OrbitControls from './libs/OrbitControls.js';
import QUtil from "./QUtil.js";
import QBoid, {QCrowd} from "./QBoid.js";

class Cube extends THREE.Mesh {
    constructor(size) {
        super();
        this.geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
        this.material = new THREE.MeshPhongMaterial({
            color: 0x00ff00
        });
        
    }
    
    run() {
        this.rotation.x += 0.01;
        this.rotation.y += 0.01;
    }
    
}

class Application {
    constructor() {
        this.objects = [];
        this.FPS = new QUtil.FPS();
        this.createCanvas();
        this.createScene();
        this.createCameras();
        this.createLights();
        this.render();
        
    }
    
    createCanvas() {
        var content = document.getElementById('content');
        var debug2 = document.getElementById('debug2');
        
        this.FPS.appendTo(content);
        this.canvas = new QUtil.Canvas(content, debug2);

        
        
        // window.addEventListener('resize', ev => this.canvas.updateSize());
        content.ontransitionend = (ev) => this.canvas.updateSize();
    }
    
    createScene() {
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: this.canvas.el});
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.canvas.w, this.canvas.h, false);
        this.renderer.autoClear = false;
        
        this.scene = new THREE.Scene();
    }
    
    createCameras() {
        this.camera = new THREE.PerspectiveCamera(45, this.canvas.aspect, 0.1, 10000);
        this.camera.position.z = 200;
    };
    
    createLights() {
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.castShadow = true;
        spotLight.position.set(0, 0, 200);
        
        this.scene.add(spotLight);
    }
    
    render() {
        requestAnimationFrame(() => this.render());
        
        this.objects.forEach(object => object.run());
        
        this.renderer.render(this.scene, this.camera);
        
        this.FPS.update();
    }
    
    add(mesh) {
        this.objects.push(mesh);
        this.scene.add(mesh);
    }
}


var app = new Application();

app.add(new Cube({width: 10, height: 10, depth: 10}));

var crowd = new QCrowd();
crowd.add(new QBoid(0, 0, 0, "#ff9900", true));
app.add(crowd);