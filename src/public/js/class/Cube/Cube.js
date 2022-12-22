"use strict";

const loader = new THREE.TextureLoader();

class Cube {
	position;
	#upFace;
	#leftFace;
	#frontFace;
	#rightFace;
	#backFace;
	#downFace;

	constructor({ scene, position={x: 0,y: 0,z: 0}, type }) {
		this.positiona = position;

		const material = Physijs.createMaterial(
			new THREE.MeshBasicMaterial({
				map: loader.load(`/public/texture/blocks/${type}.png`)
			}),
	  );

		const { x, y, z } = position;
		this.#upFace = new Physijs.BoxMesh(new THREE.PlaneGeometry(5, 5, 5, 0), material);
		this.#upFace.rotation.x = -Math.PI/2;
		this.#upFace.position.set(x, y+2.5, z-2.5);
		this.#upFace.name = 'up';

		this.#leftFace = new Physijs.BoxMesh(new THREE.PlaneGeometry(5, 5, 5, 0), material);
		this.#leftFace.rotation.y = -Math.PI/2;
		this.#leftFace.position.set(x-2.5, y+0, z-2.5);
		this.#leftFace.name = 'left';

		this.#frontFace = new Physijs.BoxMesh(new THREE.PlaneGeometry(5, 5, 5, 0), material);
		this.#frontFace.position.set(x, y, z);
		this.#frontFace.name = 'front';

		this.#rightFace = new Physijs.BoxMesh(new THREE.PlaneGeometry(5, 5, 5, 0), material);
		this.#rightFace.rotation.y = Math.PI/2;
		this.#rightFace.position.set(x+2.5, y, z-2.5);
		this.#rightFace.name = 'right';
		
		this.#backFace = new Physijs.BoxMesh(new THREE.PlaneGeometry(5, 5, 5, 0), material);
		this.#backFace.rotation.x = -Math.PI;
		this.#backFace.position.set(x, y, z-5);
		this.#backFace.name = 'back';

		this.#downFace = new Physijs.BoxMesh(new THREE.PlaneGeometry(5, 5, 5, 0), material);
		this.#downFace.rotation.x = Math.PI/2;
		this.#downFace.position.set(x, y-2.5, z-2.5);
		this.#downFace.name = 'down';

		const allRemove = () => {
		  scene.remove(this.#upFace);
		  scene.remove(this.#leftFace);
		  scene.remove(this.#frontFace);
		  scene.remove(this.#rightFace);
		  scene.remove(this.#backFace);
		  scene.remove(this.#downFace);
		}

		this.#upFace.allRemove = allRemove;
		this.#leftFace.allRemove = allRemove;
		this.#frontFace.allRemove = allRemove;
		this.#rightFace.allRemove = allRemove;
		this.#backFace.allRemove = allRemove;
		this.#downFace.allRemove = allRemove;

		scene.add(this.#upFace);
		scene.add(this.#leftFace);
		scene.add(this.#frontFace);
		scene.add(this.#rightFace);
		scene.add(this.#backFace);
		scene.add(this.#downFace);
	}
}

export default Cube;