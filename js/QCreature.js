import * as THREE from './libs/three.module.js';
import {Object3D, Mesh} from "./libs/three.module.js";
import {AdvancedBird, SimpleBird} from "./Geometries.js";

export class QCrowd extends Object3D {
    
    constructor({x, y, z} = {x: 10, y: 10, z: 10}) {
        super();
        this.leader = new QCreature(0, 0, 0);
        QCreature.CROWD = this;
        // this.limit = {x, y, z};
        var o = 'OK';
        
        Object.defineProperty(this, 'ovo', {
            get: () => o,
            set: (p) => o = p
        });
    }
    
    // setLimit({x = 10, y = 10, z = 10}) {
    //     this.limit = {x, y, z};
    //     QCreature.maxDist = this.limit;
    // }
    
    get limit() {
        return QCreature.maxDist;
    }
    
    set limit(p) {
        QCreature.maxDist = p;
    }
    
    
    
    add(obj) {
        if (obj.isLeader) this.leader = obj;
        super.add(obj);
    };
    
    addBoid() {
        this.add(new QCreature(0, 0, 0));
    };
    
    removeBoid() {
        if (this.children.length > 0)
            if (!this.children[this.children.length - 1].isLeader)
                this.children.pop();
    };
    
    run() {
        this.children.forEach(function (obj) {
            obj.run();
        });
    }
}


export default class QCreature extends Mesh {
    constructor(x, y, z, color = 0xff9900, isLeader = false) {
        super();
        // this.type = 'Boid';
        
        
        this.geometry = new THREE.ConeGeometry(1, 4, 8);
        this.geometry.rotateX(THREE.Math.degToRad(90));
        this.material = new THREE.MeshLambertMaterial({color: (color) ? color : 0xff0000});
        
        this.castShadow = true;
        // this.receiveShadow = true;
        
        
        
        // ---
        this.maxspeed = 0.6;
        this.maxforce = 0.2;
        
        // ---
        this.isLeader = isLeader;
        // this.centroid = new THREE.Vector3(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        this.position.set((x) ? x : 0, (y) ? y : 0, (z) ? z : 0);
        
        
        
        // Initial State
        
        
        var r1 = 1, r2 = 1, r3 = 1;
        
        r1 = (Math.random() < 0.5) ? r1 * -1 : r1;
        r2 = (Math.random() < 0.5) ? r2 * -1 : r2;
        r3 = (Math.random() < 0.5) ? r3 * -1 : r3;
        
        this.velocity.set(r1, r2, 0);
        
        // this.up = new THREE.Vector3(0, 1, 0);
        
        this.geometry.computeBoundingSphere(); // 4.5
        
        // if (QCreature.CROWD)
        //     console.log(QCreature.CROWD.children);
        
        return this;
    }
    
    
    run() {
        this.group(QCreature.CROWD);
        // this.borders();
        // this.avoidBox();
        this.do_update();
    }
    
    group(boids) {
        var ali = this.align(boids);      // Alignment
        var sep = this.separate(boids);   // Separation
        var coh = this.cohesion(boids);   // Cohesion
        
        this.applyForce(ali);
        this.applyForce(sep);
        this.applyForce(coh);
        this.applyForce(this.avoidBox());
        
    }
    
    do_update() {
        this.velocity.add(this.acceleration);
        
        this.velocity.clampScalar(-this.maxspeed, this.maxspeed);
        
        this.position.add(this.velocity);
        
        this.acceleration.multiplyScalar(0);
        
        
        
        var head = this.velocity.clone();
        head.multiplyScalar(5);
        head.add(this.position);
        this.lookAt(head);
        
    }
    
    
    // For every nearby boid in the system, calculate the average velocity
    align(crowd) {
        var ndist = 15.0;
        
        var others = crowd.children;
        var sum = new THREE.Vector3();
        var count = 0;
        for (var i = 0; i < others.length; i++) {
            var d = this.position.distanceTo(others[i].position);
            if ((d > 0) && (d < ndist)) {
                sum.add(others[i].velocity);
                count++;
            }
        }
        if (count > 0) {
            sum.divideScalar(count);
            sum.normalize();
            sum.multiplyScalar(this.maxspeed);
            
            var steer = new THREE.Vector3();
            steer.subVectors(sum, this.velocity);
            steer.clampScalar(-this.maxforce, this.maxforce);
            
            return steer;
        } else {
            return new THREE.Vector3(0, 0, 0);
        }
        
    }
    
    
    
