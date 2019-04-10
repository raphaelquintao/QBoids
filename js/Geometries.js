import {Geometry, Face3, Vector3, BufferAttribute, BufferGeometry, Color} from './libs/three.module.js';

export class SimpleBird extends Geometry {
    constructor() {
        super();
        
        this.v(5, 0, 0);
        this.v(-5, -2, 1);
        this.v(-5, 0, 0);
        this.v(-5, -2, -1);
        
        this.v(0, 2, -6);
        this.v(0, 2, 6);
        this.v(2, 0, 0);
        this.v(-3, 0, 0);
        
        this.f3(0, 2, 1);
        // this.f3( 0, 3, 2 );
        
        this.f3(4, 7, 6);
        this.f3(5, 6, 7);
        
        this.computeFaceNormals();
        
    }
    
    v(x, y, z) {
        this.vertices.push(new Vector3(x, y, z));
    }
    
    f3(a, b, c) {
        this.faces.push(new Face3(a, b, c));
    }
    
}


export class AdvancedBird extends BufferGeometry {
    
    constructor() {
        var WIDTH = 32;
        var BIRDS = WIDTH * WIDTH;
        
        var triangles = BIRDS * 3;
        var points = triangles * 3;
        super();
        var vertices = new BufferAttribute(new Float32Array(points * 3), 3);
        var birdColors = new BufferAttribute(new Float32Array(points * 3), 3);
        var references = new BufferAttribute(new Float32Array(points * 2), 2);
        var birdVertex = new BufferAttribute(new Float32Array(points), 1);
        this.addAttribute('position', vertices);
        this.addAttribute('birdColor', birdColors);
        this.addAttribute('reference', references);
        this.addAttribute('birdVertex', birdVertex);
        this.addAttribute('normal', new Float32Array(points * 3), 3);
        var v = 0;
        
        function verts_push() {
            for (var i = 0; i < arguments.length; i++) {
                vertices.array[v++] = arguments[i];
            }
        }
        
        var wingsSpan = 20;
        for (var f = 0; f < BIRDS; f++) {
            // Body
            verts_push(
                0, -0, -20,
                0, 4, -20,
                0, 0, 30
            );
            // Left Wing
            verts_push(
                0, 0, -15,
                -wingsSpan, 0, 0,
                0, 0, 15
            );
            // Right Wing
            verts_push(
                0, 0, 15,
                wingsSpan, 0, 0,
                0, 0, -15
            );
        }
        for (var v = 0; v < triangles * 3; v++) {
            var i = ~~(v / 3);
            var x = (i % WIDTH) / WIDTH;
            var y = ~~(i / WIDTH) / WIDTH;
            var c = new Color(
                0x444444 +
                ~~(v / 9) / BIRDS * 0x666666
            );
            birdColors.array[v * 3 + 0] = c.r;
            birdColors.array[v * 3 + 1] = c.g;
            birdColors.array[v * 3 + 2] = c.b;
            references.array[v * 2] = x;
            references.array[v * 2 + 1] = y;
            birdVertex.array[v] = v % 9;
        }
        this.scale(0.2, 0.2, 0.2);
        
    }
}

