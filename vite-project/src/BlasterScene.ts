import * as THREE from 'three'

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

export default class BlasterScene extends THREE.Scene {


    private readonly mtlLoader = new MTLLoader()
    private readonly objLoader = new OBJLoader()
    private readonly camera: THREE.PerspectiveCamera

    private readonly keyDown = new Set<string>()

    constructor(camera: THREE.PerspectiveCamera) {
        super()

        this.camera = camera
    }


    async initialize() {

        // this is rendering the cube built earlier which was moved to the file below
        const targetMtl = await this.mtlLoader.loadAsync('assets/targetA.mtl')
        targetMtl.preload()

        // create the 4 targets
        const t1 = await this.createTarget(targetMtl)
        t1.position.x = -1
        t1.position.z = -3

        const t2 = await this.createTarget(targetMtl)
        t2.position.x = 1
        t2.position.z = -3

        const t3 = await this.createTarget(targetMtl)
        t3.position.x = 2
        t3.position.z = -3

        const t4 = await this.createTarget(targetMtl)
        t4.position.x = -2
        t4.position.z = -3

        this.add(t1, t2, t3, t4)


        //Adding blaster
        const blaster = await this.createBlaster()
        this.add(blaster)

        //positioning blaster like fps game
        blaster.position.z = 3
        blaster.add(this.camera)
        this.camera.position.z = 1
        this.camera.position.y = 0.5

        //adding light to to images
        const light = new THREE.DirectionalLight(0xFFFFFF, 1)
        light.position.set(0, 4, 2)
        this.add(light)


        //adding movement to the gun POV
        document.addEventListener('keydown', this.handleKeyDown)
        document.addEventListener('keyup', this.handleKeyUp)



    }

    private handleKeyDown(event: KeyboardEvent) {
        this.keyDown.add(event.key.toLowerCase())

    }

    private handleKeyUp(event: KeyboardEvent) {
        this.keyDown.delete(event.key.toLowerCase())

    }


    private async createTarget(mtl: MTLLoader.MaterialCreator) {

        this.objLoader.setMaterials(mtl)
        //image from webite
        const modelRoot = await this.objLoader.loadAsync('assets/targetA.obj')
        modelRoot.rotateY(Math.PI * 0.5)

        return modelRoot

    }


    private async createBlaster() {

        const mtl = await this.mtlLoader.loadAsync('assets/blasterG.mtl')
        //why do i need to preload here and not above?
        mtl.preload()

        this.objLoader.setMaterials(mtl)
        const modelRoot = await this.objLoader.loadAsync('assets/blasterG.obj')
        return modelRoot

    }


    update() {
        //update
        // this.updateInput()
        // this.updateBullets()

    }
}
