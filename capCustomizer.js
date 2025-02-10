
import * as THREE from 'three';
import { GLTFLoader } from "./three/GLTFLoader.js";
import { OrbitControls } from './three/OrbitControls.js';
import { RGBELoader } from './three/RGBELoader.js';
import { RectAreaLightHelper } from './three//RectAreaLightHelper.js';

let loadingDiv = document.getElementById('loadingDiv');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const container = document.getElementById("threejscanvas")



const renderer = new THREE.WebGLRenderer({canvas: container, antialias: true});
renderer.setSize( container.clientWidth, container.clientHeight );

//document.body.appendChild( renderer.domElement );'


const controls = new OrbitControls( camera, renderer.domElement );

camera.position.x = 0.5;
camera.position.y = 0.2;
camera.position.z = 0;

//controls.target.set(-1, 1, 1);



controls.enableDamping = true;
controls.dampingFactor = 0.02;
controls.rotateSpeed = 0.5




let capScene;


let textureLoader = new THREE.TextureLoader();



var clock = new THREE.Clock()
var delta = clock.getDelta();





// ---------------------------------------------------------------------
// HDRI - IMAGE BASED LIGHTING
// ---------------------------------------------------------------------
new RGBELoader()
.setPath('./assets/')
.load('brown_photostudio_01_2k.hdr', function (texture) {

    
    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.environment = texture;
    scene.background = new THREE.Color(0.3,0.3,0.4)
 

});


var loadingManager = new THREE.LoadingManager();

loadingManager.onLoad = function(){

  loadingDiv.style.display = "none";

}


const loader = new GLTFLoader(loadingManager);
loader.load(
// resource URL
'./assets/cap.glb',
//'https://storage.googleapis.com/dheerajv-bucket/images/aorta.glb',
// called when the resource is loaded
function ( gltf ) {


    capScene = gltf.scene;
    scene.add( capScene);


});






//////////////////////////////
window.addEventListener('resize', function()

{
var width = window.innerWidth;
var height = window.innerHeight;
renderer.setSize( width, height );
camera.aspect = width / height;
camera.updateProjectionMatrix();
} );





function animate(time) {
    requestAnimationFrame( animate );
    controls.update();


    renderer.render( scene, camera );
    

}
animate();

