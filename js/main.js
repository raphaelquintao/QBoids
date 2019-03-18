// Globals
var FPS = new QUtils.FPS();
var SEEKING = false;

function set_events(leader) {

    if (leader) {
        var position = leader.position;
        var rotation = leader.rotation;

        window.addEventListener('keydown', function (ev) {
            var speed = 3;
            if (ev.key === 'ArrowUp') {
                SEEKING = true;
                if (ev.ctrlKey) {
                    position.setZ(position.z + speed);
                    rotation.z = 0;
                } else {
                    position.setY(position.y + speed);
                    rotation.z = 0;
                }
            } else if (ev.key === 'ArrowDown') {
                SEEKING = true;
                if (ev.ctrlKey) {
                    position.setZ(position.z - speed);
                    rotation.z = 0;
                } else {
                    position.setY(position.y - speed);
                    rotation.z = 3.14;
                }
            } else if (ev.key === 'ArrowLeft') {
                SEEKING = true;
                position.setX(position.x - speed);
                rotation.z = 3.14 / 2;
            } else if (ev.key === 'ArrowRight') {
                SEEKING = true;
                position.setX(position.x + speed);
                rotation.z = -3.14 / 2;
            } else if (ev.key === "0") {
                position.set(0, 0, 0);
            }
        });
    }

    window.addEventListener('keyup', function (ev) {
        SEEKING = false;
        if (ev.key === "+") {
            // console.log(ev);
            crowd.addBoid();
        } else if (ev.key === "-") {
            crowd.removeBoid();
        }
    });
}

var leader = new QBoid(0, 0, 0, "#ff9900");
leader.velocity.multiplyScalar(0);
leader.isLeader = true;
set_events(leader);

var crowd = new THREE.Group();


crowd.addBoid = function () {
    var boid = new QBoid(0, 0, 0);
    this.add(boid);
    return boid;
};
crowd.removeBoid = function () {
    if (this.children.length > 0) {
        if (!this.children[this.children.length - 1].isLeader) {
            this.children.pop();
        }
    }
};
crowd.run = function () {
    this.children.forEach(function (obj) {
        obj.run();
    });
};

crowd.add(leader);


function main(holder) {
    var W = holder.clientWidth;
    var H = holder.clientHeight;
    var aspect = W / H;
    // aspect *= 0.5;

    var scene = new THREE.Scene();

    var camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 10000);
    camera.position.z = 200;

    // var camera2 = new THREE.OrthographicCamera(W / -2, W / 2, H / 2, H / -2, 0.1, 1000);
    // camera2.position.z = 200;
    // camera2.zoom = 1.9;

    var camera2 = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
    camera2.position.z = 200;
    // camera2.position.set(leader.position.x,leader.position.y,leader.position.z);

    var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});

    renderer.setClearColor(0x000000, 0);

    renderer.setSize(W, H);
    renderer.autoClear = false;

    holder.appendChild(renderer.domElement);

    console.log(W, H);

    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.castShadow = true;
    spotLight.position.set(0, 0, 200);
    scene.add(spotLight);


    // --------


    // var geometry = new THREE.BoxGeometry(1000, 500, 1000);
    // var material = new THREE.MeshPhongMaterial({color: 0xff0000, side: THREE.BackSide});
    // var cube = new THREE.Mesh(geometry, material);
    // cube.receiveShadow = true;
    // cube.rotation.x = 10 * (Math.PI/180);
    // cube.rotation.y = 50 * (Math.PI/180);
    // cube.position.z = 0;
    // cube.scale.multiplyScalar(2);
    // scene.add(cube);

    scene.add(crowd);


    // console.log(cube.position.x);

    var render = function () {
        requestAnimationFrame(render);



        crowd.run();

        camera2.lookAt(leader.position);

        renderer.clear();

        // camera.updateProjectionMatrix();
        // camera2.updateProjectionMatrix();

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
    main(content);

    FPS.appendTo(content);
};