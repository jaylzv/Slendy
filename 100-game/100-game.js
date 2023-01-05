import { Application } from '../../common/engine/Application.js';

import { GLTFLoader } from './GLTFLoader.js';
import { Renderer } from './Renderer.js';

import { Physics } from './Physics.js';
import { FirstPersonController } from '../../common/engine/FirstPersonController.js';

import { quat } from '../lib/gl-matrix-module.js';

import { Node } from '../common/engine/Node.js';

// Iskoristeno za teleportiranjeto na slendy sekoi nekolku sekundi
var tajm = 0;
var trFlag = 0; // Translation flag
var rotacija;

// Player x and y
var px;
var py;
var pz;
// Slenderman x and y
var sx;
var sy;
var sz;

var atan2X;
var atan2Y;
var atan2Angle;

var papersFound = 0;

// Iskoristeno za slendy koga te love
var slTime = 0;
// 1 if caught
var caught = 0;

// ANIMALS
// Wolf x and y
var wolfRunFlag = 0;
var wolfRunCounter = 0;
var wolfWay = 0;
var wx;
var wy;
var wz;
// Fox x and y
var foxRunFlag = 0;
var foxRunCounter = 0;
var foxWay = 0;
var fx;
var fy;
var fz;
// Horse x and y
var horseRunFlag = 0;
var horseRunCounter = 0;
var horseWay = 0;
var hx;
var hy;
var hz;

var backgroundSounds = new Audio('../../common/sounds/sbs.mp3');
var slendyCatching = new Audio('../../common/sounds/slendycatching.mp3');
var dun = new Audio('../../common/sounds/dun.mp3');
var scs = 0; // Slendy Catching Counter

class App extends Application {

    async start() {
        this.loader = new GLTFLoader();
        await this.loader.load('../../common/models/part1/part1.gltf');

        this.scene = await this.loader.loadScene(this.loader.defaultScene);
        this.camera = await this.loader.loadNode('Camera');
        this.collider = await this.loader.loadNode('Collider');
        this.light =  await this.loader.loadNode('Light');
        this.sky = await this.loader.loadNode('Sky');
        
        this.light.intensity = 2;
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

        this.horse.rotation = quat.rotateY(quat.create(), this.horse.rotation, Math.PI);
        backgroundSounds.play();
    }

