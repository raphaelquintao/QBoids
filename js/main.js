import * as THREE from './libs/three.module.js';
import OrbitControls from './libs/OrbitControls.js';
import QUtil from "./QUtil.js";
import {QFly, QBoids} from "./QBoids.js";
import {Mesh} from "./libs/three.module.js";
import * as dat from './libs/dat.gui.module.js';
import {MeshLambertMaterial} from "./libs/three.module.js";
import {TrianglesDrawMode} from "./libs/three.module.js";

class Cube extends Mesh {
    
    constructor(limit) {
        super();
        
        this.geometry = new THREE.BoxGeometry(limit.x * 2, limit.y * 2, limit.z * 2, 16);
        
        this.material = new MeshLambertMaterial({
            transparent: true,
            depthTest: true,
            depthWrite: true,
            side: THREE.DoubleSide,
            emissive: 0x000000,
            color: 0x2194CE,
            opacity: 0.4,
            reflectivity: 0.9,
            refractionRatio: 1
        });
        
        this.drawMode = TrianglesDrawMode;
        this.updateMorphTargets();
        
        // this.material = new THREE.MeshStandardMaterial({color: 0xfcd4eb, side: THREE.BackSide});
        
        // this.material.color = new THREE.Color(0x007289);
        
        
        // this.receiveShadow = true;
        // this.castShadow = true;
        
    }
    
    
    update() {
        // this.rotation.x += 0.00;
        // this.rotation.y += 0.001
    }
}

function FizzyText() {
    this.message = 'dat.gui';
    this.speed = 0.6;
    this.displayOutline = false;
}

class Application {
    constructor() {
        this.objects = [];
        this.cameras = [];
        
        this.Boids = new QBoids();
        this.debug2 = document.getElementById('debug2');
        
        this.currentCam = 0;
        this.createCanvas();
        this.createScene();
        this.createWorld();
        this.createLights();
        this.createCameras();
        this.createEvents();
        this.render();
        
    }
    
    createCanvas() {
        var content = document.getElementById('content');
        var debug = document.getElementById('debug');
        var controls = document.getElementById('controls');
        
        this.FPS = new QUtil.FPS().appendTo(content);
        this.Canvas = new QUtil.Canvas(content, debug);
        
        this.gui = new dat.GUI({autoPlace: false});
        this.gui.domElement.style.float = 'left';
        controls.append(this.gui.domElement);
        controls.addEventListener("mouseenter", ev => {
            this.controls.enableRotate = false;
        });
        controls.addEventListener("mouseleave", ev => {
            this.controls.enableRotate = true;
        });
        
        
        
        let text = new FizzyText();
        
        // let sep = gui.add(text, 'separation', 0, 2);
        // sep.onChange(value => {
        //     this.Boids.config.separation = value;
        // });
        //
        // let alig = gui.add(text, 'alignment', 0, 2);
        // alig.onChange(value => {
        //     this.Boids.config.alignment = value;
        // });
        //
        // let coer = gui.add(text, 'cohesion', 0, 2);
        // coer.onChange(value => {
        //     this.Boids.config.cohesion = value;
        // });
        
        // this.gui.add(text, 'speed', 0, 2);
        
      
        
        window.addEventListener('resize', ev => {
            console.log(`Resize`);
            this.Canvas.updateSize();
            
            this.renderer.setSize(this.Canvas.w, this.Canvas.h);
            
            
        });
        
    }
    
