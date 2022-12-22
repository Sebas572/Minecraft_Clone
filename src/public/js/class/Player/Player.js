"use strict";

import * as helpers from './First_Person.js'
import Cube from '../Cube/Cube.js'

const loader = new THREE.TextureLoader();

const create_player = class {
	#raycaster = new THREE.Raycaster();
	#pointer = new THREE.Vector2();
	#canvas = document.querySelector('canvas');
	#player;	// THREE
	#camera;	// THREE
	#scene;	// THREE
	#hand;	// THREE
	#cursor;	// THREE
	#controllerDestroyBlock;	//setTimeout
	#startTime;	//new Date();
	#endTime;	//new Date;
	#stopAnimationHand = () => {}; //function
	#isWalk; // boolean

	LIMIT_DISTANCE;	//number

	getIsWalk() {
		return this.#isWalk;
	}

	constructor({x = 0, y = 0, z = 0, name = 'player', mass = 1500, scene, camera, LIMIT_DISTANCE = 25}) {
		if(scene === undefined) throw ('I need the scene to be able to integrate the player');
		this.#scene = scene;
		this.#camera = camera;
		this.#isWalk = false;
		this.LIMIT_DISTANCE = LIMIT_DISTANCE;

		this.#player = new Physijs.BoxMesh(
			new THREE.BoxGeometry(2.5, 9, 2.5),
			new THREE.MeshBasicMaterial({ color: 0xFF0000 })
		);
		this.#player.position.set(x, y+5, z);
		this.#player.name = name;
		this.#player.visible = false;
		this.#player._physijs.mass = mass;
		this.#scene.add(this.#player);

		this.#hand = new THREE.Mesh(
			new THREE.CubeGeometry(3, 4, 3),
			new THREE.MeshBasicMaterial({ color: 0xefd3ae })
		);
		this.#hand.rotation.x = Math.PI/4;
		this.#hand.position.set(10, -6, -10);
		this.#hand.renderOrder = 1;
		this.#hand.material.depthTest = false;
		this.#camera.add(this.#hand);

		this.#cursor = new THREE.Mesh(
			new THREE.CubeGeometry(0.125, 0.125, 0),
			new THREE.MeshBasicMaterial({
				transparent: true,
				opacity: 0.8,
				map: loader.load('/public/texture/cursor/cursor.png')
			})
		);
		this.#cursor.position.set(0, 0, -3);
		this.#cursor.renderOrder = 1;
		this.#cursor.material.depthTest = false;
		this.#camera.add(this.#cursor);


		this.#player.addEventListener('collision', (objCollidedWith) => {
			if(objCollidedWith.name === 'up') this.#player.jump = true;
		});

		document.onclick = helpers.HadleClick;
		
		document.onmousemove = (event) => {
			helpers.HadleMouseMover(event, this.#camera);
		};

		document.onkeydown = helpers.Select;
		document.onkeyup = helpers.UnSelect;
		
		this.managerEvent();
	}

	#startAnimationWalk = () => {
		this.#isWalk = true;
		let i = 4, status = 'right';

		const animation = setInterval(() => {
			if(!this.#isWalk) {
				this.#hand.position.set(10, -6, -10);
				return clearInterval(animation);
			}
	    
	    if(this.#hand.position.x <= 9) status = 'right';
	    else if(this.#hand.position.x >= 10) status = 'left';
	    
	    i = (0.2 * (status === 'right'?1:-1));
	    
	    this.#hand.position.x += i;
	    this.#hand.position.y += i/2;
		}, 80);
	}

	animationHandBlock({ animation='add' }) {
		let i = 4, status = 'down';

		const handAnimation = setInterval(() => {
			if(animation === 'add') {
		  	if(i >= 4 && status === 'up') clearInterval(handAnimation);
			}
	    
	    if(i >= 4) status = 'down';
	    else if(i <= 2) status = 'up';
	    
	    i = i + (0.5 * (status === 'down'?-1:1));
	    
	    this.#hand.rotation.x = -Math.PI/i;
		}, 50);

		return (() => {
	    this.#hand.rotation.x = Math.PI/4;
			clearInterval(handAnimation);
		});
	}

	#positionNewBlock = {
		'back': (x, y, z) => {
			return { x, y, z };
		},
		'front': (x, y, z) => {
			return { x, y, z: z+5 };
		},
		'up': (x, y, z) => {
			return { x, y: y+2.5, z: z+2.5 };
		},
		'down': (x, y, z) => {
			return { x, y: y-2.5, z: z+2.5 }
		},
		'right': (x, y, z) => {
			return { x: x+2.5, y, z: z+2.5 };
		},
		'left': (x, y, z) => {
			return { x: x-2.5, y, z: z+2.5 };
		}
	}
	
	#eventAddBlocks () {
		const viewBlock = this.getRaycast();

		if(viewBlock[0] === undefined) return;
		else if(viewBlock[0].distance >= this.LIMIT_DISTANCE || viewBlock[0].distance <= 8) return;

		const block = viewBlock[0].object;		
		const getNewPosition = this.#positionNewBlock[block.name];
		if(getNewPosition === undefined) return;

		const { x, y, z} = getNewPosition(block.position.x, block.position.y, block.position.z);

		this.animationHandBlock({ animation: 'add' });
		
		new Cube({
			scene: this.#scene,
			position: {
				x: x,
				y: y,
				z: z
			},
			type: 'log'
		});

	}

	#eventSelectDestroyBlock() {
		const selectBlock = () => {
			
			const destroyBlock = (block) => {
			  const raycast = this.getRaycast();
			  if(raycast[0] === undefined) return;

			  if(block.object.id == raycast[0].object.id) {
			  	block.object.allRemove();
			  	delete block.object;
					this.#canvas.onmousemove = selectBlock;
			  	selectBlock();
			  }
			};

	  	this.#startTime = new Date();
	  	const raycast = this.getRaycast();
	  	if(raycast[0] === undefined) return;
  	
			if(this.#controllerDestroyBlock !== undefined) {
				this.#stopAnimationHand();
				clearTimeout(this.#controllerDestroyBlock);
			}

			this.#stopAnimationHand = this.animationHandBlock({ animation: 'destroy' });
  		
  		this.#controllerDestroyBlock = setTimeout(() => {
				this.#stopAnimationHand();
  			destroyBlock(raycast[0]);
  		}, 1000);
		}		

		selectBlock();
	}

	eventUnselectDestroyBlock() {
	  this.#canvas.onmousemove = () => {};
	  this.#endTime = new Date();
	  const differenceTime = this.#endTime - this.#startTime;
	  
	  if(differenceTime < 1000) {
			this.#stopAnimationHand();
	  	clearTimeout(this.#controllerDestroyBlock);
	  }
	  
	  this.#endTime = null;
	  this.#startTime = null;
	}


	managerEvent() {
		const selectBlock = (e) => {
			if(e.button === 0) return this.#eventSelectDestroyBlock();
			else if(e.button === 2) return this.#eventAddBlocks();
		}

		const unselectBlock = (e) => {
			return this.eventUnselectDestroyBlock();
		}

		this.#canvas.onmousedown = selectBlock;
		this.#canvas.onmouseup = unselectBlock;
	}

	getRaycast() {
		this.#raycaster.setFromCamera(this.#pointer, this.#camera);
		const intersects = this.#raycaster.intersectObjects(this.#scene.children);

		return intersects;
	}

	pointBlock() {
		const intersects = this.getRaycast();
		
		if(intersects[0] == undefined) return;
		else if(intersects[0].distance >= this.LIMIT_DISTANCE) return;
		
		const originalColor = intersects[0].object.material.color;
		intersects[0].object.material.color.set(0x8080806e);

		setTimeout(() => {
			const currentIntersects = this.getRaycast();
			if(currentIntersects[0] == undefined) {
				return intersects[0].object.material.color.set(0xffffff);
			}

			const isDistance = currentIntersects[0].distance >= this.LIMIT_DISTANCE;
			const isSameObject = (intersects[0].object.id === currentIntersects[0].object.id);

			if(!isSameObject || isDistance) {
				return intersects[0].object.material.color.set(0xffffff);
			}
		}, 100);
	}
	
	move() {
		this.pointBlock();
		helpers.KeyboardInit({
			player: this.#player,
			camera: this.#camera,
			stopAnimationWalk: () => { this.#isWalk = false },
			startAnimationWalk: () => { this.#startAnimationWalk() },
			isWalk: this.#isWalk
		});
		this.#player.setAngularFactor(new THREE.Vector3(0, 0, 0));
	}

	getPlayer() {
		return this.#player;
	}

}

export default create_player;