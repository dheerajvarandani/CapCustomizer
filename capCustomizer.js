
import * as THREE from 'three';
import { GLTFLoader } from "./three/GLTFLoader.js";
import { OrbitControls } from './three/OrbitControls.js';
import { RGBELoader } from './three/RGBELoader.js';
import { DecalGeometry } from './three//DecalGeometry.js';

let loadingDiv = document.getElementById('loadingDiv');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const container = document.getElementById("threejscanvas")

var leftFile = null;
var rightFile = null;
var leftScreenshotFile = null;
var rightScreenshotFile = null;

const renderer = new THREE.WebGLRenderer({canvas: container, antialias: true, preserveDrawingBuffer:true,alpha:true});
renderer.setSize( container.clientWidth, container.clientHeight );

const controls = new OrbitControls( camera, renderer.domElement );

camera.position.x = 0.17;
camera.position.y = 0.2;
camera.position.z = 0.3 ;

camera.lookAt(new THREE.Vector3(0,0.17,0));
controls.target.set(0,0.17,0);


//controls.enableZoom = false;
controls.enablePan = false;
controls.enableDamping = true;
controls.dampingFactor = 0.02;
controls.rotateSpeed = 0.5
controls.minDistance = 0.3;
controls.maxDistance = 0.6;

const DEFAULT_SCALE = 0.05;


let capScene, cap, cap_inner;
let a3Marker, leftMarker, rightMarker;
let a3Decal;
let textureLoader = new THREE.TextureLoader();

var clock = new THREE.Clock()
var delta = clock.getDelta();



var leftDecal = {   mesh: null,
                    width: DEFAULT_SCALE,
                    height: DEFAULT_SCALE,
                    position: null,
                    url: null
                }

var rightDecal = {   mesh: null,
                    width: DEFAULT_SCALE,
                    height: DEFAULT_SCALE,
                    position: null,
                    url: null
                };



// ---------------------------------------------------------------------
// HDRI - IMAGE BASED LIGHTING
// ---------------------------------------------------------------------
new RGBELoader()
.setPath('./assets/')
.load('photo_studio_02_2k.hdr', function (texture) {

    var backgroundTexture = textureLoader.load( './assets/background.jpg' );
    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.environment = texture;
    //scene.background = texture;
    //scene.background = backgroundTexture;
 

});


var loadingManager = new THREE.LoadingManager();

loadingManager.onLoad = function(){

  loadingDiv.style.display = "none";

  a3Decal = createDecal("./assets/logo.png",a3Marker,new THREE.Vector3(0.046,0.036,0.04))
  //var leftDecal.mesh = createDecal("./assets/logo.png",leftMarker,new THREE.Vector3(0.05,0.05,0.05))
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

    cap.material.color = new THREE.Color("#1B365D");
    cap_inner.material.color = new THREE.Color("#1B365D");

    //markers for logo decals
    a3Marker = capScene.getObjectByName('A3_marker');
    a3Marker.visible = false;
    leftMarker = capScene.getObjectByName('left_marker');
    leftMarker.visible = false;
    rightMarker = capScene.getObjectByName('right_marker');
    rightMarker.visible = false;

    /*
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(cap);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Calculate the distance the camera needs to be to fit the model
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    // Adjust camera position
    camera.position.z = cameraZ/5;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Update controls
    controls.maxDistance = cameraZ * 0.5;
    controls.update();

    // Render the scene
    renderer.render(scene, camera);
    */





    const geometry = new THREE.BoxGeometry( 0.05,0.05,0.05 ); 
    const material = new THREE.MeshStandardMaterial( {wireframe:true, side:THREE.DoubleSide} ); 
    const cube = new THREE.Mesh( geometry, material ); 
    cube.position.set(leftMarker.position.x,leftMarker.position.y,leftMarker.position.z);
    cube.rotation.set(leftMarker.rotation.x,leftMarker.rotation.y,leftMarker.rotation.z)

    //scene.add( cube );




});