    // Method checks for nearby boids and steers away
    separate(crowd) {
        var separation = 15.0;
        
        var others = crowd.children;
        var sum = new THREE.Vector3(0, 0, 0);
        var steer = new THREE.Vector3(0, 0, 0);
        var count = 0;
        // For every boid in the system, check if it's too close
        for (var i = 0; i < others.length; i++) {
            // if (others[i] === this) continue;
            var d = this.position.distanceTo(others[i].position);
            
            if ((d > 0) && (d < separation)) {
                var diff = new THREE.Vector3();
                diff.subVectors(this.position, others[i].position);
                diff.normalize();
                diff.divideScalar(d);
                sum.add(diff);
                count++;
            }
            
        }
        
        if (count > 0) {
            sum.divideScalar(count);
            sum.normalize();
            sum.multiplyScalar(this.maxspeed);
            
            steer.subVectors(sum, this.velocity);
        }
        
        if (steer.length() > 0) {
            steer.clampScalar(-this.maxforce, this.maxforce);
        }
        
        return steer;
    }
    
    
    // Direction of the group
    cohesion(crowd) {
        var ndist = 15.0;
        
        var others = crowd.children;
        var sum = new THREE.Vector3(0, 0, 0);
        var count = 0;
        for (var i = 0; i < others.length; i++) {
            var d = this.position.distanceTo(others[i].position);
            
            if ((d > 0) && (d < ndist)) {
                sum.add(others[i].position);
                count++;
            }
        }
        if (count > 0) {
            sum.divideScalar(count);
            return this.seek(sum);
        } else {
            return new THREE.Vector3(0, 0, 0);
        }
        
    }
    
    
    avoid(wall = new THREE.Vector3()) {
        // this.geometry.computeBoundingSphere();
        var bs = this.geometry.boundingSphere;
        
        var toMeVector = new THREE.Vector3();
        toMeVector.subVectors(this.position, wall);
        
        const distance = toMeVector.length() - bs.radius * 2;
        const steerVector = toMeVector.clone();
        steerVector.normalize();
        steerVector.multiplyScalar(1 / (Math.pow(distance, 2)));
        return steerVector;
    }
    
    avoidBox() {
        var size_x = QCreature.maxDist.x;
        var size_y = QCreature.maxDist.y;
        var size_z = QCreature.maxDist.z;
        
        const sumVector = new THREE.Vector3();
        sumVector.add(this.avoid(new THREE.Vector3(size_x, this.position.y, this.position.z)));
        sumVector.add(this.avoid(new THREE.Vector3(-size_x, this.position.y, this.position.z)));
        sumVector.add(this.avoid(new THREE.Vector3(this.position.x, size_y, this.position.z)));
        sumVector.add(this.avoid(new THREE.Vector3(this.position.x, -size_y, this.position.z)));
        sumVector.add(this.avoid(new THREE.Vector3(this.position.x, this.position.y, size_z)));
        sumVector.add(this.avoid(new THREE.Vector3(this.position.x, this.position.y, -size_z)));
        // sumVector.multiplyScalar(Math.pow(this.velocity.length(), 3));
        return sumVector;
    }
    
    
    
    seek(target) {
        var destination = new THREE.Vector3();
        destination.subVectors(target, this.position);
        destination.normalize();
        destination.multiplyScalar(this.maxspeed);
        
        var steer = new THREE.Vector3();
        steer.subVectors(destination, this.velocity);
        steer.clampScalar(-this.maxforce, this.maxforce);
        
        // console.log(steer);
        return steer;
        
    }
    
    
    applyForce(force) {
        this.acceleration.add(force);
    }
    
    centroid() {
        var others = QCreature.CROWD.children;
        
        var ndist = 10.0;
        var sum = new THREE.Vector3(0, 0, 0);
        var count = 0;
        for (var i = 0; i < others.length; i++) {
            var d = this.position.distanceTo(others[i].position);
            
            if ((d > 0) && (d < ndist)) {
                sum.add(others[i].position);
                count++;
            }
        }
        
        
        return sum;
    }
    
    
    cohesionLeader(crowd) {
        var others = crowd.children;
        
        var ndist = 50.0;
        var sum = new THREE.Vector3(0, 0, 0);
        var count = 0;
        for (var i = 0; i < others.length; i++) {
            var d = this.position.distanceTo(others[i].position);
            
            if (d < ndist) {
                sum.add(others[i].position);
                count++;
            }
        }
        if (count > 0) {
            //     sum.divideScalar(count);
            // return this.seek(leader.position);
            return new THREE.Vector3(1, 1, 1);
        } else {
            return new THREE.Vector3(1, 1, 1);
        }
        
    }
    
}

QCreature.CROWD = null;
QCreature.maxDist = {x: 30, y: 30, z: 30};













