import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.5, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(3, 5, 4);
scene.add(directionalLight);

const loader = new GLTFLoader();

loader.load(
    "../js/scene.gltf",
    (gltf) => {
        const model = gltf.scene;

        model.scale.set(0, 0, 0);
        model.position.set(0, -2, 0);
        scene.add(model);

        const tl = gsap.timeline({
            onStart: () => {
                controls.enabled = false;
            },
            onComplete: () => {
                controls.enabled = true;
            }
        });

        tl.to(model.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 1.5 }, 0)
            .to(model.position, { y: -1, duration: 1.5 }, 0)
            .to(model.rotation, { y: 6.8, duration: 2 }, 0)
            .from(camera.position, { z: 8, y: 4, duration: 2 }, 0);
    },
    undefined,
    (error) => {
        console.error("Model loading error:", error);
    }
);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});