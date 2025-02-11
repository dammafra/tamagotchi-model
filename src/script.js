import GUI from 'lil-gui'
import * as THREE from 'three'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Egg
let device = null

let egg = null
let screen = null

let eggGeometry = null
let screenGeometry = null

const eggMaterial = new THREE.MeshStandardMaterial({
  color: 0x118888,
  roughness: 0.5,
  metalness: 0.1,
})

const screenMaterial = new THREE.MeshStandardMaterial({
  color: 0xffff66,
  roughness: 0.5,
  metalness: 0.1,
})

const params = {
  helpers: true,
  eggGirth: 0.8,
  eggApex: 0.15,
  screenRadiusTop: 1,
  screenRadiusBottom: 0.5,
  screenHeight: 0.5,
  screenPositionX: 0,
  screenPositionY: 0,
  screenPositionZ: -0.5,
  deviceScaleX: 1,
  deviceScaleZ: 0.5,
}

function generateDevice() {
  if (device) {
    eggGeometry.dispose()
    screenGeometry.dispose()

    scene.remove(egg, screen, device)
  }

  const points = []
  for (let deg = 0; deg <= 180; deg += 6) {
    const rad = (Math.PI * deg) / 180
    var v = new THREE.Vector2(
      (params.eggApex * Math.cos(rad) + params.eggGirth) * Math.sin(rad),
      -Math.cos(rad),
    )
    points.push(v)
  }

  eggGeometry = new THREE.LatheGeometry(points, 32)
  egg = new Brush(eggGeometry, eggMaterial)
  egg.scale.set(params.deviceScaleX, 1, params.deviceScaleZ)
  egg.updateMatrixWorld()

  screenGeometry = new THREE.CylinderGeometry(
    params.screenRadiusTop,
    params.screenRadiusBottom,
    params.screenHeight,
    4,
  )
  screen = new Brush(screenGeometry, screenMaterial)
  screen.rotation.y = Math.PI * 0.25
  screen.rotation.x = -Math.PI * 0.5
  screen.position.set(params.screenPositionX, params.screenPositionY, params.screenPositionZ)
  screen.updateMatrixWorld()

  const evaluator = new Evaluator()
  device = evaluator.evaluate(egg, screen, SUBTRACTION)

  scene.add(device)
}

generateDevice()

gui.add(params, 'eggGirth').min(0).max(2).step(0.001).onChange(generateDevice)
gui.add(params, 'eggApex').min(0).max(2).step(0.001).onChange(generateDevice)

gui.add(params, 'screenRadiusTop').min(0).max(10).step(0.01).onChange(generateDevice)
gui.add(params, 'screenRadiusBottom').min(0).max(10).step(0.01).onChange(generateDevice)
gui.add(params, 'screenHeight').min(0).max(10).step(0.01).onChange(generateDevice)
gui.add(params, 'screenPositionX').min(-5).max(5).step(0.01).onChange(generateDevice)
gui.add(params, 'screenPositionY').min(-5).max(5).step(0.01).onChange(generateDevice)
gui.add(params, 'screenPositionZ').min(-5).max(5).step(0.01).onChange(generateDevice)

gui.add(params, 'deviceScaleX').min(0).max(2).step(0.001).onChange(generateDevice)
gui.add(params, 'deviceScaleZ').min(0).max(2).step(0.001).onChange(generateDevice)

// Lights
const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.position.set(0.25, 2, -2.25)
directionalLight.shadow.mapSize.width = 512
directionalLight.shadow.mapSize.height = 512
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 20
scene.add(directionalLight)

// Helpers
const axesHelper = new THREE.AxesHelper(10)
axesHelper.visible = params.helpers
axesHelper.position.y = -0.999

const gridHelper = new THREE.GridHelper(10, 10, 'white', 'white')
gridHelper.position.y = -1
gridHelper.visible = params.helpers

scene.add(axesHelper, gridHelper)

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
directionalLightHelper.visible = params.helpers

scene.add(axesHelper, gridHelper, directionalLightHelper)
gui.add(params, 'helpers').onChange(value => {
  axesHelper.visible = value
  gridHelper.visible = value
  directionalLightHelper.visible = value
})

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
camera.position.set(2, 1, -4)
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
renderer.setClearColor(0x888888)
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