// scaling decals //

function changeScale(decal,newScale){

    if(decal == "left"){
        scene.remove(leftDecal.mesh);
        leftDecal.mesh = createDecal(leftDecal.url, leftMarker, new THREE.Vector3(leftDecal.width / 8 * newScale,leftDecal.height / 8 * newScale,0.15))
    }
    else if(decal == "right"){
        scene.remove(rightDecal.mesh);
        rightDecal.mesh = createDecal(rightDecal.url, rightMarker, new THREE.Vector3(rightDecal.width / 8 * newScale,rightDecal.height / 8 * newScale,0.15))
        //console.log(rightDecal.width,rightDecal.height)
    }


}


var leftScale = document.getElementById("left-scale");

leftScale.addEventListener("input", function(){

    changeScale("left",this.value)
    //console.log(camera.position)
    //var currLookAt = (new THREE.Vector3( 0, 0, -1 )).applyQuaternion( camera.quaternion ).add( camera.position ); //get lookat vector, 0.5 is distance from camera
    //console.log(currLookAt)

})

var rightScale = document.getElementById("right-scale");

rightScale.addEventListener("input", function(){

    changeScale("right",this.value)
})




//////////////////////////////

// COLOR PICKER //

var capColor = new THREE.Color();
var colorField = document.getElementById("color-text");

var swatches = document.getElementsByClassName("swatch");

for(var i=0; i < swatches.length; i++){

    swatches[i].addEventListener("click", function(){
        capColor.set(this.dataset.color);
        cap.material.color = capColor;
        cap_inner.material.color = capColor;

        colorField.value = this.dataset.value;

        if(this.dataset.logo == "black"){

            scene.remove(a3Decal);
            a3Decal = createDecal("./assets/logo_dark.png",a3Marker,new THREE.Vector3(0.052,0.04,0.04))
        }
        else{

            scene.remove(a3Decal);
            a3Decal = createDecal("./assets/logo.png",a3Marker,new THREE.Vector3(0.052,0.04,0.04))

        }
        
    })

}

/*
var colorPickerInput = document.getElementById("color-picker-input");

colorPickerInput.addEventListener("input", function(){
    capColor.set(this.value)
    cap.material.color = capColor;
    cap_inner.material.color = capColor;
})
*/



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

function leftDecalUpload(file){    


        scene.remove(leftDecal.mesh)
        leftDecal.url = URL.createObjectURL(file)
    
        var img = new Image();
        img.src = leftDecal.url;
    
        var width = DEFAULT_SCALE;
        var height = DEFAULT_SCALE;
    
        img.onload = function(){
    
            leftScale.value = 8;
    
            if(img.width > img.height){
                var factor = img.width / img.height;
                width = width * factor;
                leftDecal.width = width;
                leftDecal.height = height;
    
            }
            else if(img.height > img.width){
                var factor = img.height / img.width;
                height = height * factor;
                leftDecal.height = height;
                leftDecal.width = width;
    
    
            }
            else if(img.width == img.height){
    
                width = width;
                height = height;
                leftDecal.height = height;
                leftDecal.width = width;
            }
    
            leftDecal.mesh = createDecal(leftDecal.url, leftMarker, new THREE.Vector3(width,height,0.15))
        }

        leftFile = file;
        

}

function rightDecalUpload(file){
      

    scene.remove(rightDecal.mesh)
    rightDecal.url = URL.createObjectURL(file)

    var img = new Image();
    img.src = rightDecal.url;

    var width = 0.05;
    var height = 0.05;

    img.onload = function(){

        rightScale.value = 8;

        if(img.width > img.height){
            var factor = img.width / img.height;
            width = width * factor;
            rightDecal.width = width;
            rightDecal.height = height;

        }
        else if(img.height > img.width){
            var factor = img.height / img.width;
            height = height * factor;
            rightDecal.width = width;
            rightDecal.height = height;

        }
        else if(img.height == img.width){

            width = width;
            height = height;
            rightDecal.height = height;
            rightDecal.width = width;

        }


        rightDecal.mesh = createDecal(rightDecal.url, rightMarker, new THREE.Vector3(width,height,0.15))
    }

    rightFile = file;

}

