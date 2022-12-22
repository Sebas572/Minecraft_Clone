"use strict";

Physijs.scripts.worker = '/public/js/physijs_worker.js';
Physijs.scripts.ammo = '/public/Physijs/ammo.js';

import create_player from './class/Player/Player.js'
import Cube from './class/Cube/Cube.js'

const fps = 50;
const cubes = [];
const loader = new THREE.TextureLoader();

let renderer, scene, camera, player, hand;

const generateMap = () => {
	for(let x = 0; x <= 10; x++) {
		for(let z= 0; z <= 10; z++) {
			cubes.push(new Cube({scene: scene, position: {x: (x*5)-25, y: 0, z: (z*5)-25}, type: 'grass'}));
		}
	}
}

const initScene = () => {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	scene = new Physijs.Scene({fixedTimeStep: (1/100)});
	scene.setGravity(new THREE.Vector3(0, -45, 0));
	scene.addEventListener("update", function(){
	    scene.simulate(undefined, 2);
	})
	
	generateMap();
	
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
	camera.rotation.order = 'YXZ';
	camera.position.set(0, 4, 0);
	scene.add(camera);

	const skyBox = new THREE.Mesh(
		new THREE.SphereGeometry(500, 100, 40),
		new THREE.MeshBasicMaterial({
			map: loader.load('/public/texture/sky/sky.png')
		})
	);

	skyBox.scale.set(-1, 1, 1);
	skyBox.eulerOrder = 'XZY';
	skyBox.renderDepth = 1000.0;
	scene.add(skyBox);

	player = new create_player({x: 0, y: 5, z: 0, name: 'steve', scene: scene, camera: camera});

	requestAnimationFrame(render);
};



const render = () => {
	scene.simulate(); // run physics
	renderer.render(scene, camera); // render the scene
	player.move();

	setTimeout(() => {
		requestAnimationFrame( render );
	}, 1000/fps);
};

window.onload = () => {
	initScene();
}