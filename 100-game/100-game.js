import { Application } from '../../common/engine/Application.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

import { Physics } from './Physics.js';
import { FirstPersonController } from '../../common/engine/FirstPersonController.js';

import { Node } from '../common/engine/Node.js';

import { quat } from '../lib/gl-matrix-module.js';

// Iskoristeno za teleportiranjeto na slendy sekoi nekolku sekundi
var tajm = 0;
var trFlag = 0; // Translation flag
var rotacija;

// Player x and y
var px;
var py;
// Slenderman x and y
var sx;
var sy;

var papersFound = 0;

// Iskoristeno za slendy koga te love
var slTime = 0;
// 1 if caught
var caught = 0;

// ANIMALS
// Wolf x and y
var wolfWay = 0;
var wx;
var wy;
var wz;
// Fox x and y
var foxWay = 0;
var fx;
var fy;
var fz;
// Horse x and y
var horseWay = 0;
var hx;
var hy;
var hz;
// Fox x and y
var catWay = 0;
var cx;
var cy;
var cz;

class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/part2/part2.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        this.camera = await this.loader.loadNode('Camera');
        this.collider = await this.loader.loadNode('Collider');
        this.light =  await this.loader.loadNode('Light');
        
        this.light.rotation = this.camera.rotation;    
        this.light.intensity = 0.5;
        this.light.attenuation = [0.001, 0, 0.3];
        this.light.color = [255, 255, 255];

        if (!this.scene || !this.camera) {
            throw new Error('Scene or Camera not present in glTF');
        }

        if (!this.camera.camera) {
            throw new Error('Camera node does not contain a camera reference');
        }

        this.renderer = new Renderer(this.gl);
        this.renderer.prepareScene(this.scene);

        this.controller = new FirstPersonController(this.collider, this.gl.canvas);
        this.physics = new Physics(this.scene);

        this.slenderman = await this.loader.loadNode('Slenderman');

        this.paper1 = await this.loader.loadNode('Paper1');
        this.paper2 = await this.loader.loadNode('Paper2');
        this.paper3 = await this.loader.loadNode('Paper3');
        this.paper4 = await this.loader.loadNode('Paper4');

        this.wolf = await this.loader.loadNode('Wolf');
        this.fox = await this.loader.loadNode('Fox');
        this.horse = await this.loader.loadNode('Horse');
        this.cat = await this.loader.loadNode('Cat');
    }

    // quat.rotateY
    // pogledaj dokumentacija za quat
    // this.slenderman.rotation = quat.create(quad.rotateY

    update(time, dt){
        this.controller.update(dt);
        this.physics.update(dt);
        this.light.translation = this.collider.translation;

        px = this.collider.translation[0];
        py = this.collider.translation[2];

        sx = this.slenderman.translation[0];
        sy = this.slenderman.translation[2];

        wx = this.wolf.translation[0];
        wy = this.wolf.translation[2];
        wz = this.wolf.translation[1];

        fx = this.fox.translation[0];
        fy = this.fox.translation[2];
        fz = this.fox.translation[1];

        hx = this.horse.translation[0];
        hy = this.horse.translation[2];
        hz = this.horse.translation[1];

        cx = this.cat.translation[0];
        cy = this.cat.translation[2];
        cz = this.cat.translation[1];

        // Slenderman timed teleportation and rotation
        tajm += 0.001;
        
        if (tajm%3 >= 0 && tajm%3 <= 0.001){
            console.log("x: " + px + " y: " + py);
            // Reset the timer for slenderman catching you when he teleports
            slTime = 0.01;
            // Teleportation
            if (trFlag == 0){
                var randx = Math.floor(Math.random() * 10);
                var randz = Math.floor(Math.random() * 10);
                this.slenderman.translation = [this.collider.translation[0] + randx, 0, this.collider.translation[2] + randz];
                trFlag = Math.floor(Math.random() * 4);
            } else if (trFlag == 1){
                var randx = Math.floor(Math.random() * 10);
                var randz = Math.floor(Math.random() * 10);
                this.slenderman.translation = [this.collider.translation[0] - randx, 0, this.collider.translation[2] - randz];
                trFlag = Math.floor(Math.random() * 4) + 1;
            } else if (trFlag == 2){
                var randx = Math.floor(Math.random() * 10);
                var randz = Math.floor(Math.random() * 10);
                this.slenderman.translation = [this.collider.translation[0] + randx, 0, this.collider.translation[2] - randz];
                trFlag = Math.floor(Math.random() * 4) + 1;
            } else if (trFlag == 3){
                var randx = Math.floor(Math.random() * 10);
                var randz = Math.floor(Math.random() * 10);
                this.slenderman.translation = [this.collider.translation[0] - randx, 0, this.collider.translation[2] + randz];
                trFlag = Math.floor(Math.random() * 4) + 1;
            } else if (trFlag == 4){
                // Repeated as the first step
                var randx = Math.floor(Math.random() * 10);
                var randz = Math.floor(Math.random() * 10);
                this.slenderman.translation = [this.collider.translation[0] + randx, 0, this.collider.translation[2] + randz];
                trFlag = Math.floor(Math.random() * 4) + 1;
            }

            // Rotation
            // if (px < 0 && py < 0){
            //     this.slenderman.rotation = [1, 0, 0, 0.5];
            // }
        }

        // Finding the papers
        // When we find the paper, it goes below the map
        // Paper1
        if ((px >= -5.5 && px <= -4.5) && (py <= -28.5 && py >= -29.5) && (this.paper1.translation[1] == 1)){
            console.log("Found the first paper!");
            papersFound += 1;
            console.log("Papers found: " + papersFound);
            this.paper1.translation = [-5.5, -5, -28.5];
        }
        // Paper2
        if ((px >= -29.6 && px <= -28.5) && (py <= 5.5 && py >= 4.5) && (this.paper2.translation[1] == 1)){
            console.log("Found the second paper!");
            papersFound += 1;
            console.log("Papers found: " + papersFound);
            this.paper2.translation = [-29, -5, 5];
        }
        if ((px <= 25 && px >= 24) && (py >= 18.6 && py <= 19) && (this.paper3.translation[1] == 1)){
            console.log("Found the third paper!");
            papersFound += 1;
            console.log("Papers found: " + papersFound);
            this.paper3.translation = [24.5, -5, 19];
        }
        if ((px >= 29.2 && px <= 29.8) && (py >= -18.5 && py <= -17.5) && (this.paper4.translation[1] == 1)){
            console.log("Found the fourth paper!");
            papersFound += 1;
            console.log("Papers found: " + papersFound);
            this.paper4.translation = [29.4, -5, -18];
        }
        
        // Slender catching you
        if ((px <= sx + 2.5 && px >= sx - 2.5) && (py <= sy + 2.5 && py >= sy - 2.5)){
            slTime += 0.001;
            if (slTime%1.4 >= 0 && slTime%1.4 <= 0.001){
                caught = 1;
                console.log("Slendy caught you!")
            }
        }

        // Animals moving
        // Wolf moving
        if (wolfWay == 0){
            this.wolf.translation = [wx, wz, wy + 0.01];
            if (wy >= 15){
                wolfWay = 1;
            }
        } else if (wolfWay == 1){
            this.wolf.translation = [wx, wz, wy - 0.01];
            if (wy <= -14){
                wolfWay = 0;
            }
        }
        // Fox moving
        if (foxWay == 0){
            this.fox.translation = [fx + 0.01, fz, fy];
            if (fx >= 16){
                foxWay = 1;
            }
        } else if (foxWay == 1){
            this.fox.translation = [fx - 0.01, fz, fy];
            if (fx <= -2.5){
                foxWay = 0;
            }
        }
        // Horse moving
        if (horseWay == 0){
            this.horse.translation = [hx, hz, hy + 0.01];
            if (hy >= 12){
                horseWay = 1;
            }
        } else if (horseWay == 1){
            this.horse.translation = [hx, hz, hy - 0.01];
            if (hy <= -14){
                horseWay = 0;
            }
        }
        // Cat moving
        if (catWay == 0){
            this.cat.translation = [cx + 0.01, cz, cy];
            if (cx >= 12){
                catWay = 1;
            }
        } else if (catWay == 1){
            this.cat.translation = [cx - 0.01, cz, cy];
            if (cx <= -6){
                catWay = 0;
            }
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera, this.light);
    }

    resize(width, height) {
        this.camera.camera.aspect = width / height;
        this.camera.camera.updateProjectionMatrix();
    }

}

const canvas = document.querySelector('canvas');
const app = new App(canvas);
await app.init();
document.querySelector('.loader-container').remove();