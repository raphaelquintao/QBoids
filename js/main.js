import * as THREE from './libs/three.module.js';
import OrbitControls from './libs/OrbitControls.js';
import QUtil from "./QUtil.js";
import { QFly, QBoids } from "./QBoids.js";
import { Mesh } from "./libs/three.module.js";
import * as dat from './libs/dat.gui.module.js';
import { MeshLambertMaterial } from "./libs/three.module.js";
import { TrianglesDrawMode } from "./libs/three.module.js";

class Cube extends Mesh {
    
    constructor(limit) {
        super();
        
        this.geometry = new THREE.BoxGeometry(limit.x * 2, limit.y * 2, limit.z * 2, 16);
        // this.geometry = new THREE.SphereGeometry(limit.z *2);
        
        this.material = new MeshLambertMaterial({
            transparent: true,
            depthTest: true,
            depthWrite: true,
            side: THREE.BackSide,
            // side: THREE.FrontSide,
            // emissive: 0xff9900,
            color: 0xffffff,
            opacity: 1,
            reflectivity: 0.9,
            refractionRatio: 1
        });
        
        // this.drawMode = TrianglesDrawMode;
        this.updateMorphTargets();
        
        // this.material = new THREE.MeshStandardMaterial({color: 0xfcd4eb, side: THREE.BackSide});
        
        
        // this.material.color = new THREE.Color(0x595469);
        // this.material.color = new THREE.Color(0xfcd4eb);
        // this.material.color = new THREE.Color(0x5D487E);
        
        
        this.receiveShadow = true;
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
        console.log(`Thee.js - ${THREE.REVISION}`);
        this.overControls = false;
        this.objects = [];
        this.cameras = [];
        
        this.Boids = new QBoids();
        this.infoTop = document.getElementById('infoTop');
        this.infoCam = document.getElementById('infoCam');
        
        this.shadow = true;
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
        
        this.gui = new dat.GUI({autoPlace: false, name: 'QBoids '});
        this.gui.domElement.style.float = 'left';
        
        controls.append(this.gui.domElement);
        controls.addEventListener("mouseenter", ev => {
            this.overControls = true;
        });
        controls.addEventListener("mouseleave", ev => {
            this.overControls = false;
        });
        
        
        
        
        
        window.addEventListener('resize', ev => {
            console.log(`Resize`);
            this.Canvas.updateSize();
            
            this.renderer.setSize(this.Canvas.w, this.Canvas.h);
            
            this.cameras.forEach(cam => {
                /** @type {PerspectiveCamera} */
                cam.aspect = this.Canvas.aspect;
                cam.updateProjectionMatrix();
            });
            
        });
        
    }
    
