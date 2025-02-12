
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




let capScene, cap, cap_inner;
let a3Marker, leftMarker, rightMarker;
let leftDecal, rightDecal;
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

  createDecal("./assets/logo.png",a3Marker,new THREE.Vector3(0.04,0.04,0.04))
  //var leftDecal = createDecal("./assets/logo.png",leftMarker,new THREE.Vector3(0.05,0.05,0.05))
  //createDecal("./assets/logo.png",rightMarker,new THREE.Vector3(0.05,0.05,0.05))


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
    cap = capScene.getObjectByName('cap_1');
    cap_inner = capScene.getObjectByName('cap_2');

    //markers for logo decals
    a3Marker = capScene.getObjectByName('A3_marker');
    a3Marker.visible = false;
    leftMarker = capScene.getObjectByName('left_marker');
    leftMarker.visible = false;
    rightMarker = capScene.getObjectByName('right_marker');
    rightMarker.visible = false;





    const geometry = new THREE.BoxGeometry( 0.05,0.05,0.05 ); 
    const material = new THREE.MeshStandardMaterial( {wireframe:true, side:THREE.DoubleSide} ); 
    const cube = new THREE.Mesh( geometry, material ); 
    cube.position.set(leftMarker.position.x,leftMarker.position.y,leftMarker.position.z);
    cube.rotation.set(leftMarker.rotation.x,leftMarker.rotation.y,leftMarker.rotation.z)

    //scene.add( cube );




});






//////////////////////////////

// COLOR PICKER //

var capColor = new THREE.Color()

var swatches = document.getElementsByClassName("swatch");

for(var i=0; i < swatches.length; i++){

    swatches[i].addEventListener("click", function(){
        capColor.set(this.dataset.color);
        cap.material.color = capColor;
        cap_inner.material.color = capColor;
    })

}

var colorPickerInput = document.getElementById("color-picker-input");

colorPickerInput.addEventListener("input", function(){
    capColor.set(this.value)
    cap.material.color = capColor;
    cap_inner.material.color = capColor;
})



// DECALS //


function createDecal(texturePath,marker,scale){

    const decalTexture = textureLoader.load(texturePath)
    decalTexture.flipY = false;
    
    const decalGeometry =  new DecalGeometry( cap, marker.position, new THREE.Euler().setFromQuaternion(new THREE.Quaternion(marker.rotation.x,marker.rotation.y,marker.rotation.z)), scale );
    const decalMaterial = new THREE.MeshBasicMaterial( { 
        map:decalTexture,
        transparent:true,
        side: THREE.FrontSide,
        depthTest:true,
        depthWrite:false,
        polygonOffset:true,
        polygonOffsetFactor: -4 } );
    const decal = new THREE.Mesh( decalGeometry, decalMaterial );
    scene.add( decal );
    

    return decal;



}



// Logo Upload //

var leftLogoInput = document.getElementById("left-logo-upload");
var rightLogoInput = document.getElementById("right-logo-upload");

leftLogoInput.addEventListener("change", function(){

    scene.remove(leftDecal)
    leftDecal = createDecal(URL.createObjectURL(this.files[0]), leftMarker, new THREE.Vector3(0.1,0.1,0.05))

})

rightLogoInput.addEventListener("change", function(){

    scene.remove(rightDecal)
    rightDecal = createDecal(URL.createObjectURL(this.files[0]), rightMarker, new THREE.Vector3(0.1,0.1,0.05))

})







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

