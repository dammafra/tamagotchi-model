import GUI from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const axesHelper = new THREE.AxesHelper(10)
axesHelper.position.y = 0.0001

const gridHelper = new THREE.GridHelper()

scene.add(axesHelper, gridHelper)

// Egg
let egg = null
let geometry = null
const material = new THREE.MeshStandardMaterial()

const params = {
  girth: 0.8,
  apex: 0.15,
  scaleX: 0.5,
  scaleZ: 1,
}

function generateEgg() {
  if (egg) {
    geometry.dispose()
    scene.remove(egg)
  }

  const points = []
  for (let deg = 0; deg <= 180; deg += 6) {
    const rad = (Math.PI * deg) / 180
    var v = new THREE.Vector2(
      (params.apex * Math.cos(rad) + params.girth) * Math.sin(rad),
      -Math.cos(rad),
    )
    points.push(v)
  }

  // Creazione della geometria con rivoluzione
  geometry = new THREE.LatheGeometry(points, 32)
  egg = new THREE.Mesh(geometry, material)

  egg.position.y = 1

  egg.scale.set(params.scaleX, 1, params.scaleZ)

  scene.add(egg)
}

generateEgg()

gui.add(params, 'girth').min(0).max(2).step(0.001).onChange(generateEgg)
gui.add(params, 'apex').min(0).max(2).step(0.001).onChange(generateEgg)
gui.add(params, 'scaleX').min(0).max(2).step(0.001).onChange(generateEgg)
gui.add(params, 'scaleZ').min(0).max(2).step(0.001).onChange(generateEgg)

// Lights
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.position.set(0.25, 2, -2.25)
scene.add(directionalLight)

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, -4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