function dataURLtoFile(dataURL, filename) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1]; // Extract MIME type
    const byteString = atob(arr[1]); // Decode Base64
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    return new File([uint8Array], filename, { type: mime });
}

async function uploadImageToDrive(file) {

    return new Promise((resolve, reject) => {

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function () {
        const base64 = reader.result.split(',')[1]; // Remove data URL prefix
        const formData = new URLSearchParams();
        formData.append("image", base64);
        formData.append("mimetype", file.type);
        formData.append("filename", file.name);

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbykFOx3aVd-aMyqX43PGYemaq_ljLOWszht9n_Dmbw0EDfcOdQzc9ftY6r0R6pW6j91ng/exec", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            resolve(result.url)
        } catch (error) {
            reject(error)
        }
    };
  })
}



var leftLogoInput = document.getElementById("left-logo-upload");
var rightLogoInput = document.getElementById("right-logo-upload");

leftLogoInput.addEventListener("change", function(){

    leftDecalUpload(this.files[0]);

    if(bothSides.checked){
     rightDecalUpload(this.files[0]);
    }


    //uploadImageToDrive(this.files[0])

})

rightLogoInput.addEventListener("change", function(){

    rightDecalUpload(this.files[0]);

    if(bothSides.checked){
        leftDecalUpload(this.files[0]);
    }
    
    console.log(leftDecal.url,rightDecal.url)

})


var removeLeftDecalBtn = document.getElementById("remove-left-logo");
removeLeftDecalBtn.addEventListener("click",function(){

    if(leftDecal.mesh){
    scene.remove(leftDecal.mesh)
    leftDecal.url = null;
    }


})

var removeRightDecalBtn = document.getElementById("remove-right-logo");
removeRightDecalBtn.addEventListener("click",function(){

    if(rightDecal.mesh){
    scene.remove(rightDecal.mesh)
    rightDecal.url = null;
    }

})


var bothSides = document.getElementById("both-sides");

bothSides.addEventListener("click",function(){  

    if(this.checked){

        if(leftDecal.url != null && rightDecal.url == null){

            rightDecal.mesh = createDecal(leftDecal.url, rightMarker, new THREE.Vector3(leftDecal.width,leftDecal.height,0.15))
            rightDecal.url = leftDecal.url;

        }

        else if(leftDecal.url == null && rightDecal.url != null){

            leftDecal.mesh = createDecal(rightDecal.url, leftMarker, new THREE.Vector3(rightDecal.width,rightDecal.height,0.15))
            leftDecal.url = rightDecal.url;
        }
}

})

/*
var submitBtn = document.getElementById("submit-btn");

submitBtn.addEventListener("click",function(){
    
        if(leftFile != null){
            uploadImageToDrive(leftFile).then((url) => {
                leftScreenshotFile = url;
            })
        }
    
        if(rightFile != null){
            uploadImageToDrive(rightFile).then((url) => {
                rightScreenshotFile = url;
            })
        }
    
        console.log(leftScreenshotFile,rightScreenshotFile)
    
    })  
*/
    

function setCamera(position) {



    camera.position.set(position.x, position.y, position.z)
    //camera.lookAt(new THREE.Vector3(0, 0, 0))

    renderer.render(scene, camera)



}





async function generateLeftLogoUrl(){

    var url = await uploadImageToDrive(leftFile);
    leftUrlField.value = url; // Set the returned URL to the text field
    

}

async function generateRightLogoUrl(){

    var url = await uploadImageToDrive(leftFile);
    rightUrlField.value = url; // Set the returned URL to the text field

}

