import './style.css'
import * as THREE from 'three'

const width = window.innerWidth
const height = window.innerHeight

const renderer = new THREE.WebGL1Renderer({
  canvas: document.getElementById('bg') as HTMLCanvasElement
})
renderer.setSize(width, height)

const scene = new THREE.Scene()

const mainCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshPhongMaterial({ color: 0xFFAD00 })
const cube = new THREE.Mesh(geometry, material)
cube.position.z = -3
cube.position.y = -1
scene.add(cube)

const light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(0, 4, 7)
scene.add(light)


renderer.render(scene, mainCamera)