    createScene() {
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: this.Canvas.el});
        // this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.Canvas.w, this.Canvas.h, false);
        // this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.scene = new THREE.Scene();
    }
    
    createLights() {
        // var light = new THREE.SpotLight(0xffffff, 1);
        var light = new THREE.PointLight(0xffffff, 0.8, 1000);
        light.castShadow = true;
        light.position.set(0, 10, 180);
        // light.shadow.bias = 0.1;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 200000;
        // this.scene.add(light);
        
        
        let point = new THREE.PointLight(0xffffff, 0.3);
        this.scene.add(point);
        
        
        let ambient = new THREE.AmbientLight(0xffffff, 0.5);
        // let ambient = new THREE.AmbientLight(0x000000, 1);
        this.scene.add(ambient);
    }
    
    createWorld() {
        this.Boids.config.bounds = {x: 100, y: 50, z: 50};
        
        this.scene.add(this.Boids);
        
        this.add(new Cube(this.Boids.config.bounds));

        for (let x = 0; x < 10; x++) this.Boids.addRandom();
        
       // Gui
    
    
        let sep = this.gui.add({message:"separation", separation: this.Boids.config.separation, displayOutline: false}, 'separation',1, 50);
        let alig = this.gui.add({message:"alignment", alignment: this.Boids.config.alignment, displayOutline: false}, 'alignment',1, 50);
        let coer =this.gui.add({message:"cohesion", cohesion: this.Boids.config.cohesion, displayOutline: false}, 'cohesion',1, 50);
        let s =this.gui.add({message:"speed", maxspeed: this.Boids.config.maxspeed, displayOutline: false}, 'maxspeed',0, 10);
        let f =this.gui.add({message:"force", maxforce: this.Boids.config.maxforce, displayOutline: false}, 'maxforce',0, 10);

        sep.onChange(value => {
            this.Boids.config.separation = value;
        });

        alig.onChange(value => {
            this.Boids.config.alignment = value;
        });

        coer.onChange(value => {
            this.Boids.config.cohesion = value;
        });
        
        
    }
    
    createCameras() {
        var debug2 = document.getElementById('debug2');
        
        
        var camera = new THREE.PerspectiveCamera(45, this.Canvas.aspect, 0.1, 10000);
        camera.name = "Static";
        camera.position.z = 200;
        this.controls = new OrbitControls(camera);
        this.controls.enableKeys = false;
        this.controls.enabled = false;
        camera.action = () => {
            this.controls.enabled = true;
        };
        
        this.cameras[0] = camera;
        
        
        
        
        
        var c2 = new THREE.PerspectiveCamera(45, this.Canvas.aspect, 0.1, 200);
        c2.name = "Im Boid";
        c2.up = new THREE.Vector3(1, 1, 1);
        c2.action = () => {
            let myb = this.Boids.children[this.Boids.children.length - 1];
            c2.position.set(myb.position.clone());
            c2.lookAt(this.Boids.centroid());
        };
        
        
        // this.Boids.add(c2);
        
        this.cameras[1] = c2;
        
        
        
        const camCentroid = new THREE.PerspectiveCamera(45, this.Canvas.aspect, 0.1, 10000);
        camCentroid.name = "Cam centroid";
        camCentroid.position.z = 0;
        camCentroid.up = new THREE.Vector3(0, 1, 0);
        camCentroid.action = () => {
            camCentroid.lookAt(this.Boids.centroid());
        };
        
        this.cameras[2] = camCentroid;
        
        
        
        const c3 = new THREE.PerspectiveCamera(45, this.Canvas.aspect, 0.1, 10000);
        c3.name = "Cam Leader";
        c3.position.z = 0;
        c3.up = new THREE.Vector3(0, 1, 0);
        c3.action = () => {
            c3.lookAt(this.Boids.leader.position);
            let npos = this.Boids.leader.position.clone();
            c3.position.set(npos.subScalar(10));
        };
        
        this.cameras[3] = c3;
    
    
        this.cameras[4] = camera;
        
        
        
        
        
        this.currentCam = 0;
    };
    
    
    createEvents() {
        
        window.addEventListener('keydown', (ev) => {
            if (ev.key === "q") {
                // this.controls.enabled = true;
                // document.body.style.cursor = "move";
            } else if (ev.key === "w") {
                // this.controls.reset();
                // document.body.style.cursor = "default";
                
                
            } else if (ev.key === 'ArrowUp') {
                this.Boids.leader.applyForce(new THREE.Vector3(0, 10, 0));
            } else if (ev.key === 'ArrowDown') {
                this.Boids.leader.applyForce(new THREE.Vector3(0, -10, 0));
            } else if (ev.key === 'ArrowLeft') {
                this.Boids.leader.applyForce(new THREE.Vector3(-10, 0, 0));
            } else if (ev.key === 'ArrowRight') {
                this.Boids.leader.applyForce(new THREE.Vector3(10, 0, 0));
                
            }
        });
        
        window.addEventListener('keyup', (ev) => {
            if (ev.key === "q") {
                // this.controls.enabled = false;
                // document.body.style.cursor = "default";
            } else if (ev.key === "+") {
                if (ev.shiftKey)
                    for (let x = 0; x < 10; x++) this.Boids.addRandom();
                else this.Boids.addRandom();
            } else if (ev.key === "-") {
                if (ev.shiftKey)
                    for (let x = 0; x < 10; x++) this.Boids.removeRandom();
                else this.Boids.removeRandom();
                
                
            } else if (ev.key === "0") {
                this.currentCam = 0;
            } else if (ev.key === "1") {
                this.currentCam = 1;
            } else if (ev.key === "2") {
                this.currentCam = 2;
            } else if (ev.key === "3") {
                this.currentCam = 3;
            } else if (ev.key === "4") {
                this.currentCam = 4;
            }
        });
        
    }
    
    render() {
        requestAnimationFrame(() => this.render());
        
        this.renderer.clear();
        
        this.objects.forEach(obj => {
            if (obj.update) obj.update();
        });
        
        this.Boids.update();
        
        // this.controls.update();
        
        // this.cameras[1].lookAt(this.crowd.leader.position);
        
        // this.cameras[2].lookAt(this.crowd.leader.centroid());
        let cam = this.cameras[this.currentCam];
        if (cam.action) cam.action();
        
        this.debug2.innerText = cam.name;
        
        this.renderer.render(this.scene, cam);
        
        this.FPS.update();
    }
    
    add(mesh) {
        this.objects.push(mesh);
        this.scene.add(mesh);
    }
}


var app = new Application();















