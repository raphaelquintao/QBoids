function QBoid(x, y, z, color) {
    THREE.Mesh.call(this);
    this.geometry = new THREE.ConeGeometry(5, 5, 32);
    // this.geometry = new THREE.SphereGeometry(5, 7, 7);
    this.material = new THREE.MeshPhongMaterial({color: (color) ? color : 0xff0000});
    this.castShadow = true;

    // ---
    this.isLeader = false;
    this.seeking = SEEKING;
    this.centroid = new THREE.Vector3();

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.maxspeed = 0.3;
    this.maxforce = 0.5;

    this.position.set((x) ? x : 0, (y) ? y : 0, (z) ? z : 0);

    var r1 = (Math.random() + 0.001) * 100;
    var r2 = (Math.random() + 0.001) * 100;

    if (!this.isLeader)
        this.velocity.set(r1, r2, 0);


    this.run = function () {
        if (!this.isLeader)
            this.group(crowd);
        this.do_update();
        this.borders();
    };

    this.applyForce = function (force) {
        this.acceleration.add(force);
    };

    this.group = function (boids) {
        var ali = this.align(boids);      // Alignment
        var sep = this.separate(boids);   // Separation
        var coh = this.cohesion(boids);   // Cohesion

        this.applyForce(ali);
        this.applyForce(sep);
        this.applyForce(coh);

        // this.centroid = ali;

    };

    this.do_update = function () {
        this.velocity.add(this.acceleration);
        if (SEEKING) this.velocity.clampScalar(-2, 2);
        else this.velocity.clampScalar(-this.maxspeed, this.maxspeed);

        this.position.add(this.velocity);
        this.rotation.x = leader.rotation.x;
        this.rotation.y = leader.rotation.y;
        this.rotation.z = leader.rotation.z;
        this.acceleration.multiplyScalar(0);
    };

    this.borders = function () {
        var width = 200;
        var height = 100;

        if (this.position.x < -width) this.velocity.x *= -1;
        if (this.position.y < -height) this.velocity.y *= -1;
        if (this.position.x > width) this.velocity.x *= -1;
        if (this.position.y > height) this.velocity.y *= -1;
    };

    this.align = function (crowd) {
        var others = crowd.children;
        var ndist = 5000.0;
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

    };

    this.separate = function (crowd) {
        var others = crowd.children;

        var separation = 15.0;
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
    };


    this.cohesion = function (crowd) {
        var others = crowd.children;

        var ndist = 300.0;
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
            return this.seek(leader.position);
        } else {
            return new THREE.Vector3(1, 1, 1);
        }

    };

    this.cohesionOriginal = function (crowd) {
        var others = crowd.children;

        var ndist = 300.0;
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

    };

    this.seek = function (target) {
        var desired = new THREE.Vector3();
        desired.subVectors(target, this.position);
        desired.normalize();

        var steer = new THREE.Vector3();
        steer = desired;
        // steer.subVectors(desired, this.velocity);
        steer.clampScalar(-this.maxforce, this.maxforce);

        // console.log(steer);
        return steer;

    };
}


QBoid.prototype = Object.create(THREE.Mesh.prototype);














