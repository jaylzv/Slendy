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
    }

    //quad.rotateY
    // pogledaj dokumentacija za quat
    // this.slenderman.rotation = quat.create(quad.rotateY

    update(time, dt){
        this.controller.update(dt);
        this.physics.update(dt);

        // Slenderman timed teleportation and rotation
        tajm += 0.001;
        px = this.collider.translation[0];
        py = this.collider.translation[2];
        // console.log(px + " " + py);
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

        // Finding the paper
        // When we find the paper, it goes below the map
        // Paper1
        if ((px >= -5.5 && px <= -4.5) && (py <= -28.5 && py >= -29.5) && (this.paper1.translation[1] == 1)){
            console.log("Najde list!");
            papersFound += 1;
            console.log("Papers found: " + papersFound);
            this.paper1.translation = [-5.5, -5, -28.5];
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