    createScene() {
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: this.Canvas.el});
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.Canvas.w, this.Canvas.h, false);
        // this.renderer.autoClear = false;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.scene = new THREE.Scene();
    }
    
    createLights() {
        var light = new THREE.SpotLight(0xffffff, 0.2);
        this.shadow_light = light;
        // var light = new THREE.PointLight(0xffffff, 0.8, 1000);
        light.castShadow = true;
        light.position.set(0, 0, 300);
        // light.shadow.bias = 0.1;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 1000;
        this.scene.add(light);
        
        
        let point = new THREE.PointLight(0xff9900, 0.8);
        // point.position.set(0, 0, 300);
        // this.scene.add(point);
        
        
        let ambient = new THREE.AmbientLight(0xffffff, 0.4);
        // let ambient = new THREE.AmbientLight(0x000000, 1);
        this.scene.add(ambient);
    }
    
    createWorld() {
        this.Boids.config.bounds = {x: 250, y: 125, z: 125};
        
        this.add(this.Boids);
        
        this.box = new Cube(this.Boids.config.bounds);
        
        this.add(this.box);
        
        // for (let x = 0; x < 20; x++) this.Boids.addRandom();
        
        for (let x = 0; x < 10; x++) {
            setTimeout(() => {
                for (let x = 0; x < 10; x++) this.Boids.addRandom();
            }, 1000 * x);
        }
        
        // Gui
        const gui = this.gui;
        
        let general = this.gui.addFolder('General');
        // general.open();
        
        general.add({
            Shadow: () => {
                this.shadow_light.castShadow = !this.shadow_light.castShadow;
                this.Boids.castshadow = this.shadow_light.castShadow;
            }
        }, 'Shadow');
        
        let colors = {
            "White": () => {
                this.box.material.color = new THREE.Color(0xffffff);
            },
            'Pink': () => {
                this.box.material.color = new THREE.Color(0xfcd4eb);
            },
            'Purple': () => {
                this.box.material.color = new THREE.Color(0x5D487E);
            }
        };
        // for (const key in colors) {
        //     general.add(colors, key);
        // }
        
        
        var palette = {
            'Box Color': [this.box.material.color.r * 255, this.box.material.color.g * 255, this.box.material.color.b * 255], // CSS string
        };
        let color = general.addColor(palette, 'Box Color');
        
        color.onChange(value => {
            this.box.material.color = new THREE.Color(value[0] / 255, value[1] / 255, value[2] / 255);
            // this.box.material.color = new THREE.Color(value.replace(/#/, '0x'))
            console.log(value);
        });
        
        
        let opt = this.gui.addFolder('Options');
        opt.open();
        
        
        let sep = opt.add({separation: this.Boids.config.separation}, 'separation', 1, 50, 1);
        let ali = opt.add({alignment: this.Boids.config.alignment}, 'alignment', 1, 50, 1);
        let coe = opt.add({cohesion: this.Boids.config.cohesion}, 'cohesion', 1, 50, 1);
        let spd = opt.add({maxspeed: this.Boids.config.maxspeed}, 'maxspeed', 0.1, 2, 0.1);
        let frc = opt.add({maxforce: this.Boids.config.maxforce}, 'maxforce', 0.1, 5, 0.01);
        
        sep.onChange(value => {
            this.Boids.config.separation = value;
        });
        
        ali.onChange(value => {
            this.Boids.config.alignment = value;
        });
        
        coe.onChange(value => {
            this.Boids.config.cohesion = value;
        });
        
        spd.onChange(value => {
            this.Boids.config.maxspeed = value;
        });
        
        frc.onChange(value => {
            this.Boids.config.maxforce = value;
        });
        
        let actions = {
            'Add 1': () => {
                this.Boids.addRandom();
            },
            'Add 10': () => {
                this.Boids.addVarious(10);
            },
            'Remove 1': () => {
                this.Boids.removeRandom();
            },
            'Remove 10': () => {
                this.Boids.removeVarious(10);
            }
        };
        
        let acts = this.gui.addFolder('Actions');
        for (let actionsKey in actions) {
            acts.add(actions, actionsKey);
        }
        
    }
    
    createCameras() {
        // var infoCam = document.getElementById('infoCam');
        
        
        const camStatic = new THREE.PerspectiveCamera(45, this.Canvas.aspect, 0.1, 10000);
        camStatic.name = "Static";
        camStatic.info = "Overview Camera";
        camStatic.position.z = 500;
        this.controls = new OrbitControls(camStatic);
        this.controls.enableKeys = false;
        this.controls.enabled = false;
        camStatic.action = () => {
            this.controls.enabled = !this.overControls;
        };
        
        this.cameras[0] = camStatic;
        
        
        
        
        
        var camBoid = new THREE.PerspectiveCamera(45, this.Canvas.aspect, 0.1, 10000);
        camBoid.name = "Stare Centroid";
        camBoid.info = "Follow flock and look at its centroid";
        camBoid.position.z = 200;
        camBoid.up = new THREE.Vector3(0, 1, 0);
        camBoid.action = () => {
            // let myb = this.Boids.children[this.Boids.children.length - 1];
            // camBoid.position.set(myb.position.clone());
            camBoid.lookAt(this.Boids.centroid());
            // camBoid.position.z = QUtil.Camera.distance(camBoid, 100);
            
            // this.Boids.children;
            // console.log(this.Boids.boundingBox);
        };
        
        this.cameras[1] = camBoid;
        
        
        
        
        
        const camLeader = new THREE.PerspectiveCamera(45, this.Canvas.aspect, 0.1, 10000);
        camLeader.name = "Look Leader";
        camLeader.info = "Follow leader and look at his position";
        camLeader.position.z = 200;
        camLeader.up = new THREE.Vector3(0, 1, 0);
        camLeader.action = () => {
            camLeader.lookAt(this.Boids.leader.position);
            // let npos = this.Boids.leader.position.clone();
            // camLeader.position.set(npos.subScalar(10));
        };
        
        this.cameras[2] = camLeader;
        
        
        
        const camCentroid = new THREE.PerspectiveCamera(45, this.Canvas.aspect, 0.1, 10000);
        camCentroid.name = "Fixed Centroid";
        camCentroid.info = "Fixed on center and looking at flock centroid";
        camCentroid.position.z = 0;
        camCentroid.up = new THREE.Vector3(0, 1, 0);
        camCentroid.action = () => {
            camCentroid.lookAt(this.Boids.centroid());
        };
        
        this.cameras[3] = camCentroid;
        
        // this.cameras[4] = camStatic;
        
        
        
        
        
        this.currentCam = 0;
        
        
        let cams = this.gui.addFolder('Cameras');
        cams.open();
        
        this.cameras.forEach((value, index) => {
            let action = {};
            action[value.name] = () => {
                this.currentCam = index;
            };
            
            cams.add(action, value.name);
        });
        
    };
    
    
    createEvents() {
        
        window.addEventListener('keydown', (ev) => {
            if (this.overControls) return;
            if (ev.key === "q") {
                // this.controls.enabled = true;
                // document.body.style.cursor = "move";
            } else if (ev.key === "r") {
                this.controls.reset();
                
                
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
            if (this.overControls) return;
            if (ev.key === "q") {
                // this.controls.enabled = false;
                // document.body.style.cursor = "default";
            } else if (ev.key === "+" || ev.key === "=") {
                if (ev.shiftKey) this.Boids.addVarious(10);
                else this.Boids.addRandom();
            } else if (ev.key === "-") {
                if (ev.shiftKey) this.Boids.removeVarious(10);
                else this.Boids.removeRandom();
                
            } else if (ev.key === "0") {
                this.currentCam = 0;
            } else if (ev.key === "1") {
                this.currentCam = 1;
            } else if (ev.key === "2") {
                this.currentCam = 2;
            } else if (ev.key === "3") {
                this.currentCam = 3;
            }
        });
        
        window.addEventListener('wheel', ev => {
            if (this.overControls) return;
            
            /** @type {PerspectiveCamera} */
            let cam = this.cameras[this.currentCam];
            
            if (ev.deltaY > 0) {
                // console.log('Scroll Down');
                cam.zoom -= 0.1;
            } else {
                // console.log('Scroll Up');
                cam.zoom += 0.1;
            }
            if (cam.zoom < 1) cam.zoom = 1;
            
            cam.updateProjectionMatrix();
            
        });
        
    }
    
    /**
     * @param {HTMLElement} el
     * @param {string} text
     */
    set_text(el, text) {
        if (el.innerText !== text) {
            el.innerText = text;
        }
    }
    
    /**
     * @param {HTMLElement} el
     * @param {string} text
     */
    set_html(el, text) {
        if (el.innerHTML !== text) {
            el.innerHTML = text;
        }
    }
    
    render() {
        requestAnimationFrame(() => this.render());
        
        this.renderer.clear();
        
        this.objects.forEach(obj => {
            if (obj.update) obj.update();
        });
        
        
        let cam = this.cameras[this.currentCam];
        if (cam.action) cam.action();
        
        
        
        this.set_html(this.infoCam, `${cam.name}<span><br>${cam.info}</span>`);
        
        this.set_text(this.infoTop, `${this.Boids.count} Boids`);
        
        
        this.renderer.render(this.scene, cam);
        
        this.FPS.update();
    }
    
    add(mesh) {
        this.objects.push(mesh);
        this.scene.add(mesh);
    }
}


var app = new Application();


window.focus();












