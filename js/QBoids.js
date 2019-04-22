import * as THREE from "./libs/three.module.js";
import {TrianglesDrawMode} from "./libs/three.module.js";
import {Mesh} from "./libs/three.module.js";
import {Group} from "./libs/three.module.js";
import {Object3D} from "./libs/three.module.js";


export class QBoids extends Object3D {
    
    constructor() {
        super();
        this.config = {
            separation: 15,
            alignment: 15,
            cohesion: 15,
            maxspeed: 0.6,
            maxforce: 0.15,
            bounds: {x: 50, y: 50, z: 50}
        };
        
        this.leader = new QFly(0, 0, 0, '#ff8ccf');
        this.leader.isLeader = true;
        this.add(this.leader);
        
    }
    
    get count(){
        return this.children.length;
    }
    
    add(boid = new QBoids()) {
        boid.config = this.config;
        // this.children.push(boid);
        super.add(boid);
        return boid;
    }
    
    addRandom() {
        let {x, y, z} = this.config.bounds;
        
        let r1 = (Math.random() > 0.5) ? x : -x;
        let r2 = (Math.random() > 0.5) ? y : -y;
        let r3 = (Math.random() > 0.5) ? z : -z;
        
        // let r1 = Math.random();
        // let r2 = Math.random();
        // let r3 = Math.random();
        
        // r1 = Math.floor(r1 * Math.random());
        // r2 = Math.floor(r2 * Math.random());
        // r3 = Math.floor(r3 * Math.random());
        
        const boid = new QFly(r1, r2, r3);
        this.add(boid);
        return boid;
    }
    
    removeRandom() {
        if (this.children.length > 0)
            if (!this.children[this.children.length - 1].isLeader)
                this.children.pop();
    }
    
    addVarious(count = 10){
        for (let x = 0; x < count; x++) this.addRandom();
    }
    
    removeVarious(count = 10){
        for (let x = 0; x < count; x++) this.removeRandom();
    }
    
    update() {
        this.children.forEach(boid => {
            const sep = this.separate(boid);   // Separation
            const ali = this.align(boid);      // Alignment
            const coh = this.cohesion(boid);   // Cohesion
            
            const avoid = this.avoidBox(boid);
            
            boid.applyForce(sep);
            boid.applyForce(ali);
            boid.applyForce(coh);
            
            boid.applyForce(avoid);
            
            boid.update();
        });
    }
    
    
    
    separate(boid) {
        const others = this.children;
        const {maxspeed, maxforce, separation} = this.config;
        
        const sum = new THREE.Vector3();
        const steer = new THREE.Vector3();
        let count = 0;
        
        // For every boid in the system, check if it's too close
        for (let i = 0; i < others.length; i++) {
            const d = boid.position.distanceTo(others[i].position);
            
            if ((d > 0) && (d < separation)) {
                var diff = new THREE.Vector3();
                diff.subVectors(boid.position, others[i].position);
                diff.normalize();
                diff.divideScalar(d);
                sum.add(diff);
                count++;
            }
        }
        
        if (count > 0) {
            sum.divideScalar(count);
            sum.normalize();
            sum.multiplyScalar(maxspeed);
            
            steer.subVectors(sum, boid.velocity);
        }
        
        if (steer.length() > 0) {
            steer.clampScalar(-maxforce, maxforce);
        }
        
        return steer;
    }
    
    align(boid) {
        const others = this.children;
        const {maxspeed, maxforce, alignment} = this.config;
        
        const sum = new THREE.Vector3();
        const steer = new THREE.Vector3();
        let count = 0;
        for (let i = 0; i < others.length; i++) {
            const d = boid.position.distanceTo(others[i].position);
            if ((d > 0) && (d < alignment)) {
                sum.add(others[i].velocity);
                count++;
            }
        }
        if (count > 0) {
            sum.divideScalar(count);
            sum.normalize();
            sum.multiplyScalar(maxspeed);
            
            steer.subVectors(sum, boid.velocity);
            steer.clampScalar(-maxforce, maxforce);
        }
        
        return steer;
    }
    
    cohesion(boid) {
        const others = this.children;
        const {maxspeed, maxforce, cohesion} = this.config;
        
        const sum = new THREE.Vector3(0, 0, 0);
        let count = 0;
        for (let i = 0; i < others.length; i++) {
            const d = boid.position.distanceTo(others[i].position);
            
            if ((d > 0) && (d < cohesion)) {
                sum.add(others[i].position);
                count++;
            }
        }
        if (count > 0) {
            sum.divideScalar(count);
            return this.seek(boid, sum);
        } else {
            return new THREE.Vector3(0, 0, 0);
        }
    }
    
