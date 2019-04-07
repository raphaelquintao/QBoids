import * as THREE from './libs/three.module.js';
import OrbitControls from './libs/OrbitControls.js';
import QBoid, {QCrowd} from './QBoid.js';
import QUtil from "./QUtil.js";


// Globals

function set_events(leader) {
    
    if (leader) {
        var position = leader.position;
        var rotation = leader.rotation;
        
        window.addEventListener('keydown', function (ev) {
            var speed = 3;
            if (ev.key === 'ArrowUp') {
                QBoid.SEEKING = true;
                if (ev.ctrlKey) {
                    position.setZ(position.z + speed);
                    rotation.z = 0;
                } else {
                    position.setY(position.y + speed);
                    rotation.z = 0;
                }
            } else if (ev.key === 'ArrowDown') {
                QBoid.SEEKING = true;
                if (ev.ctrlKey) {
                    position.setZ(position.z - speed);
                    rotation.z = 0;
                } else {
                    position.setY(position.y - speed);
                    rotation.z = 3.14;
                }
            } else if (ev.key === 'ArrowLeft') {
                QBoid.SEEKING = true;
                position.setX(position.x - speed);
                rotation.z = 3.14 / 2;
            } else if (ev.key === 'ArrowRight') {
                QBoid.SEEKING = true;
                position.setX(position.x + speed);
                rotation.z = -3.14 / 2;
            } else if (ev.key === "0") {
                position.set(0, 0, 0);
            }
        });
    }
    
    window.addEventListener('keyup', function (ev) {
        QBoid.SEEKING = false;
        if (ev.key === "+") {
            // console.log(ev);
            crowd.addBoid();
        } else if (ev.key === "-") {
            crowd.removeBoid();
        }
    });
}


var crowd = new QCrowd();

var leader = new QBoid(0, 0, 0, "#ff9900");
leader.isLeader = true;
// set_events(leader);

crowd.add(leader);


set_events();


// ------------------------
var FPS = new QUtil.FPS();


function main(holder, debug) {
    var canvas = new QUtil.Canvas(holder, debug);
    
    var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, canvas: canvas.el});
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.w, canvas.h, false);
    renderer.autoClear = false;
    
    
    // - Cameras
    
    var camera = new THREE.PerspectiveCamera(45, canvas.aspect, 0.1, 10000);
    camera.position.z = 200;
    
    var controls = new OrbitControls(camera);
    
    // var camera2 = new THREE.OrthographicCamera(W / -2, W / 2, H / 2, H / -2, 0.1, 1000);
    // camera2.position.z = 200;
    // camera2.zoom = 1.9;
    
    var camera2 = new THREE.PerspectiveCamera(75, canvas.aspect, 0.1, 10000);
    camera2.position.z = 200;
    // camera2.position.set(leader.position.x,leader.position.y,leader.position.z);
    
    
    // - Scene
    var scene = new THREE.Scene();
    
    
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.castShadow = true;
    spotLight.position.set(0, 0, 200);
    scene.add(spotLight);
    
    
    // - Cube
    
    QBoid.maxDist = {x: 100, y: 50, z: 50};
    
    
    var geometry = new THREE.BoxGeometry(QBoid.maxDist.x * 2, QBoid.maxDist.y * 2, QBoid.maxDist.z * 2);
    var material = new THREE.MeshPhongMaterial({
        color: 0xfcd4eb, transparent: true,
        // color: 0xfcd4eb, transparent: true,
        side: THREE.BackSide, opacity: 1
    });
    
    var cube = new THREE.Mesh(geometry, material);
    cube.receiveShadow = true;
    
    // cube.rotation.x = 10 * (Math.PI / 180);
    // crowd.rotation.x = 10 * (Math.PI / 180);
    
    cube.rotation.y = 50 * (Math.PI / 180);
    crowd.rotation.y = 50 * (Math.PI / 180);
    
    
    scene.add(cube);
    
    scene.add(crowd);
    
    
    window.addEventListener('resize', ev => canvas.updateSize());
    
    // console.log(cube.position.x);
    
    var render = function () {
        requestAnimationFrame(render);
        
        
        crowd.run();
        
        // camera2.lookAt(leader.position);
        
        renderer.clear();
        
        // camera.updateProjectionMatrix();
        // camera2.updateProjectionMatrix();
        
        controls.update();
        // renderer.setViewport(0, 0, W / 2, H);
        renderer.render(scene, camera);
        
        // renderer.setViewport(W / 2, 0, W / 2, H);
        // renderer.render(scene, camera2);
        
        FPS.update();
    };
    
    render();
}


window.onload = function () {
    var content = document.getElementById('content');
    var debug2 = document.getElementById('debug2');
    
    main(content, debug2);
    
    FPS.appendTo(content);
};