async function generateLeftSSUrl(){

    var leftSSUrl = await uploadImageToDrive(createLeftScreenshotFile());
    leftSSurlField.value = leftSSUrl;

}

async function generateRightSSUrl(){

    var rightSSUrl = await uploadImageToDrive(createRightScreenshotFile());
    rightSSurlField.value = rightSSUrl;

}

function createLeftScreenshotFile(){

    //setCamera(new THREE.Vector3(0.5,0.3,0));
    //controls.target.set(0,0.1,0)

    camera.position.x= 0.3197145402931859;
    camera.position.y= 0.12059119417984965;
    camera.position.z= 0.12305032560925093;
    camera.lookAt(new THREE.Vector3(-0.9237064558894159,0.14274994459747486,-0.3555120766804307));

    const dataURL = renderer.domElement.toDataURL( 'image/png' );

    return(dataURLtoFile(dataURL,"left_ss.png"))

}

function createRightScreenshotFile(){ 

    
    //setCamera(new THREE.Vector3(-2,0.3,0));
    //controls.target.set(0.15,0.05,0.1)

    camera.position.x =  -0.32085163138353295
    camera.position.y =  0.08759092296464484
    camera.position.z =  0.10031437913233487
    camera.lookAt(new THREE.Vector3(0.9269916939649954,0.2380930076299945,-0.2898242899372163));

    const dataURL = renderer.domElement.toDataURL( 'image/png' );   
    return(dataURLtoFile(dataURL,"right_ss.png"))

}


//screenshot//
var exportBtn = document.getElementById('export');

exportBtn.addEventListener("click",function(){


    setCamera(new THREE.Vector3(0.5,0.3,0));
    screenshot("left_screenshot")

    //setCamera(new THREE.Vector3(-2,0.3,0));
    //screenshot("right_screenshot")



    /*
    camera.position.x = -0.5;
    camera.position.z = 0.1;
    camera.position.z = 0.2;
    camera.lookAt(new THREE.Vector3(0,0,0))
    */








})



var leftUrlField = document.getElementById("left-logo-url");
var rightUrlField = document.getElementById("right-logo-url");
var leftSSurlField = document.getElementById("left-ss-url");
var rightSSurlField = document.getElementById("right-ss-url");

//submit form//
document.getElementById("order-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent the default form submission
    
    // Ensure all image URLs are generated before submitting the form
    const uploadPromises = [];
        
    if(leftFile != null) {
        uploadPromises.push(generateLeftLogoUrl());
        uploadPromises.push(generateLeftSSUrl());
    }

    if(rightFile != null) {
        uploadPromises.push(generateRightLogoUrl());
        uploadPromises.push(generateRightSSUrl());
    }

    try {
        // Wait for all URL generation to finish
        await Promise.all(uploadPromises);
        
        // Once all URLs are populated, submit the form
        let formData = new FormData(this);
        await fetch("https://docs.google.com/forms/d/e/1FAIpQLSeUVH40qdP9Z3lFYcyra7G-hUwE58VD6Id_oHiDbSMSHaSHaQ/formResponse", {
            method: "POST",
            body: formData,
            mode: "no-cors" // Prevent CORS issues
        });
        
        // Show modal after successful submission
        $("#results-modal").modal("show");
        $("#capOrderModal").modal("hide");
        
        this.reset(); // Reset the form

    } catch (error) {
        console.error("Error:", error);
    }
    
});

//////

document.addEventListener('keydown', function(event) {
    if (event.key === 'c' || event.key === 'C') {

        const cameraPosition = camera.position;
        console.log('camera.position.x:', cameraPosition.x);
        console.log('camera.position.y:', cameraPosition.y);
        console.log('camera.position.z:', cameraPosition.z);            

        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        console.log('camera.lookAt(new THREE.Vector3(' + cameraDirection.x + ',' + cameraDirection.y + ',' + cameraDirection.z + '));');
        // Your code to handle the C key press here
    }
});

/////
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