    avoid(boid, wall = new THREE.Vector3()) {
        const radius = boid.geometry.boundingSphere.radius;
        
        const toMeVector = new THREE.Vector3();
        toMeVector.subVectors(boid.position, wall);
        
        const distance = toMeVector.length() - radius * 2;
        const steerVector = toMeVector.clone();
        steerVector.normalize();
        steerVector.multiplyScalar(1 / (Math.pow(distance, 2)));
        return steerVector;
    }
    
    avoidBox(boid) {
        const {bounds} = this.config;
        
        const sumVector = new THREE.Vector3();
        sumVector.add(this.avoid(boid, new THREE.Vector3(bounds.x, boid.position.y, boid.position.z)));
        sumVector.add(this.avoid(boid, new THREE.Vector3(-bounds.x, boid.position.y, boid.position.z)));
        sumVector.add(this.avoid(boid, new THREE.Vector3(boid.position.x, bounds.y, boid.position.z)));
        sumVector.add(this.avoid(boid, new THREE.Vector3(boid.position.x, -bounds.y, boid.position.z)));
        sumVector.add(this.avoid(boid, new THREE.Vector3(boid.position.x, boid.position.y, bounds.z)));
        sumVector.add(this.avoid(boid, new THREE.Vector3(boid.position.x, boid.position.y, -bounds.z)));
        // sumVector.multiplyScalar(Math.pow(this.velocity.length(), 3));
        return sumVector;
    }
    
    seek(boid, target = new THREE.Vector3()) {
        const {maxspeed, maxforce} = this.config;
        
        const destination = new THREE.Vector3();
        destination.subVectors(target, boid.position);
        destination.normalize();
        destination.multiplyScalar(maxspeed);
        
        const steer = new THREE.Vector3();
        steer.subVectors(destination, boid.velocity);
        steer.clampScalar(-maxforce, maxforce);
        
        // console.log(steer);
        return steer;
    }
    
    
    centroid(pos = new THREE.Vector3()) {
        const others = this.children;
        const sum = new THREE.Vector3(0, 0, 0);
        let count = 0;
        for (let i = 0; i < others.length; i++) {
            const d = pos.distanceTo(others[i].position);
            
            if ((d > 0)) {
                sum.add(others[i].position);
                count++;
            }
        }
        
        if (count > 0) {
            return sum.divideScalar(count);
        } else {
            return new THREE.Vector3(0, 0, 0);
        }
    }
}


export class QFly extends Mesh {
    // constructor({x, y, z, color} = {x: 0, y: 0, z: 0, color: 0xff9900}) {
    
    constructor(x, y, z, color = 0xFF9900) {
        super();
        this.geometry = new THREE.ConeGeometry(1, 4, 8);
        this.geometry.rotateX(THREE.Math.degToRad(90));
        this.geometry.computeBoundingSphere();
        this.material = new THREE.MeshLambertMaterial({color: color});
        
        this.drawMode = TrianglesDrawMode;
        this.updateMorphTargets();
        
        this.geometry.computeBoundingSphere();
        
        this.isLeader = false;
        
        this.config = {
            separation: 15,
            alignment: 15,
            cohesion: 15,
            maxspeed: 0.6,
            maxforce: 0.2,
            bounds: {x: 50, y: 50, z: 50}
        };
        
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        // this.position = new THREE.Vector3();
        
        const r1 = 1 * (Math.random() > 0.5) ? 1 : -1;
        const r2 = 1 * (Math.random() > 0.5) ? 1 : -1;
        const r3 = 1 * (Math.random() > 0.5) ? 1 : -1;
        
        this.velocity.set(r1, r2, r3);
        
        
        
        return this;
    }
    
    
    applyForce(force) {
        this.acceleration.add(force);
    }
    
    
    
    update() {
        this.velocity.add(this.acceleration);
        
        this.velocity.clampScalar(-this.config.maxspeed, this.config.maxspeed);
        
        this.position.add(this.velocity);
        this.acceleration.multiplyScalar(0.1);
        
        
        const head = this.velocity.clone();
        head.multiplyScalar(this.geometry.boundingSphere.radius * 2 + 1);
        head.add(this.position);
        this.lookAt(head);
    }
    
}
