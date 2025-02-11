import GUI from 'lil-gui'
import * as THREE from 'three'
import { ADDITION, Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Textures
const textureLoader = new THREE.TextureLoader()
const eggTexture = textureLoader.load('./matcaps/matcap1.png')
const insetTexture = textureLoader.load('./matcaps/matcap2.png')

// Egg
let device = null

let egg = null
let inset = null
let inset2 = null

let eggGeometry = null
let insetGeometry = null
let inset2Geometry = null

const eggMaterial = new THREE.MeshMatcapMaterial({
  matcap: eggTexture,
})

const insetMaterial = new THREE.MeshMatcapMaterial({
  matcap: insetTexture,
})

const params = {
  helpers: true,

  eggGirth: 0.8,
  eggApex: 0.15,

  insetRadiusTop: 1,
  insetRadiusBottom: 0.5,
  insetHeight: 0.5,
  insetPositionX: 0,
  insetPositionY: 0,
  insetPositionZ: -0.5,

  inset2RadiusTop: 1,
  inset2RadiusBottom: 0.4,
  inset2Height: 0.3,
  inset2PositionX: 0.02,
  inset2PositionY: 0.04,
  inset2PositionZ: -0.37,

  deviceScaleX: 1,
  deviceScaleZ: 0.5,
}

function generateDevice() {
  if (device) {
    eggGeometry.dispose()
    insetGeometry.dispose()

    scene.remove(egg, inset, inset2, device)
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

  insetGeometry = new THREE.CylinderGeometry(
    params.insetRadiusTop,
    params.insetRadiusBottom,
    params.insetHeight,
    4,
  )
  inset = new Brush(insetGeometry, insetMaterial)
  inset.rotation.y = Math.PI * 0.25
  inset.rotation.x = -Math.PI * 0.5
  inset.position.set(params.insetPositionX, params.insetPositionY, params.insetPositionZ)
  inset.updateMatrixWorld()

  inset2Geometry = new THREE.CylinderGeometry(
    params.inset2RadiusTop,
    params.inset2RadiusBottom,
    params.inset2Height,
    4,
  )
  inset2 = new Brush(inset2Geometry, insetMaterial)
  inset2.rotation.y = Math.PI * 0.05
  inset2.scale.setScalar(0.8, 2, 0.5)
  inset2.rotation.x = -Math.PI * 0.5
  inset2.position.set(params.inset2PositionX, params.inset2PositionY, params.inset2PositionZ)
  inset2.updateMatrixWorld()

  const buttonInsetMaterial = new THREE.MeshBasicMaterial({ color: 'black' })

  //   Button A
  const buttonAInset = new Brush(new THREE.SphereGeometry(0.1), buttonInsetMaterial)
  buttonAInset.position.set(0, -0.7, -0.3)
  buttonAInset.updateMatrixWorld()

  const buttonA = new Brush(new THREE.SphereGeometry(0.09), insetMaterial)
  buttonA.scale.z = 0.5
  buttonA.rotation.x = -Math.PI * 0.15
  buttonA.position.set(0, -0.71, -0.31)
  buttonA.updateMatrixWorld()

  //   Button B
  const buttonBInset = new Brush(new THREE.SphereGeometry(0.1), buttonInsetMaterial)
  buttonBInset.position.set(-0.3, -0.6, -0.3)
  buttonBInset.updateMatrixWorld()

  const buttonB = new Brush(new THREE.SphereGeometry(0.09), insetMaterial)
  buttonB.scale.z = 0.5
  buttonB.rotation.y = Math.PI * 0.1
  buttonB.rotation.x = -Math.PI * 0.1
  buttonB.position.set(-0.3, -0.61, -0.31)
  buttonB.updateMatrixWorld()

  //   Button C
  const buttonCInset = new Brush(new THREE.SphereGeometry(0.1), buttonInsetMaterial)
  buttonCInset.position.set(0.3, -0.6, -0.3)
  buttonCInset.updateMatrixWorld()

  const buttonC = new Brush(new THREE.SphereGeometry(0.09), insetMaterial)
  buttonC.scale.z = 0.5
  buttonC.rotation.y = -Math.PI * 0.1
  buttonC.rotation.x = -Math.PI * 0.1
  buttonC.position.set(0.3, -0.61, -0.31)
  buttonC.updateMatrixWorld()

  const evaluator = new Evaluator()
  device = evaluator.evaluate(egg, inset, SUBTRACTION)
  device = evaluator.evaluate(device, inset2, SUBTRACTION)

  device = evaluator.evaluate(device, buttonAInset, SUBTRACTION)
  device = evaluator.evaluate(device, buttonBInset, SUBTRACTION)
  device = evaluator.evaluate(device, buttonCInset, SUBTRACTION)

  device = evaluator.evaluate(device, buttonA, ADDITION)
  device = evaluator.evaluate(device, buttonB, ADDITION)
  device = evaluator.evaluate(device, buttonC, ADDITION)

  scene.add(device)
}

generateDevice()

gui.add(params, 'eggGirth').min(0).max(2).step(0.001).onChange(generateDevice)
gui.add(params, 'eggApex').min(0).max(2).step(0.001).onChange(generateDevice)

gui.add(params, 'insetRadiusTop').min(0).max(10).step(0.01).onChange(generateDevice)
gui.add(params, 'insetRadiusBottom').min(0).max(10).step(0.01).onChange(generateDevice)
gui.add(params, 'insetHeight').min(0).max(10).step(0.01).onChange(generateDevice)
gui.add(params, 'insetPositionX').min(-5).max(5).step(0.01).onChange(generateDevice)
gui.add(params, 'insetPositionY').min(-5).max(5).step(0.01).onChange(generateDevice)
gui.add(params, 'insetPositionZ').min(-5).max(5).step(0.01).onChange(generateDevice)

gui.add(params, 'inset2RadiusTop').min(0).max(10).step(0.01).onChange(generateDevice)
gui.add(params, 'inset2RadiusBottom').min(0).max(10).step(0.01).onChange(generateDevice)
gui.add(params, 'inset2Height').min(0).max(10).step(0.01).onChange(generateDevice)
gui.add(params, 'inset2PositionX').min(-5).max(5).step(0.01).onChange(generateDevice)
gui.add(params, 'inset2PositionY').min(-5).max(5).step(0.01).onChange(generateDevice)
gui.add(params, 'inset2PositionZ').min(-5).max(5).step(0.01).onChange(generateDevice)

gui.add(params, 'deviceScaleX').min(0).max(2).step(0.001).onChange(generateDevice)
gui.add(params, 'deviceScaleZ').min(0).max(2).step(0.001).onChange(generateDevice)

const screen = new THREE.Mesh(
  new THREE.PlaneGeometry(),
  new THREE.MeshBasicMaterial({ color: 'black' }),
)
screen.scale.setScalar(0.7)
screen.position.z = -0.251
screen.rotation.x = Math.PI
scene.add(screen)

gui.add(screen.position, 'z').min(-1).max(1).step(0.001).name('screenPositionZ') //prettier-ignore

// Lights
// const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
// scene.add(ambientLight)

// const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
// directionalLight.castShadow = true
// directionalLight.position.set(0.25, 2, -2.25)
// directionalLight.shadow.mapSize.width = 512
// directionalLight.shadow.mapSize.height = 512
// directionalLight.shadow.camera.near = 0.1
// directionalLight.shadow.camera.far = 20
// scene.add(directionalLight)

// Helpers
const axesHelper = new THREE.AxesHelper(10)
axesHelper.visible = params.helpers
axesHelper.position.y = -0.999

const gridHelper = new THREE.GridHelper(10, 10, 'white', 'white')
gridHelper.position.y = -1
gridHelper.visible = params.helpers

scene.add(axesHelper, gridHelper)

// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)
// directionalLightHelper.visible = params.helpers

scene.add(axesHelper, gridHelper)
gui.add(params, 'helpers').onChange(value => {
  axesHelper.visible = value
  gridHelper.visible = value
  //   directionalLightHelper.visible = value
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
camera.position.set(0.5, 0, -2)
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