    update(time, dt){
        this.controller.update(dt);
        this.physics.update(dt);
        

        px = this.collider.translation[0];
        py = this.collider.translation[2];
        pz = this.collider.translation[1];

        sx = this.slenderman.translation[0];
        sy = this.slenderman.translation[2];
        sz = this.slenderman.translation[1];
        
        wx = this.wolf.translation[0];
        wy = this.wolf.translation[2];
        wz = this.wolf.translation[1];

        fx = this.fox.translation[0];
        fy = this.fox.translation[2];
        fz = this.fox.translation[1];

        hx = this.horse.translation[0];
        hy = this.horse.translation[2];
        hz = this.horse.translation[1];

        // Slenderman timed teleportation and rotation
        tajm += 0.001;

        console.log("x: " + px + " y: " + py);

        atan2Angle = Math.atan2(py - sy, px - sx);
        this.slenderman.rotation = quat.setAxisAngle(quat.create(), [0, -1 , 0], atan2Angle);
        
        if (tajm%3 >= 0 && tajm%3 <= 0.001){
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

            dun.play();

            scs = 0;
        }

        // Finding the papers
        // When we find the paper, it goes below the map
        if ((px <= 25 && px >= 24) && (py >= 18.6 && py <= 19) && (this.paper1.translation[1] == 1)){
            console.log("Found the third paper!");
            papersFound += 1;
            console.log("Papers found: " + papersFound);
            this.paper1.translation = [24.5, -5, 19];
            document.getElementById("Papers").innerText = "Papers found: " + papersFound + "/4";
        }
        if ((px >= 3.5 && px <= 5) && (py >= 2.2 && py <= 3.8) && (this.paper2.translation[1] == 1)){
            console.log("Found the second paper!");
            papersFound += 1;
            console.log("Papers found: " + papersFound);
            this.paper2.translation = [4, -5, 3];
            document.getElementById("Papers").innerText = "Papers found: " + papersFound + "/4";
        }
        if ((px >= 29 && px <= 30.5) && (py <= -17 && py >= -19) && (this.paper3.translation[1] == 1)){
            console.log("Found the third paper!");
            papersFound += 1;
            console.log("Papers found: " + papersFound);
            this.paper3.translation = [30, -5, 5];
            document.getElementById("Papers").innerText = "Papers found: " + papersFound + "/4";
        }
        if ((px >= -5.5 && px <= -4.5) && (py <= -28.5 && py >= -29.5) && (this.paper4.translation[1] == 1)){
            console.log("Found the fourth paper!");
            papersFound += 1;
            console.log("Papers found: " + papersFound);
            this.paper4.translation = [-5.5, -5, -28.5];
            document.getElementById("Papers").innerText = "Papers found: " + papersFound + "/4";
        }
        
        // Slender catching you
        if ((px <= sx + 4 && px >= sx - 4) && (py <= sy + 4 && py >= sy - 4)){
            slTime += 0.001;

            if (scs == 0){
                slendyCatching.play();
                scs += 0.1;
            }

            if (slTime%1 >= 0 && slTime%1 <= 0.001){
                caught = 1;
                console.log("Slendy caught you!")
            }
        }

         // ANIMALS MOVING
        // WOLF
        // Wolf getting scared off
        if ((px <= wx + 1.5 && px >= wx - 1.5) && (py <= wy + 1.5 && py >= wy - 1.5) && wolfRunFlag == 0){
            wolfRunFlag = 1;
        }
        // If state 0 - neutral
        // If state 1 run away from the player
        // If state 2 run to the player
        if (wolfRunFlag == 1){
            wolfRunCounter += 0.001;
            if (wolfWay == 0){
                this.wolf.translation = [wx - 0.01, wz, wy + 0.01];
                if (wy >= 15){
                    wolfWay = 1;
                    this.wolf.rotation = quat.rotateY(quat.create(), this.wolf.rotation, Math.PI);
                }
            } else if (wolfWay == 1){
                this.wolf.translation = [wx - 0.01, wz, wy - 0.01];
                if (wy <= -14){
                    wolfWay = 0;
                    this.wolf.rotation = quat.rotateY(quat.create(), this.wolf.rotation, Math.PI);
                }
            }
            if (wolfRunCounter >= 1){
                wolfRunFlag = 2;
            }
        }
        if (wolfRunFlag == 2){
            wolfRunCounter -= 0.001;
            if (wolfWay == 0){
                this.wolf.translation = [wx + 0.01, wz, wy + 0.01];
                if (wy >= 15){
                    wolfWay = 1;
                    this.wolf.rotation = quat.rotateY(quat.create(), this.wolf.rotation, Math.PI);
                }
            } else if (wolfWay == 1){
                this.wolf.translation = [wx + 0.01, wz, wy - 0.01];
                if (wy <= -14){
                    wolfWay = 0;
                    this.wolf.rotation = quat.rotateY(quat.create(), this.wolf.rotation, Math.PI);
                }
            }
            if (wolfRunCounter <= 0){
                wolfRunFlag = 0;
            }
        }
        // Wolf moving left and right
        if (wolfWay == 0 && wolfRunFlag == 0){
            this.wolf.translation = [wx, wz, wy + 0.01];
            if (wy >= 15){
                wolfWay = 1;
                this.wolf.rotation = quat.rotateY(quat.create(), this.wolf.rotation, Math.PI);
            }
        } else if (wolfWay == 1 && wolfRunFlag == 0){
            this.wolf.translation = [wx, wz, wy - 0.01];
            if (wy <= -14){
                wolfWay = 0;
                this.wolf.rotation = quat.rotateY(quat.create(), this.wolf.rotation, Math.PI);
            }
        }

        // FOX
        if ((px <= fx + 1.5 && px >= fx - 1.5) && (py <= fy + 1.5 && py >= fy - 1.5) && foxRunFlag == 0){
            foxRunFlag = 1;
        }
        // If state 0 - neutral
        // If state 1 run away from the player
        // If state 2 run to the player
        if (foxRunFlag == 1){
            foxRunCounter += 0.001;
            if (foxWay == 0){
                this.fox.translation = [fx + 0.01, fz, fy - 0.01];
                if (fx >= 16){
                    foxWay = 1;
                    this.fox.rotation = quat.rotateY(quat.create(), this.fox.rotation, Math.PI);
                }
            } else if (foxWay == 1){
                this.fox.translation = [fx - 0.01, fz, fy - 0.01];
                if (fx <= -2.5){
                    foxWay = 0;
                    this.fox.rotation = quat.rotateY(quat.create(), this.fox.rotation, Math.PI);
                }
            }
            if (foxRunCounter >= 1){
                foxRunFlag = 2;
            }
        }
        if (foxRunFlag == 2){
            foxRunCounter -= 0.001;
            if (foxWay == 0){
                this.fox.translation = [fx + 0.01, fz, fy + 0.01];
                if (fx >= 16){
                    foxWay = 1;
                    this.fox.rotation = quat.rotateY(quat.create(), this.fox.rotation, Math.PI);
                }
            } else if (foxWay == 1){
                this.fox.translation = [fx - 0.01, fz, fy + 0.01];
                if (fx <= -2.5){
                    foxWay = 0;
                    this.fox.rotation = quat.rotateY(quat.create(), this.fox.rotation, Math.PI);
                }
            }
            if (foxRunCounter <= 0){
                foxRunFlag = 0;
            }
        }
        // Fox moving
        if (foxWay == 0 && foxRunFlag == 0){
            this.fox.translation = [fx + 0.01, fz, fy];
            if (fx >= 16){
                foxWay = 1;
                this.fox.rotation = quat.rotateY(quat.create(), this.fox.rotation, Math.PI);
            }
        } else if (foxWay == 1 && foxRunFlag == 0){
            this.fox.translation = [fx - 0.01, fz, fy];
            if (fx <= -2.5){
                foxWay = 0;
                this.fox.rotation = quat.rotateY(quat.create(), this.fox.rotation, Math.PI);
            }
        }

        // HORSE
        // Horse getting scared off
        if ((px <= hx + 2.5 && px >= hx - 2.5) && (py <= hy + 2.5 && py >= hy - 2.5) && horseRunFlag == 0){
            horseRunFlag = 1;
        }
        // If state 0 - neutral
        // If state 1 run away from the player
        // If state 2 run to the player
        if (horseRunFlag == 1){
            horseRunCounter += 0.001;
            if (horseWay == 0){
                this.horse.translation = [hx + 0.01, hz, hy + 0.01];
                if (hy >= 12){
                    horseWay = 1;
                    this.horse.rotation = quat.rotateY(quat.create(), this.horse.rotation, Math.PI);
                }
            } else if (horseWay == 1){
                this.horse.translation = [hx + 0.01, hz, hy - 0.01];
                if (hy <= -14){
                    horseWay = 0;
                    this.horse.rotation = quat.rotateY(quat.create(), this.horse.rotation, Math.PI);
                }
            }
            if (horseRunCounter >= 1){
                horseRunFlag = 2;
            }
        }
        if (horseRunFlag == 2){
            horseRunCounter -= 0.001;
            if (horseWay == 0){
                this.horse.translation = [hx - 0.01, hz, hy + 0.01];
                if (hy >= 12){
                    horseWay = 1;
                    this.horse.rotation = quat.rotateY(quat.create(), this.horse.rotation, Math.PI);
                }
            } else if (horseWay == 1){
                this.horse.translation = [hx - 0.01, hz, hy - 0.01];
                if (hy <= -14){
                    horseWay = 0;
                    this.horse.rotation = quat.rotateY(quat.create(), this.horse.rotation, Math.PI);
                }
            }
            if (horseRunCounter <= 0){
                horseRunFlag = 0;
            }
        }
        // Horse moving
        if (horseWay == 0 && horseRunFlag == 0){
            this.horse.translation = [hx, hz, hy + 0.01];
            if (hy >= 12){
                horseWay = 1;
                this.horse.rotation = quat.rotateY(quat.create(), this.horse.rotation, Math.PI);
            }
        } else if (horseWay == 1 && horseRunFlag == 0){
            this.horse.translation = [hx, hz, hy - 0.01];
            if (hy <= -14){
                horseWay = 0;
                this.horse.rotation = quat.rotateY(quat.create(), this.horse.rotation, Math.PI);
            }
        }


        this.sky.translation = [px, 9.58256, py];
        this.sky.translation = [px, 9.58256, py];

        if(papersFound === 4){
            window.location.href = "win.html";
        }
        if(caught === 1){
            window.location.href = "lose.html";
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