import * as THREE from './libs/three.module.js';
import {Object3D, Mesh} from "./libs/three.module.js";

export class QCrowd extends Object3D {
    
    constructor() {
        super();
        QBoid.CROWD = this;
    }
    
    addBoid() {
        this.add(new QBoid(0, 0, 0));
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


export default class QBoid extends Mesh {
    constructor(x, y, z, color, isLeader = false) {
        super();
        // this.type = 'Boid';
        
        
        // this.geometry = new THREE.ConeGeometry(2, 3, 16);
        this.geometry = new THREE.SphereGeometry(1, 4, 4);
        this.material = new THREE.MeshPhongMaterial({color: (color) ? color : 0xff0000});
        this.castShadow = true;
        
        // ---
        this.maxspeed = 0.6;
        this.maxforce = 0.1;
        
        // ---
        this.isLeader = isLeader;
        this.centroid = new THREE.Vector3();
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.acceleration = new THREE.Vector3(0, 0, 0);
        
        // Initial State
        
        this.position.set((x) ? x : 0, (y) ? y : 0, (z) ? z : 0);
        
        var r1 = 1, r2 = 1, r3 = 1;
        
        r1 = (Math.random() < 0.5) ? r1 * -1 : r1;
        r2 = (Math.random() < 0.5) ? r2 * -1 : r2;
        r3 = (Math.random() < 0.5) ? r3 * -1 : r3;
        
        this.velocity.set(r1, r2, r3);
        
        
        return this;
    }
    
    
    run() {
        // if (!this.isLeader)
        this.group(QBoid.CROWD);
        this.do_update();
        this.borders();
    }
    
    group(boids) {
        var ali = this.align(boids);      // Alignment
        var sep = this.separate(boids);   // Separation
        var coh = this.cohesion(boids);   // Cohesion
        
        this.applyForce(ali);
        this.applyForce(sep);
        this.applyForce(coh);
        
        // this.centroid = ali;
        
    }
    
    do_update() {
        this.velocity.add(this.acceleration);
        this.velocity.clampScalar(-this.maxspeed, this.maxspeed);
        
        
        this.position.add(this.velocity);
        
        this.acceleration.multiplyScalar(0);
        
        
        // var x= new THREE.Object3D();
        
        // this.rotation.x = leader.rotation.x;
        // this.rotation.y = leader.rotation.y;
        // this.rotation.z = leader.rotation.z;
    }
    
    borders() {
        var size_x = QBoid.maxDist.x;
        var size_y = QBoid.maxDist.y;
        var size_z = QBoid.maxDist.z;
        
        
        if (this.position.x < -size_x) this.velocity.x *= -1;
        if (this.position.x > size_x) this.velocity.x *= -1;
        if (this.position.y < -size_y) this.velocity.y *= -1;
        if (this.position.y > size_y) this.velocity.y *= -1;
        if (this.position.z > size_z) this.velocity.z *= -1;
        if (this.position.z < -size_z) this.velocity.z *= -1;
        
    }
    
    align(crowd) {
        var others = crowd.children;
        var ndist = 10.0;
        var sum = new THREE.Vector3(0, 0, 0);
        var count = 0;
        for (var i = 0; i < others.length; i++) {
            var d = this.position.distanceTo(others[i].position);
            
            if ((d < ndist)) {
                // if (others[i] && others[i].velocity) {
                sum.add(others[i].velocity);
                count++;
                // }
            }
        }
        if (count > 0) {
            sum.divideScalar(count);
            sum.normalize();
            // sum.multiplyScalar(this.maxspeed);
            var steer = new THREE.Vector3();
            steer.subVectors(sum, this.velocity);
            
            return steer;
        } else {
            return new THREE.Vector3(1, 1, 1);
        }
        
    }
    
    separate(crowd) {
        var others = crowd.children;
        
        var separation = 5.0;
        var steer = new THREE.Vector3(0, 0, 0);
        var count = 0;
        for (var i = 0; i < others.length; i++) {
            var d = this.position.distanceTo(others[i].position);
            
            
            if ((d < separation)) {
                // var diff = this.position.sub(others[i].position);
                var diff = new THREE.Vector3();
                diff.subVectors(this.position, others[i].position);
                // diff.normalize();
                // diff.divideScalar(d);
                diff.multiplyScalar(d);
                steer.add(diff);
                count++;
            }
            
        }
        
        if (count > 0) {
            steer.divideScalar(count);
        }
        
        // if (steer.manhattanLength() > 0) {
        //     steer.normalize();
        //     // steer.multiplyScalar(this.maxspeed);
        //     steer.sub(this.velocity);
        //     steer.clampScalar(-this.maxforce, this.maxforce);
        // }
        
        return steer;
    }
    
    cohesion(crowd) {
        var others = crowd.children;
        
        var ndist = 20.0;
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
            sum.divideScalar(count);
            return this.seek(sum);
        } else {
            return new THREE.Vector3(0, 0, 0);
        }
        
    }
    
    
    seek(target) {
        var desired = new THREE.Vector3();
        desired.subVectors(target, this.position);
        desired.normalize();
        
        var steer = new THREE.Vector3();
        // steer = desired;
        steer.subVectors(desired, this.velocity);
        steer.clampScalar(-this.maxforce, this.maxforce);
        
        // console.log(steer);
        return steer;
        
    }
    
    
    applyForce(force) {
        this.acceleration.add(force);
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

QBoid.CROWD = null;
QBoid.maxDist = {x: 100, y: 50, z: 50};













