import * as THREE from 'three'

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import Bullet from './Bullet'

export default class BlasterScene extends THREE.Scene {

    // to load images on the screen that we imported
    private readonly mtlLoader = new MTLLoader()
    private readonly objLoader = new OBJLoader()
    private readonly camera: THREE.PerspectiveCamera

    // adding movements
    private readonly keyDown = new Set<string>()


    // for the blaster and movement of the blaster
    private blaster?: THREE.Group
    private bulletMtl?: MTLLoader.MaterialCreator
    private directionVector = new THREE.Vector3()

    //bullters
    private bullets: Bullet[] = []
    private targets: THREE.Group[] = []

    // passing in the camera from the main.ts
    constructor(camera: THREE.PerspectiveCamera) {
        super()

        this.camera = camera
    }

    async initialize() {
        // this is rendering the cube built earlier which was moved to the file below
        const targetMtl = await this.mtlLoader.loadAsync('assets/targetA.mtl')
        targetMtl.preload()

        this.bulletMtl = await this.mtlLoader.loadAsync('assets/foamBulletB.mtl')
        this.bulletMtl.preload()

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
        this.targets.push(t1, t2, t3, t4)


        //positioning blaster like fps game
        this.blaster = await this.createBlaster()
        this.add(this.blaster)
        this.blaster.position.z = 3
        this.blaster.add(this.camera)
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

    private handleKeyDown = (event: KeyboardEvent) => {
        this.keyDown.add(event.key.toLowerCase())
    }

    private handleKeyUp = (event: KeyboardEvent) => {
        this.keyDown.delete(event.key.toLowerCase())

        if (event.key === ' ') {
            this.createBullet()
        }
    }

    private updateInput() {
        if (!this.blaster) {
            return
        }

        const shiftKey = this.keyDown.has('shift')

        //moving left and right
        if (!shiftKey) {
            if (this.keyDown.has('a') || this.keyDown.has('arrowleft')) {
                this.blaster.rotateY(0.02)
            }
            else if (this.keyDown.has('d') || this.keyDown.has('arrowright')) {
                this.blaster.rotateY(-0.02)
            }
        }

        const dir = this.directionVector

        this.camera.getWorldDirection(dir)

        const speed = 0.1

        // moving forwards or backwards
        if (this.keyDown.has('w') || this.keyDown.has('arrowup')) {
            this.blaster.position.add(dir.clone().multiplyScalar(speed))
        }
        else if (this.keyDown.has('s') || this.keyDown.has('arrowdown')) {
            this.blaster.position.add(dir.clone().multiplyScalar(-speed))
        }

        //straffing left or right
        if (shiftKey) {
            const strafeDir = dir.clone()
            const upVector = new THREE.Vector3(0, 1, 0)

            if (this.keyDown.has('a') || this.keyDown.has('arrowleft')) {
                this.blaster.position.add(
                    strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
                        .multiplyScalar(speed)
                )
            }
            else if (this.keyDown.has('d') || this.keyDown.has('arrowright')) {
                this.blaster.position.add(
                    strafeDir.applyAxisAngle(upVector, Math.PI * -0.5)
                        .multiplyScalar(speed)
                )
            }
        }
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
        mtl.preload()

        this.objLoader.setMaterials(mtl)
        const modelRoot = await this.objLoader.loadAsync('assets/blasterG.obj')
        return modelRoot
    }

    private async createBullet() {
        if (!this.blaster) {
            return
        }

        if (this.bulletMtl) {
            this.objLoader.setMaterials(this.bulletMtl)
        }

        const bulletModel = await this.objLoader.loadAsync('assets/foamBulletB.obj')

        this.camera.getWorldDirection(this.directionVector)

        const aabb = new THREE.Box3().setFromObject(this.blaster)
        const size = aabb.getSize(new THREE.Vector3())

        const vec = this.blaster.position.clone()
        vec.y += 0.06

        bulletModel.position.add(
            vec.add(
                this.directionVector.clone().multiplyScalar(size.z * 0.5)
            )
        )

        // rotate children to match gun for simplicity
        bulletModel.children.forEach(child => child.rotateX(Math.PI * -0.5))

        // use the same rotation as as the gun
        bulletModel.rotation.copy(this.blaster.rotation)

        this.add(bulletModel)

        const b = new Bullet(bulletModel)
        b.setVelocity(
            this.directionVector.x * 0.2,
            this.directionVector.y * 0.2,
            this.directionVector.z * 0.2
        )

        this.bullets.push(b)
    }

    private updateBullets() {
        for (let i = 0; i < this.bullets.length; ++i) {
            const b = this.bullets[i]
            b.update()

            if (b.shouldRemove) {
                this.remove(b.group)
                this.bullets.splice(i, 1)
                i--
            }
            else {
                for (let j = 0; j < this.targets.length; ++j) {
                    const target = this.targets[j]
                    if (target.position.distanceToSquared(b.group.position) < 0.05) {
                        this.remove(b.group)
                        this.bullets.splice(i, 1)
                        i--

                        target.visible = false
                        setTimeout(() => {
                            target.visible = true
                        }, 1000)
                    }
                }
            }
        }
    }

    update() {
        // update the movements of where you are
        this.updateInput()
        // updating the bullets
        this.updateBullets()
    }
}
