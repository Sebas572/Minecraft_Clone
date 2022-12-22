"use strict";

let step = 20, jump = 20, velocity = 100;

let keyBoard = {
	press: {
		W: false,
		S: false,
		D: false,
		A: false,
		SPACE: false
	},
};

const direction = { x: 1, z: 1 };
const sensitivity = { x: 150, y: 150 };

const KeyboardInit = ({ player, camera, startAnimationWalk, stopAnimationWalk, isWalk }) => {
	if(keyBoard.press.D) {	direction.x = 1;	}
	if(keyBoard.press.A) {	direction.x = -1;	}
	if(keyBoard.press.W) {	direction.x =  1;	direction.z =  1;	}
	if(keyBoard.press.S) {	direction.x = -1;	direction.z = -1;	}

	player.setLinearVelocity(new THREE.Vector3(0, player.getLinearVelocity().y, 0));

	let x = Math.sin(camera.rotation.y)*(direction.x*-1)*step;
	let z = Math.cos(camera.rotation.y)*(direction.z*-1)*step;

	if ((keyBoard.press.W || keyBoard.press.S) && (!keyBoard.press.D && !keyBoard.press.A)) {
	
		player.setLinearVelocity(new THREE.Vector3(x, player.getLinearVelocity().y, z));

	}else if((!keyBoard.press.W && !keyBoard.press.S) && (keyBoard.press.D || keyBoard.press.A)) {
	
		x = Math.sin((camera.rotation.y)+Math.PI/2)*(direction.x)*step;
		z = Math.cos((camera.rotation.y)+Math.PI/2)*(direction.x)*step;

		player.setLinearVelocity(new THREE.Vector3(x, player.getLinearVelocity().y, z));
	
	}else if ((keyBoard.press.W || keyBoard.press.S) && (keyBoard.press.D || keyBoard.press.A)) {
	
		x += ((Math.sin((camera.rotation.y)+(Math.PI/2 * keyBoard.press.A?-1:1))*(direction.x)*step)*(keyBoard.press.S?-1:1));
		z += ((Math.cos((camera.rotation.y)+(Math.PI/2 * keyBoard.press.A?-1:1))*(direction.x)*step)*(keyBoard.press.S?-1:1));

		player.setLinearVelocity(new THREE.Vector3(x, player.getLinearVelocity().y, z));
	
	}

	if(keyBoard.press.SPACE && player.jump) {
		player.setLinearVelocity(new THREE.Vector3(0, jump, 0));
		player.jump = false;
	}

	camera.position.set(player.position.x, player.position.y+4, player.position.z);

	//walk animation
	if([keyBoard.press.W, keyBoard.press.S, keyBoard.press.D, keyBoard.press.A].includes(true)) {
		if(isWalk) return;
		startAnimationWalk();
	}else stopAnimationWalk();

};

const Select = (event, startAnimationWalk) => {
	const char = String.fromCharCode(event.which)===' '?'SPACE':String.fromCharCode(event.which);
	if(!keyBoard.press[char]) keyBoard.press[char] = true;

	return char;
};

const UnSelect = (event, stopAnimationWalk) => {
	const char = String.fromCharCode(event.which)===' '?'SPACE':String.fromCharCode(event.which);
	keyBoard.press[char] = false;
};


const HadleMouseMover = (e, camera) => {
  camera.rotation.y += (e.movementX/sensitivity.y) * -1;
  	
  const rotation_look = {
  	up: ((camera.rotation.x + Math.sin((e.movementY/sensitivity.x) * -1)) <= (Math.PI/2)-0.1),
		down: ((camera.rotation.x + Math.sin((e.movementY/sensitivity.x) * -1)) >= -(Math.PI/2)+0.1)
	}

	if(rotation_look.up && rotation_look.down) {
		camera.rotation.x += Math.sin((e.movementY/sensitivity.x) * -1);
	}
}

const HadleClick = () => {
	const canvas = document.querySelector('canvas');
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
	canvas.requestPointerLock();
};

export { HadleClick, KeyboardInit, HadleMouseMover, UnSelect, Select };