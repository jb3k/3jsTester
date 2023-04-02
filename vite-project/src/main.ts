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

renderer.render(scene, mainCamera)
