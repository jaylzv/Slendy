import { Application } from '../../common/engine/Application.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

import { Physics } from './Physics.js';
import { FirstPersonController } from '../../common/engine/FirstPersonController.js';

// Iskoristeno za teleportiranjeto na slendy sekoi nekolku sekundi
var tajm = 0;
var trFlag = 0; // Translation flag

// Player x and y
var px;
var py;

var papersFound = 0;

class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/part2/part2.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        this.camera = await this.loader.loadNode('Camera');
        this.collider = await this.loader.loadNode('Collider');

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
    }

    //quad.rotateY
    // pogledaj dokumentacija za quat
    // this.slenderman.rotation = quat.create(quad.rotateY

    update(time, dt){
        this.controller.update(dt);
        this.physics.update(dt);

        px = this.collider.translation[0];
        py = this.collider.translation[2];

        // Slenderman timed teleportation and rotation
        tajm += 0.001;
        
        if (tajm%3 >= 0 && tajm%3 <= 0.001){
            console.log("x: " + px + " y: " + py);
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
        
    }

    render() {
        this.renderer.render(this.scene, this.camera);
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
