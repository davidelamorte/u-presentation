import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const parameters = {
  materialColor: "#ffffff",
};
const meshesDistance = 4;
const sectionsCount = 6;

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");
// Scene
const scene = new THREE.Scene();
const loader = new GLTFLoader();

/**
 * Materials
 */

// Texture

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

const sectionsMaterial = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
  wireframe: true,
  wireframeLinewidth: 1.5,
});

/**
 * Objects
 */

// Load UNI model
loader.load(
  // resource URL
  "models/scene.gltf",
  // called when the resource is loaded
  function (gltf) {
    console.log(gltf);
    gltf.scene.scale.set(0.06, 0.06, 0.06);
    gltf.scene.scale.set(0.06, 0.06, 0.06);
    gltf.scene.position.x = -1.7;
    gltf.scene.position.y = -4.6;
    gltf.scene.rotation.y = 5.5;
    gltf.scene.rotation.x = 0.2;
    scene.add(gltf.scene);
  },
  // called while loading is progressing
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded - Uni Model");
  },
  // called when loading has errors
  function (error) {
    console.log("An error happened loading the model", error);
  }
);

const heroMesh = new THREE.Mesh(
  new THREE.TorusGeometry(1.3, 0.2, 16, 60),
  sectionsMaterial
);
heroMesh.position.y = -meshesDistance * 0;
heroMesh.position.x = 1.5;

const sphereOne = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 32, 16),
  sectionsMaterial
);
sphereOne.position.y = -meshesDistance * 1.6;
sphereOne.position.x = -2;

const IcosahedronOne = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.3, 0),
  sectionsMaterial
);
IcosahedronOne.position.y = -meshesDistance * 2.6;
IcosahedronOne.position.x = 0;

const coneOne = new THREE.Mesh(
  new THREE.ConeGeometry(0.3, 0.6, 32),
  sectionsMaterial
);
coneOne.position.y = -meshesDistance * 3.5;
coneOne.position.x = 1.3;

const torusOne = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.3, 0.3, 4, 8),
  sectionsMaterial
);
torusOne.position.y = -meshesDistance * 4.5;
torusOne.position.x = -1.2;

scene.add(heroMesh, sphereOne, coneOne, IcosahedronOne, torusOne);

const meshesList = [heroMesh, sphereOne, coneOne, IcosahedronOne, torusOne];

/**
 * Particles
 */

// Geometry
const particlesCount = 800;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < positions.length; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    meshesDistance * 0.5 - Math.random() * meshesDistance * sectionsCount;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Material
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight("white", 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */

// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
});

/**
 * Cursor
 */

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate Camera
  camera.position.y = (-scrollY / sizes.height) * meshesDistance;
  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Animate Meshes
  for (const mesh of meshesList) {
    mesh.rotation.x = elapsedTime * 0.05;
    mesh.rotation.y = elapsedTime * 0.12;
  }

  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
