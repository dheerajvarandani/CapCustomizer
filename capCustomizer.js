
import * as THREE from 'three';
import { GLTFLoader } from "./three/GLTFLoader.js";
import { OrbitControls } from './three/OrbitControls.js';
import { RGBELoader } from './three/RGBELoader.js';
import { DecalGeometry } from './three//DecalGeometry.js';

let loadingDiv = document.getElementById('loadingDiv');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const container = document.getElementById("threejscanvas")



const renderer = new THREE.WebGLRenderer({canvas: container, antialias: true});
renderer.setSize( container.clientWidth, container.clientHeight );

const controls = new OrbitControls( camera, renderer.domElement );

camera.position.x = 0.5;
camera.position.y = 0.3;
camera.position.z = 0;

//camera.lookAt(new THREE.Vector3(0, 1, 0));
//controls.target.set(0,1,0);

//controls.enableZoom = false;
//controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.02;
controls.rotateSpeed = 0.5




let capScene, cap;
let a3Marker;
let textureLoader = new THREE.TextureLoader();

var clock = new THREE.Clock()
var delta = clock.getDelta();







// ---------------------------------------------------------------------
// HDRI - IMAGE BASED LIGHTING
// ---------------------------------------------------------------------
new RGBELoader()
.setPath('./assets/')
.load('photo_studio_01_2k.hdr', function (texture) {

    var backgroundTexture = textureLoader.load( './assets/background.jpg' );
    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.environment = texture;
    scene.background = backgroundTexture
 

});


var loadingManager = new THREE.LoadingManager();

loadingManager.onLoad = function(){

  loadingDiv.style.display = "none";

}


const loader = new GLTFLoader(loadingManager);
loader.load(
// resource URL
'./assets/cap.gltf',
//'https://storage.googleapis.com/dheerajv-bucket/images/aorta.glb',
// called when the resource is loaded
function ( gltf ) {


    capScene = gltf.scene;
    scene.add( capScene);
    cap = capScene.getObjectByName('cap');
    a3Marker = capScene.getObjectByName('A3_marker');
    a3Marker.visible = false;

    const texture = textureLoader.load("./assets/logo.png")
    texture.flipY = true;

    //const geometry =  new DecalGeometry( cap, new THREE.Vector3(0,0,0), new THREE.Euler(0,0,0), new THREE.Vector3(0.2,0.2,0.2) );
    const a3Geometry =  new DecalGeometry( cap, a3Marker.position, new THREE.Euler().setFromQuaternion(new THREE.Quaternion(0,0,0,0)), new THREE.Vector3(0.05,0.05,0.1) );
    const a3Material = new THREE.MeshBasicMaterial( { 
        map:texture,
        transparent:true,
        side: THREE.FrontSide,
        depthTest:true,
        depthWrite:false,
        polygonOffset:true,
        polygonOffsetFactor: -4 } );
    const decal = new THREE.Mesh( a3Geometry, a3Material );
    scene.add( decal );


    const geometry = new THREE.BoxGeometry( 0.05,0.05,0.05 ); 
    const material = new THREE.MeshStandardMaterial( {wireframe:true, side:THREE.DoubleSide} ); 
    const cube = new THREE.Mesh( geometry, material ); 
    cube.position.set(a3Marker.position.x,a3Marker.position.y,a3Marker.position.z);
    cube.rotation.set(-0.78,0,0)
    console.log(cube)
    //scene.add( cube );

    
    console.log(new THREE.Matrix4)


});






//////////////////////////////




// DECALS //














//////
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

    /*
    const raycaster = new THREE.Raycaster();
    const pos = {x:0, y:0}

    raycaster.setFromCamera(pos,camera)
    const hits = raycaster.intersectObjects(capScene.children)

    console.log(hits[0].point)
    */


    renderer.render( scene, camera );
    

}
animate();

