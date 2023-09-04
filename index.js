
import {
    AmbientLight,
    AxesHelper,
    DirectionalLight,
    GridHelper,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Raycaster,
    Object3D,
    Color,
    BoxGeometry,
    Mesh,
    SphereGeometry,
    LineBasicMaterial,
    Line,
    BufferGeometry,
    Vector3,
    BufferAttribute,
    DoubleSide,
    Shape,
    MeshPhongMaterial,
    Plane,
    AlwaysStencilFunc,
    BackSide,
    IncrementStencilOp,
    IncrementWrapStencilOp,
    DecrementWrapStencilOp,
    FrontSide,
    CameraHelper,
    NearestFilter,
    RepeatWrapping,
    MathUtils,




} from "three";
//import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { IFCLoader } from "web-ifc-three/IFCLoader";
import { MeshBVH, acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";
import { Vector2 } from "three";
import { MeshBasicMaterial } from "three";
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { OBB } from 'three/examples/jsm/math/OBB'
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

import { Flow } from 'three/examples/jsm/modifiers/CurveModifier'
//addons/modifiers/CurveModifier.js';

import {
    IFCWALLSTANDARDCASE,
    IFCSLAB,
    IFCFURNISHINGELEMENT,
    IFCDOOR,
    IFCWINDOW,
    IFCPLATE,
    IFCMEMBER,
    IFCBUILDINGSTOREY,
    IFCSANITARYTERMINAL,
    IFCPOLYLINE,
    IFCCARTESIANPOINT,
    IfcAPI,
    IfcOpeningElement,
    IFCOPENINGELEMENT,
    IFCRELVOIDSELEMENT,
    IFCRELASSOCIATESMATERIAL,
    IFCPOLYLOOP,
    IfcWallStandardCase,
    IFCCARTESIANTRANSFORMATIONOPERATOR3D,
    IFCSANITARYTERMINALTYPE,
    IFCFLOWTERMINAL,
    IfcThermalExpansionCoefficientMeasure,
    IfcRationalBSplineCurveWithKnots

} from "web-ifc";
import { ExtrudeGeometry } from "three";
import { WireframeGeometry } from "three";
import { LineSegments } from "three";
import { EdgesGeometry } from "three";
import { Box3 } from "three";
import { PlaneBufferGeometry } from "three";
import { Group } from "three";
import { PlaneHelper } from "three";
import { OrthographicCamera } from "three";
import { BoxHelper } from "three";
import { TextureLoader } from "three";
import { VideoTexture } from "three";
import { RGBFormat } from "three";
import { ObjectLoader } from "three";
import { WebGLCubeRenderTarget } from "three";
import { CubeCamera } from "three";
import { Curve } from "three";
import { LineCurve } from "three";
import { LineCurve3 } from "three";
import { LineLoop } from "three";
import { CatmullRomCurve3 } from "three";
import { CurvePath } from "three";
import { Clock } from "three";
// import { render } from "express/lib/response";


//Creates the Three.js scene
const scene = new Scene();

//Object to store the size of the viewport
const size = {
    width: window.innerWidth,
    height: window.innerHeight,
};

//Creates the camera (point of view of the user)
let camera = new OrthographicCamera(size.width / - 40, size.width / 40, size.height / 40, size.height / - 40, 1, 1000 )
//new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 15;
camera.position.y = 13;
camera.position.x = 8;

//Creates the lights of the scene
const lightColor = 0xffffff;

const ambientLight = new AmbientLight(lightColor, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(lightColor, 2);
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);


//Sets up the renderer, fetching the canvas of the HTML
const canvas = document.getElementById("three-canvas");
const renderer = new WebGLRenderer({ canvas: canvas, alpha: true });

renderer.setSize(size.width, size.height);
// renderer.xr.enabled = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


//Creates grids and axes in the scene
const grid = new GridHelper(10, 10);
scene.add(grid)

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 1;
scene.add(axes)


//Creates the orbit controls (to navigate the scene)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(-2, 0, 0);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.top = '20rem';
document.body.appendChild( labelRenderer.domElement );


// const vrBtn = VRButton.createButton(renderer);
// document.body.appendChild(vrBtn)

//IFC Loading
const ifcModels = [];
const loader = new IFCLoader();
let model;
let lastModel;
let lastFurniture;
let data;
let blob;

loader.ifcManager.setupThreeMeshBVH(computeBoundsTree, disposeBoundsTree, acceleratedRaycast);




// const input = document.getElementById("file-input");
// loader.ifcManager.setWasmPath('wasm/');

// input.addEventListener('change', async()=> {
//     const file = input.files[0];
//     const url = URL.createObjectURL(file);
//     const model = await loader.loadAsync(url);
//     scene.add(model);
//     ifcModels.push(model);
//     await editFloorName();
// });
//const result = prompt("New height for the storey: ")
//var zValue = parseInt(result);
var zValue = 4;

async function loadingIfc(path) {
    await  loader.ifcManager.setWasmPath('wasm/');
    model = await loader.loadAsync(path);


    // document.querySelector('#uploadmode').addEventListener('click', function(){
    //     //console.log("Button clicked Uploadmode" )
    //     scene.add(model)
    //     ifcModels.push(model);

    // })

    // document.querySelector('#drawmode').addEventListener('click', function(){
    //     //console.log("Button clicked " )
    //     scene.remove(model)
    //     model.removeFromParent();
    //     //console.log(ifcModels)
    //     ifcModels.pop()
    // })


    model.removeFromParent();


    //await getAll();
    ifcModels.push(model);
    return model
    //await editToiletPosition();

    //await editFloorName();
    //await editPosition(zValue);
    // await editWall();

}

let ifcProject
async function showModel(){
    const ifcModel = await loadingIfc('./ifc/badewanne.ifc');
    scene.add(ifcModel)

    ifcProject = await loader.ifcManager.getSpatialStructure(model.modelID);

    //console.log("ifcProject", ifcProject)


    return ifcModel
}


// // Instantiate a loader
// const gltfloader = new GLTFLoader();

// // Optional: Provide a DRACOLoader instance to decode compressed mesh data
// // const dracoLoader = new DRACOLoader();
// // dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
// // gltfloader.setDRACOLoader( dracoLoader );

// // Load a glTF resource
// gltfloader.load(
// 	// resource URL
// 	'Animations/gltf/scene.gltf',
// 	// called when the resource is loaded
// 	function ( gltf ) {


//         //console.log("Object", gltf)

// 		scene.add( gltf.scene );

// 		gltf.animations; // Array<THREE.AnimationClip>
// 		gltf.scene; // THREE.Group
// 		gltf.scenes; // Array<THREE.Group>
// 		gltf.cameras; // Array<THREE.Camera>
// 		gltf.asset; // Object

//         gltf.scenes[0].scale.x = 0.04
//         gltf.scenes[0].scale.y = 0.04
//         gltf.scenes[0].scale.z = 0.04

//         //console.log("camra", camera)
//         gltf.scenes[0].position.set(camera.position.x, camera.position.y, camera.position.z)

// 	},
// 	// called while loading is progressing
// 	function ( xhr ) {

// 		//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

// 	},
// 	// called when loading has errors
// 	function ( error ) {

// 		//console.log( 'An error happened' );

// 	}
// );

// // instantiate a loader
// const objloader = new OBJLoader();

// // load a resource
// objloader.load(
// 	// resource URL
// 	'Animations/obj/Rollstuhl-ohne-person.obj/klein.obj/klein.obj',
// 	// called when resource is loaded
// 	function ( object ) {


//         object.scale.x = 0.003
//         object.scale.y = 0.003
//         object.scale.z = 0.003

//         object.position.set(0,0,0)

//         //console.log("Object", object)
// 		scene.add( object );


// 	},
// 	// called when loading is in progresses
// 	function ( xhr ) {

// 		//console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

// 	},
// 	// called when loading has errors
// 	function ( error ) {

// 		//console.log( 'An error happened' );

// 	}
// );


let flow;
let deleteButton;
const orangeColor = new Color('rgb(255,94,0)')
const greyColor = new Color(0x858585)

const translationList = [];
let ifcModel
const allids = [];
let furnitureSubset;
const startPositionsFurns = [];
const allSubsetMeshes = [];
const allSubsetMeshesIDs = [];
const foundMeshesCheckbox = [];
const allEntriesSecond = [];
const areaMeshes = [];
const noSpecificAreaIndex = [];
const modifiedDirections = [];
let  areas = []
const ReferencePositionAreas = [];
const centerPoints = [];
const locationSaver = [];
const spheresLocal = [];
const noSpecificFurnIDList = [];
const sizesBB = [];

const ReferenceDirections = [];
const ReferenceDirectionsAreas = [];
const ReferencePositions = [];
const collidedIDs = [];
const collidedWithIDs = [];

const wallBounds = [];
const wallSubsetMeshes = [];
const wallSubsetMeshesIDs = [];

let allIDsInChecker;

const checkedMats = [];
const specificFurnIDList = [];
const areasInFront = [];
const boundingCubesInFront = [];

const labels = [];

const curveHandles = [];
let allLists;

let infomodeIsActive = false;
let uploadmodeIsActive = false;
let drawmodeIsActive = false;
let furnituremodeIsActive = false;
let  checkedBtnmodeIsActive = false;
let checkallmodeIsActive = false;
let dincheckmodeIsActive = false;
let storymodeIsActive = false;
let downloadmodeIsActive = false;
let dincheckBtnIsActive = false;

let nextUploadIsActive = false;
let nextAreasIsActive = false;
let nextDINCheckIsActive = false;
let nextPlanningIsActive = false;
let nextDownloadIsActive = false;

const checkedList = [];
const indices = [];

const checkedListContains = [];
const indicesContains = [];

const checkedListInFront = [];
const indicesInFront = [];

const checkedListContainsInFront = [];
const indicesContainsInFront = [];

const checkedListIntersectFurn = [];
const indicesIntersectFurn = [];

const checkedListContainsFurn = [];
const indicesContainsFurn = [];

const checkedListIntersectFurnInFront = [];
const indicesIntersectFurnInFront = [];

const checkedListContainsFurnInFront = [];
const indicesContainsFurnInFront = [];


const checkedListIntersectFurnAndAreaInFront = [];
const indicesIntersectFurnAndAreaInFront = []

const checkedListContainsFurnAndAreaInFront = [];
const indicesContainsFurnAndAreaInFront = [];


const checkedListIntersectFurnAndArea = [];
const indicesIntersectFurnAndArea = []

const checkedListContainsFurnAndArea = [];
const indicesContainsFurnAndArea = [];

const checkedListIntersectAreaAndFurn = [];
const indicesIntersectAreaAndFurn = []

const checkedListContainsAreaAndFurn = [];
const indicesContainsAreaAndFurn = [];

const checkedListAreaIntersectWall = [];
const indicesIntersectAreaAndWall = [];

const checkedListAreaContainsWall = [];
const indicesContainsAreaAndWall = [];

const checkedListFurnIntersectWall = [];
const indicesIntersectFurnAndWall = [];

const checkedListFurnContainsWall = [];
const indicesContainsFurnAndWall = [];

const positionsCollisions = [];
const allIdsFalseAreaIntersectArea = [];
const falsePositionsAreaIntersectArea = [];

const allIdsFalseAreaContainsArea = [];
const falsePositionsAreaContainsArea = [];

const allIdsFalseAreaIntersectFurn = [];
const falsePositionsAreaIntersectFurn = [];

const allIdsFalseAreaContainsFurn = [];
const falsePositionsAreaContainsFurn = [];

const allIdsFalseFurnIntersectArea = [];
const falsePositionsFurnIntersectArea = [];

const allIdsFalseFurnContainsArea = [];
const falsePositionsFurnContainsArea  = [];

const allIdsFalseFurnIntersectFurn = [];
const falsePositionsFurnIntersectFurn = [];

const allIdsFalseFurnContainsFurn = [];
const falsePositionsFurnContainsFurn = [];

const allIdsFalseAreaIntersectWall = [];
const falsePositionsAreaIntersectWall = [];

const allIdsFalseAreaContainsWall = [];
const falsePositionsAreaContainsWall = [];

const allIdsFalseFurnContainsWall = [];
const falsePositionsFurnContainsWall = [];

const allIdsFalseFurnIntersectWall = [];
const falsePositionsFurnIntersectWall = [];

const allIdsFalseAreaIntersectAreaInFront = [];
const falsePositionsAreaIntersectAreaInFront = [];

const allIdsFalseAreaContainsAreaInFront = [];
const falsePositionsAreaContainsAreaInFront = [];

const allIdsFalseAreaIntersectFurnInFront = [];
const falsePositionsAreaIntersectFurnInFront = [];

const allIdsFalseAreaContainsFurnInFront = [];
const falsePositionsAreaContainsFurnInFront = [];

const allIdsFalseFurnIntersectFurnInFront = [];
const falsePositionsFurnIntersectFurnInFront = [];

const allIdsFalseFurnContainsFurnInFront = [];
const falsePositionsFurnContainsFurnInFront = [];


const truePositions = [];
const allIdsTrue = [];

const noIntersectionsIDsAreaIntersectAreaInFront = [];
const IntersectionsIDsAreaIntersectAreaInFront = [];
const IntersectionsIDsAreaIntersectAreaWithInFront = [];

const noIntersectionsIDsAreaContainAreaInFront = [];
const IntersectionsIDsAreaContainAreaInFront = [];
const IntersectionsIDsAreaContainAreaWithInFront = [];

const noIntersectionsIDsInFront = [];
const IntersectionsIDsInFront = [];
const IntersectionsIDsWithInFront = [];

const noIntersectionsIDsAreaContainFurnInFront = [];
const IntersectionsIDsAreaContainFurnInFront = [];
const IntersectionsIDsAreaContainFurnWithInFront = [];

const noIntersectionsIDsFurnIntersectFurnInFront = [];
const IntersectionsIDsFurnIntersectFurnInFront = [];
const IntersectionsIDsFurnIntersectFurnWithInFront = [];

const noIntersectionsIDsFurnContainFurnInFront = [];
const IntersectionsIDsFurnContainFurnInFront = [];
const IntersectionsIDsFurnContainFurnWithInFront = [];

const noIntersectionsIDs = [];
const IntersectionsIDs = [];
const IntersectionsIDsWith = [];

const noIntersectionsIDsAreaContainFurn = [];
const IntersectionsIDsAreaContainFurn = [];
const IntersectionsIDsAreaContainFurnWith = [];


const noIntersectionsIDsAreaIntersectArea = [];
const IntersectionsIDsAreaIntersectArea = [];
const IntersectionsIDsAreaIntersectAreaWith = [];

const noIntersectionsIDsAreaContainArea = [];
const IntersectionsIDsAreaContainArea = [];
const IntersectionsIDsAreaContainAreaWith = [];

const noIntersectionsIDsFurnIntersectArea = [];
const IntersectionsIDsFurnIntersectArea = [];
const IntersectionsIDsFurnIntersectAreaWith = [];

const noIntersectionsIDsFurnContainArea = [];
const IntersectionsIDsFurnContainArea = [];
const IntersectionsIDsFurnContainAreaWith = [];

const noIntersectionsIDsFurnIntersectFurn = [];
const IntersectionsIDsFurnIntersectFurn = [];
const IntersectionsIDsFurnIntersectFurnWith = [];

const noIntersectionsIDsFurnContainFurn = [];
const IntersectionsIDsFurnContainFurn = [];
const IntersectionsIDsFurnContainFurnWith = [];

const noIntersectionsIDsAreaIntersectWall = [];
const IntersectionsIDsAreaIntersectWall = [];
const IntersectionsIDsAreaIntersectWallWith = [];

const noIntersectionsIDsAreaContainWall = [];
const IntersectionsIDsAreaContainWall = [];
const IntersectionsIDsAreaContainWallWith = [];

const noIntersectionsIDsFurnContainWall = [];
const IntersectionsIDsFurnContainWall = [];
const IntersectionsIDsFurnContainWallWith = [];

const noIntersectionsIDsFurnIntersectWall = [];
const IntersectionsIDsFurnIntersectWall = [];
const IntersectionsIDsFurnIntersectWallWith = [];

const noIntersectionsAtAll = [];

const idMeshToString = [];
const greenMaterial = new MeshBasicMaterial({color: orangeColor, transparent: true,  opacity: 0.3, depthTest: false})



const furnContainAreaColor =  new Color( 0x296017); //dunkelgrüm
const furnContainFurnColor = new Color( 0x504b13); //kaki
const areaContainAreaColor = new Color( 0x67116e); //lila

const furnClashAreaColor =  new Color( 0x99244f); //beere
const furnIntersectFurnColor = new Color( 0x570042); //gelb    rosa f2a9f9
const wallCollisionColor = new Color( 0x8137be); //dunkelrot
const areaIntersectAreaColor = new Color( 0x007050) // tannengrün


let lastPosition;
let indexWC

function indexedBoundingBoxCollision(index, boundsIteration, collidingWithBounds, intersectionList, indexIntersectList, containsList, indexContainsList){
    let intersect
    for(let i = 0; i < boundsIteration.length; i++){
        if( index !== i){
            intersect = boundsIteration[i].intersectsBox(collidingWithBounds[index])
            ////console.log("int", intersect, boundingCubes[i], boundingCubes[index], i,index)

            intersectionList.push(intersect)
            indexIntersectList.push( [i, index] )

            contains = boundsIteration[i].containsBox(collidingWithBounds[index])
            containsList.push(contains)
            indexContainsList.push( [i, index] )
        }

    }
}

function areaColorIfCollisionIsDetected(intersectionList, indexIntersectList, color, idsNot, notPosition, Intersection, NoIntersection, IntersectionWith, subsetColliding) {

    for ( let j = 0; j < intersectionList.length; j++){
        //area against area
        if(intersectionList[j] === true){
            ////console.log(j, indexIntersectList[j][0])
            areas[indexIntersectList[j][0]].material.transparent = true;
            areas[indexIntersectList[j][0]].material.opacity = 0.5;
            areas[indexIntersectList[j][0]].material.color = color;

            areas[indexIntersectList[j][0]].uuid = allSubsetMeshes[indexIntersectList[j][0]].uuid
            areas[indexIntersectList[j][1]].uuid = subsetColliding[indexIntersectList[j][1]].uuid
            //console.log("True Intersection",allSubsetMeshes[indexIntersectList[j][0]].uuid, subsetColliding[indexIntersectList[j][1]].uuid )

            Intersection.push(allSubsetMeshes[indexIntersectList[j][0]].uuid)
            IntersectionWith.push(subsetColliding[indexIntersectList[j][1]].uuid)

        } else  if(intersectionList[j] === false) {
            ////console.log("False Intersection",areas[indexIntersectList[j][1]].uuid,  )

            const idsFalse = areas[indexIntersectList[j][0]].uuid
            ////console.log('idsfalse', idsFalse)
            idsNot.push(idsFalse)

            if (notPosition.includes(idsFalse) === false){
                notPosition.push(idsFalse)

            }
        }
        ////console.log('notPosition', notPosition)
    }

    for(let i = 0; i < notPosition.length; i++){
       // //console.log("got it", getOccurence(Intersection, notPosition[i]) )
        if(getOccurence(Intersection, notPosition[i]) === 0) {
           ////console.log("found this", notPosition[i], Intersection, Intersection.indexOf(notPosition[i]))

            if( typeof(notPosition[i]) !== 'string') {
                NoIntersection.push(notPosition[i])
            }

        }
    }


    //console.log("noIntersectionsIDs", NoIntersection)

    //console.log("IntersectionsIDs", Intersection)
}

function areaColorIfCollisionIsDetectedWithWall(intersectionList, indexIntersectList, color, idsNot, notPosition, Intersection, NoIntersection, IntersectionWith, subsetColliding) {
    //console.log("sobd", wallSubsetMeshes, intersectionList, indexIntersectList)
    for ( let j = 0; j < intersectionList.length; j++){
        //area against area
        if(intersectionList[j] === true){
            ////console.log(j, indexIntersectList[j][0])
            areas[indexIntersectList[j][0]].material.transparent = true;
            areas[indexIntersectList[j][0]].material.opacity = 0.5;
            areas[indexIntersectList[j][0]].material.color = color;

            areas[indexIntersectList[j][0]].uuid = allSubsetMeshes[indexIntersectList[j][0]].uuid
            // areas[indexIntersectList[j][1]].uuid = subsetColliding[indexIntersectList[j][1]].uuid
            //console.log("True Intersection",allSubsetMeshes[indexIntersectList[j][0]].uuid, subsetColliding[indexIntersectList[j][1]].uuid )

            Intersection.push(allSubsetMeshes[indexIntersectList[j][0]].uuid)
            IntersectionWith.push(subsetColliding[indexIntersectList[j][1]].uuid)

        } else  if(intersectionList[j] === false) {
            ////console.log("False Intersection",areas[indexIntersectList[j][1]].uuid,  )

            const idsFalse = areas[indexIntersectList[j][0]].uuid
            ////console.log('idsfalse', idsFalse)
            idsNot.push(idsFalse)

            if (notPosition.includes(idsFalse) === false){
                notPosition.push(idsFalse)

            }
        }
        ////console.log('notPosition', notPosition)
    }

    for(let i = 0; i < notPosition.length; i++){
       // //console.log("got it", getOccurence(Intersection, notPosition[i]) )
        if(getOccurence(Intersection, notPosition[i]) === 0) {
           ////console.log("found this", notPosition[i], Intersection, Intersection.indexOf(notPosition[i]))

            if( typeof(notPosition[i]) !== 'string') {
                NoIntersection.push(notPosition[i])
            }

        }
    }


    //console.log("noIntersectionsIDs", NoIntersection)

    //console.log("IntersectionsIDs", Intersection)
}

function areaColorIfCollisionIsDetectedInFront(intersectionList, indexIntersectList, color, idsNot, notPosition, Intersection, NoIntersection, IntersectionWith, subsetColliding) {
    //console.log("intersectionList", intersectionList, indexIntersectList)
    for ( let j = 0; j < intersectionList.length; j++){
        //area against area
        if(intersectionList[j] === true){
            ////console.log(j, indexIntersectList[j][0])

            areasInFront[indexIntersectList[j][1]].material.transparent = true;
            areasInFront[indexIntersectList[j][1]].material.opacity = 0.5;
            areasInFront[indexIntersectList[j][1]].material.color = color;

            areasInFront[indexIntersectList[j][1]].uuid = allSubsetMeshes[indexIntersectList[j][0]].uuid
            //areasInFront[indexIntersectList[j][1]].uuid = subsetColliding[indexIntersectList[j][1]].uuid
            //console.log("True Intersection",allSubsetMeshes[indexIntersectList[j][0]].uuid, subsetColliding[indexIntersectList[j][1]].uuid )

            Intersection.push(allSubsetMeshes[indexIntersectList[j][0]].uuid)
            IntersectionWith.push(subsetColliding[indexIntersectList[j][1]].uuid)

        } else  if(intersectionList[j] === false) {
            //console.log("False Intersection",intersectionList[j], areasInFront[indexIntersectList[j][1]].uuid,  )

            const idsFalse = areasInFront[indexIntersectList[j][1]].uuid
            ////console.log('idsfalse', idsFalse)
            idsNot.push(idsFalse)

            if (notPosition.includes(idsFalse) === false){
                notPosition.push(idsFalse)

            }
        }
        ////console.log('notPosition', notPosition)
    }

    for(let i = 0; i < notPosition.length; i++){
       // //console.log("got it", getOccurence(Intersection, notPosition[i]) )
        if(getOccurence(Intersection, notPosition[i]) === 0) {
           ////console.log("found this", notPosition[i], Intersection, Intersection.indexOf(notPosition[i]))

            if( typeof(notPosition[i]) !== 'string') {
                NoIntersection.push(notPosition[i])
            }

        }
    }


    //console.log("noIntersectionsIDs", NoIntersection)

    //console.log("IntersectionsIDs", Intersection)
}



const input = ['Bett', 'Küchenzeile','WC', 'Waschtisch', 'Badewanne', 'Dusche']

let activateButton = document.createElement('button');
activateButton.innerText = 'Möbelauswahl';
activateButton.id = 'activeButton'
activateButton.classList.add('buttonsArea');

const checkBtn = document.getElementById('checkedBtn')


function getOccurence(array, value) {
    var count = 0;
    array.forEach((v) => (v === value && count++));
    return count;
    //return array.filter((v) => (v === value)).length;
}

function DINCHECKER(){

    checkedList.length = 0;
    indices.length = 0;

    checkedListContains.length = 0;
    indicesContains.length = 0;

    checkedListIntersectFurn.length = 0;
    indicesIntersectFurn.length = 0;

    checkedListContainsFurn.length = 0;
    indicesContainsFurn.length = 0;

    checkedListContainsAreaAndFurn.length = 0;
    indicesContainsAreaAndFurn.length = 0;

    checkedListIntersectFurnAndArea.length = 0;
    indicesIntersectFurnAndArea.length = 0;

    checkedListContainsFurnAndArea.length = 0;
    indicesContainsFurnAndArea.length = 0;

    checkedListIntersectAreaAndFurn.length = 0;
    indicesIntersectAreaAndFurn.length = 0;

    checkedListAreaIntersectWall.length = 0;
    indicesIntersectAreaAndWall.length = 0;

    checkedListAreaContainsWall.length = 0;
    indicesContainsAreaAndWall.length = 0;

    checkedListFurnIntersectWall.length = 0;
    indicesIntersectFurnAndWall.length = 0;

    checkedListFurnContainsWall.length = 0;
    indicesContainsFurnAndWall.length = 0;


    checkedListInFront.length = 0;
    indicesInFront.length = 0;

    checkedListContainsInFront.length = 0;
    indicesContainsInFront.length = 0;

    checkedListIntersectFurnInFront.length = 0;
    indicesIntersectFurnInFront.length = 0;

    checkedListContainsFurnInFront.length = 0;
    indicesContainsFurnInFront.length = 0;

    checkedListIntersectFurnAndAreaInFront.length = 0;
    indicesIntersectFurnAndAreaInFront.length = 0;

    checkedListContainsFurnAndAreaInFront.length = 0;
    indicesContainsFurnAndAreaInFront.length = 0;

    checkedListIntersectFurnAndArea.length = 0;
    indicesIntersectFurnAndArea.length = 0;

    checkedListContainsFurnAndArea.length = 0;
    indicesContainsFurnAndArea.length = 0;


    positionsCollisions.length = 0;
    allIdsFalseAreaIntersectArea.length = 0;
    falsePositionsAreaIntersectArea.length = 0;

    allIdsFalseAreaContainsArea.length = 0;
    falsePositionsAreaContainsArea.length = 0;

    allIdsFalseAreaIntersectFurn.length = 0;
    falsePositionsAreaIntersectFurn.length = 0;

    allIdsFalseAreaContainsFurn.length = 0;
    falsePositionsAreaContainsFurn.length = 0;

    allIdsFalseFurnIntersectFurn.length = 0;
    falsePositionsFurnIntersectFurn.length = 0;

    allIdsFalseFurnContainsFurn.length = 0;
    falsePositionsFurnContainsFurn.length = 0;

    allIdsFalseAreaIntersectWall.length = 0;
    falsePositionsAreaIntersectWall.length = 0;

    allIdsFalseAreaContainsWall.length = 0;
    falsePositionsAreaContainsWall.length = 0;

    allIdsFalseFurnContainsWall.length = 0;
    falsePositionsFurnContainsWall.length = 0;

    allIdsFalseFurnIntersectWall.length = 0;
    falsePositionsFurnIntersectWall.length = 0;

    allIdsFalseAreaIntersectAreaInFront.length = 0;
    falsePositionsAreaIntersectAreaInFront.length = 0;

    allIdsFalseAreaContainsAreaInFront.length = 0;
    falsePositionsAreaContainsAreaInFront.length = 0;

    allIdsFalseAreaIntersectFurnInFront.length = 0;
    falsePositionsAreaIntersectFurnInFront.length = 0;

    allIdsFalseAreaContainsFurnInFront.length = 0;
    falsePositionsAreaContainsFurnInFront.length = 0;

    allIdsFalseFurnIntersectFurnInFront.length = 0;
    falsePositionsFurnIntersectFurnInFront.length = 0;

    allIdsFalseFurnContainsFurnInFront.length = 0;
    falsePositionsFurnContainsFurnInFront.length = 0;

    allIdsFalseAreaIntersectFurn.length = 0
    falsePositionsAreaIntersectFurn.length = 0

    allIdsFalseAreaContainsFurn.length = 0
    falsePositionsAreaContainsFurn.length = 0

    allIdsFalseFurnIntersectArea.length = 0;
    falsePositionsFurnIntersectArea.length = 0;

    allIdsFalseFurnContainsArea.length = 0;
    falsePositionsFurnContainsArea.length = 0;


    truePositions.length = 0;
    allIdsTrue.length = 0;

    noIntersectionsIDs.length = 0;
    IntersectionsIDs.length = 0;
    IntersectionsIDsWith.length = 0;

    noIntersectionsIDsAreaContainFurn.length = 0;
    IntersectionsIDsAreaContainFurn.length = 0;
    IntersectionsIDsAreaContainFurnWith.length = 0;


    noIntersectionsIDsAreaIntersectArea.length = 0;
    IntersectionsIDsAreaIntersectArea.length = 0;
    IntersectionsIDsAreaIntersectAreaWith.length = 0;

    noIntersectionsIDsAreaContainArea.length = 0;
    IntersectionsIDsAreaContainArea.length = 0;
    IntersectionsIDsAreaContainAreaWith.length = 0;

    noIntersectionsIDsFurnIntersectFurn.length = 0;
    IntersectionsIDsFurnIntersectFurn.length = 0;
    IntersectionsIDsFurnIntersectFurnWith.length = 0;

    noIntersectionsIDsFurnContainFurn.length = 0;
    IntersectionsIDsFurnContainFurn.length = 0;
    IntersectionsIDsFurnContainFurnWith.length = 0;

    noIntersectionsIDsAreaIntersectWall.length = 0;
    IntersectionsIDsAreaIntersectWall.length = 0;
    IntersectionsIDsAreaIntersectWallWith.length = 0;

    noIntersectionsIDsAreaContainWall.length = 0;
    IntersectionsIDsAreaContainWall.length = 0;
    IntersectionsIDsAreaContainWallWith.length = 0;

    noIntersectionsIDsFurnContainWall.length = 0;
    IntersectionsIDsFurnContainWall.length = 0;
    IntersectionsIDsFurnContainWallWith.length = 0;

    noIntersectionsIDsFurnIntersectWall.length = 0;
    IntersectionsIDsFurnIntersectWall.length = 0;
    IntersectionsIDsFurnIntersectWallWith.length = 0;

    noIntersectionsIDsInFront.length = 0;
    IntersectionsIDsInFront.length = 0;
    IntersectionsIDsWithInFront.length = 0;

    noIntersectionsIDsAreaContainFurnInFront.length = 0;
    IntersectionsIDsAreaContainFurnInFront.length = 0;
    IntersectionsIDsAreaContainFurnWithInFront.length = 0;


    noIntersectionsIDsAreaIntersectAreaInFront.length = 0;
    IntersectionsIDsAreaIntersectAreaInFront.length = 0;
    IntersectionsIDsAreaIntersectAreaWithInFront.length = 0;

    noIntersectionsIDsAreaContainAreaInFront.length = 0;
    IntersectionsIDsAreaContainAreaInFront.length = 0;
    IntersectionsIDsAreaContainAreaWithInFront.length = 0;

    noIntersectionsIDsFurnIntersectFurnInFront.length = 0;
    IntersectionsIDsFurnIntersectFurnInFront.length = 0;
    IntersectionsIDsFurnIntersectFurnWithInFront.length = 0;

    noIntersectionsIDsFurnContainFurnInFront.length = 0;
    IntersectionsIDsFurnContainFurnInFront.length = 0;
    IntersectionsIDsFurnContainFurnWithInFront.length = 0;


    noIntersectionsIDsFurnIntersectArea.length = 0
    IntersectionsIDsFurnIntersectArea.length = 0
    IntersectionsIDsFurnIntersectAreaWith.length = 0

    noIntersectionsIDsFurnContainArea.length = 0
    IntersectionsIDsFurnContainArea.length = 0
    IntersectionsIDsFurnContainAreaWith.length = 0






    for(let i = 0; i < boundingCubes.length; i++){
        //indexedBoundingBox(i)
        // check if any collisions are there and fills Lists if any
        indexedBoundingBoxCollision(i, boundingCubes, boundingCubes, checkedList,indices,checkedListContains, indicesContains)
        indexedBoundingBoxCollision(i, subsetBoundingBoxes, subsetBoundingBoxes, checkedListIntersectFurn, indicesIntersectFurn,checkedListContainsFurn, indicesContainsFurn)
        indexedBoundingBoxCollision(i, subsetBoundingBoxes, boundingCubes, checkedListIntersectFurnAndArea,indicesIntersectFurnAndArea,checkedListContainsFurnAndArea, indicesContainsFurnAndArea)
        indexedBoundingBoxCollision(i, boundingCubes, subsetBoundingBoxes, checkedListIntersectAreaAndFurn,indicesIntersectAreaAndFurn,checkedListContainsAreaAndFurn, indicesContainsAreaAndFurn)

    }
    // for(let i = 0; i < boundingCubesInFront.length; i++){
    //     //indexedBoundingBox(i)
    //     // check if any collisions are there and fills Lists if any
    //     indexedBoundingBoxCollision(i, boundingCubesInFront, boundingCubes, checkedListInFront,indicesInFront,checkedListContainsInFront, indicesContainsInFront)
    //     indexedBoundingBoxCollision(i, boundingCubesInFront, boundingCubesInFront, checkedListIntersectFurnInFront, indicesIntersectFurnInFront,checkedListContainsFurnInFront, indicesContainsFurnInFront)
    //     indexedBoundingBoxCollision(i, subsetBoundingBoxes, boundingCubesInFront, checkedListIntersectFurnAndAreaInFront,indicesIntersectFurnAndAreaInFront,checkedListContainsFurnAndAreaInFront, indicesContainsFurnAndAreaInFront)
    // }


    for(let i = 0; i < wallBounds.length; i++){
            indexedBoundingBoxCollision(i, boundingCubes, wallBounds, checkedListAreaIntersectWall,indicesIntersectAreaAndWall,checkedListAreaContainsWall, indicesContainsAreaAndWall)
            indexedBoundingBoxCollision(i, subsetBoundingBoxes, wallBounds, checkedListFurnIntersectWall,indicesIntersectFurnAndWall,checkedListFurnContainsWall, indicesContainsFurnAndWall)
    }




   
    areaColorIfCollisionIsDetected(checkedList, indices, areaIntersectAreaColor, allIdsFalseAreaIntersectArea, falsePositionsAreaIntersectArea, IntersectionsIDsAreaIntersectArea, noIntersectionsIDsAreaIntersectArea, IntersectionsIDsAreaIntersectAreaWith, allSubsetMeshes)
    areaColorIfCollisionIsDetected(checkedListContains, indicesContains, areaContainAreaColor, allIdsFalseAreaContainsArea, falsePositionsAreaContainsArea, IntersectionsIDsAreaContainArea, noIntersectionsIDsAreaContainArea, IntersectionsIDsAreaContainAreaWith, allSubsetMeshes )


    areaColorIfCollisionIsDetected(checkedListIntersectFurn, indicesIntersectFurn, furnIntersectFurnColor, allIdsFalseFurnIntersectFurn, falsePositionsFurnIntersectFurn, IntersectionsIDsFurnIntersectFurn,noIntersectionsIDsFurnIntersectFurn, IntersectionsIDsFurnIntersectFurnWith, allSubsetMeshes )
    areaColorIfCollisionIsDetected(checkedListContainsFurn, indicesContainsFurn, furnContainFurnColor, allIdsFalseFurnContainsFurn, falsePositionsFurnContainsFurn, IntersectionsIDsFurnContainFurn, noIntersectionsIDsFurnContainFurn, IntersectionsIDsFurnContainFurnWith, allSubsetMeshes)

    areaColorIfCollisionIsDetected(checkedListIntersectFurnAndArea, indicesIntersectFurnAndArea, furnClashAreaColor, allIdsFalseAreaIntersectFurn, falsePositionsAreaIntersectFurn, IntersectionsIDs, noIntersectionsIDs, IntersectionsIDsWith, allSubsetMeshes)
    areaColorIfCollisionIsDetected(checkedListContainsFurnAndArea, indicesContainsFurnAndArea, furnContainAreaColor, allIdsFalseAreaContainsFurn, falsePositionsAreaContainsFurn,IntersectionsIDsAreaContainFurn, noIntersectionsIDsAreaContainFurn, IntersectionsIDsAreaContainFurnWith, allSubsetMeshes )

    areaColorIfCollisionIsDetected(checkedListIntersectAreaAndFurn, indicesIntersectAreaAndFurn, furnClashAreaColor, allIdsFalseFurnIntersectArea, falsePositionsFurnIntersectArea, IntersectionsIDsFurnIntersectArea, noIntersectionsIDsFurnIntersectArea, IntersectionsIDsFurnIntersectAreaWith, allSubsetMeshes)
    areaColorIfCollisionIsDetected(checkedListContainsAreaAndFurn, indicesContainsAreaAndFurn, furnContainAreaColor, allIdsFalseFurnContainsArea, falsePositionsFurnContainsArea,IntersectionsIDsFurnContainArea, noIntersectionsIDsFurnContainArea, IntersectionsIDsFurnContainAreaWith, allSubsetMeshes )

    areaColorIfCollisionIsDetectedWithWall(checkedListAreaIntersectWall, indicesIntersectAreaAndWall, wallCollisionColor, allIdsFalseAreaIntersectWall, falsePositionsAreaIntersectWall, IntersectionsIDsAreaIntersectWall, noIntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallSubsetMeshes)
    areaColorIfCollisionIsDetectedWithWall(checkedListAreaContainsWall, indicesContainsAreaAndWall, wallCollisionColor, allIdsFalseAreaContainsWall, falsePositionsAreaContainsWall, IntersectionsIDsAreaContainWall, noIntersectionsIDsAreaContainWall, IntersectionsIDsAreaContainWallWith, wallSubsetMeshes)

    areaColorIfCollisionIsDetectedWithWall(checkedListFurnIntersectWall, indicesIntersectFurnAndWall, wallCollisionColor , allIdsFalseFurnIntersectWall, falsePositionsFurnIntersectWall,IntersectionsIDsFurnIntersectWall , noIntersectionsIDsFurnIntersectWall, IntersectionsIDsFurnIntersectWallWith, wallSubsetMeshes)
    areaColorIfCollisionIsDetectedWithWall(checkedListFurnContainsWall, indicesContainsFurnAndWall, wallCollisionColor, allIdsFalseFurnContainsWall, falsePositionsFurnContainsWall,IntersectionsIDsFurnContainWall, noIntersectionsIDsFurnContainWall, IntersectionsIDsFurnContainWallWith, wallSubsetMeshes)

    

    // areaColorIfCollisionIsDetectedInFront(checkedListInFront, indicesInFront, areaIntersectAreaColor, allIdsFalseAreaIntersectAreaInFront, falsePositionsAreaIntersectAreaInFront, IntersectionsIDsAreaIntersectAreaInFront, noIntersectionsIDsAreaIntersectAreaInFront, IntersectionsIDsAreaIntersectAreaWithInFront, allSubsetMeshes)
    // areaColorIfCollisionIsDetectedInFront(checkedListContainsInFront, indicesContainsInFront, areaContainAreaColor, allIdsFalseAreaContainsAreaInFront, falsePositionsAreaContainsAreaInFront, IntersectionsIDsAreaContainAreaInFront, noIntersectionsIDsAreaContainAreaInFront, IntersectionsIDsAreaContainAreaWithInFront, allSubsetMeshes )

    // areaColorIfCollisionIsDetectedInFront(checkedListIntersectFurnInFront, indicesIntersectFurnInFront, furnIntersectFurnColor, allIdsFalseFurnIntersectFurnInFront, falsePositionsFurnIntersectFurnInFront, IntersectionsIDsFurnIntersectFurnInFront,noIntersectionsIDsFurnIntersectFurnInFront, IntersectionsIDsFurnIntersectFurnWithInFront, allSubsetMeshes )
    // areaColorIfCollisionIsDetectedInFront(checkedListContainsFurnInFront, indicesContainsFurnInFront, furnContainFurnColor, allIdsFalseFurnContainsFurnInFront, falsePositionsFurnContainsFurnInFront, IntersectionsIDsFurnContainFurnInFront, noIntersectionsIDsFurnContainFurnInFront, IntersectionsIDsFurnContainFurnWithInFront, allSubsetMeshes)

    // areaColorIfCollisionIsDetectedInFront(checkedListIntersectFurnAndAreaInFront, indicesIntersectFurnAndAreaInFront, furnClashAreaColor, allIdsFalseAreaIntersectFurnInFront, falsePositionsAreaIntersectFurnInFront, IntersectionsIDsInFront, noIntersectionsIDsInFront, IntersectionsIDsWithInFront, allSubsetMeshes)
    // areaColorIfCollisionIsDetectedInFront(checkedListContainsFurnAndAreaInFront, indicesContainsFurnAndAreaInFront, furnContainAreaColor, allIdsFalseAreaContainsFurnInFront, falsePositionsAreaContainsFurnInFront,IntersectionsIDsAreaContainFurnInFront, noIntersectionsIDsAreaContainFurnInFront, IntersectionsIDsAreaContainFurnWithInFront, allSubsetMeshes )
    
   //IntersectionsIDsAreaIntersectArea
    allLists = IntersectionsIDsAreaContainFurn.concat(IntersectionsIDsAreaContainArea,
        IntersectionsIDsFurnIntersectFurn,
        IntersectionsIDsFurnContainFurn,
        IntersectionsIDsFurnIntersectArea,
        IntersectionsIDsFurnContainArea,
        IntersectionsIDs,
        IntersectionsIDsAreaIntersectWall,
        IntersectionsIDsAreaContainWall,
        IntersectionsIDsFurnIntersectWall,
        IntersectionsIDsFurnContainWall)

       

    

    //console.log("Blue, IntersectionsIDsAreaIntersectArea3", IntersectionsIDsAreaIntersectArea, IntersectionsIDsAreaIntersectAreaInFront)
    //console.log("lila, IntersectionsIDsAreaContainArea3", IntersectionsIDsAreaContainArea, IntersectionsIDsAreaContainAreaInFront)
    //console.log("rosa, IntersectionsIDsFurnIntersectFurn3", IntersectionsIDsFurnIntersectFurn, IntersectionsIDsFurnIntersectFurnInFront)
    //console.log("kaki, IntersectionsIDsFurnContainFurn3", IntersectionsIDsFurnContainFurn, IntersectionsIDsFurnContainFurnInFront)
    //console.log("beere, IntersectionsIDs3", IntersectionsIDs, IntersectionsIDsInFront, IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaContainWall, IntersectionsIDsFurnIntersectWall, IntersectionsIDsFurnContainWall)
    //console.log("dunkelgrün, IntersectionsIDsAreaContainFurn3", IntersectionsIDsAreaContainFurn, IntersectionsIDsAreaContainFurnInFront)

}

document.querySelectorAll('button').forEach(occurence => {
    let id = occurence.getAttribute('id');
    occurence.addEventListener('click', async function() {
    //console.log('A button with ID ' + id + ' was clicked!')

    if(id === 'uploadmode'){

        const uploadbtn = document.getElementById('uploadmode')
        uploadbtn.onclick = clickedOnce('demo'," ",'dincheck-buttonhover', uploadbtn  )


        uploadmodeIsActive = true;
        //console.log("uploadmode active", uploadmodeIsActive)
        //await setupAllCategories();
        ifcModel = await showModel()

        //console.log(ifcModel)
        // camera = new OrthographicCamera(size.width/ -70, size.width/70, size.height/70, size.height/-70, -10, 10)
        // // //console.log(camera)
        // camera.lookAt(new Vector3(0,-5,0))

        const allModelMaterials = ifcModel.material
        for(let materials = 0; materials < allModelMaterials.length; materials++){
            ////console.log("mats", allModelMaterials[materials], allModelMaterials)
            // allModelMaterials[materials].transparent = false
            // allModelMaterials[materials].opacity = 1.0
            // allModelMaterials[materials].color = {r: 0.8313725490196079, g: 0.8313725490196079, b: 0.8313725490196079}
            // allModelMaterials[materials].polygonOffset = true
            // allModelMaterials[materials].polygonOffsetFactor = 1
            // allModelMaterials[materials].polygonOffsetUnits = 1
            // allModelMaterials[materials].clippingPlanes = clipPlanes
            // allModelMaterials[materials].clipIntersection = params.clipIntersection
            // allModelMaterials[materials].side = DoubleSide
            // //allModelMaterials[materials].wireframe = true
        }

        //.addEventListener('mousemove', pick( hightlightMaterial, false, ifcModels))
        canvas.onpointermove = (event) => pick(event, hightlightMaterial, false, ifcModels);
        //canvas.ondblclick = (event) => pick(event, selectionMaterial, true, ifcModels);
        
    } else {
        uploadmodeIsActive = false;
        //console.log("uploadmode deactivated", uploadmodeIsActive)
    }


    if(id === 'drawmode'){
        drawmodeIsActive = true;
        //console.log("drawmode active", drawmodeIsActive)
        document.addEventListener( 'pointermove', onPointerMove);
        //  document.addEventListener( 'pointermove', addGumballToSphere );
        document.addEventListener( 'dblclick', onPointerDown);
        document.addEventListener( 'keydown', onDocumentKeyDown );
        document.addEventListener( 'keyup', onDocumentKeyUp );
        document.addEventListener( 'keydown', undoAndRedo );

    } else {
        drawmodeIsActive = false;
        //console.log("drawmode deactivated", drawmodeIsActive)
        document.removeEventListener( 'pointermove', onPointerMove );
        //  document.removeEventListener( 'pointermove', removeGumballToSphere );
        document.removeEventListener( 'dblclick', onPointerDown );
        document.removeEventListener( 'keydown', onDocumentKeyDown );
        document.removeEventListener( 'keyup', onDocumentKeyUp );
        document.removeEventListener( 'keydown', undoAndRedo );
    }

    if(id === 'furnituremode'){
        const uploadbtn = document.getElementById('furnituremode')
        uploadbtn.onclick = clickedOnce('demo'," ",'dincheck-buttonhover', uploadbtn  )


        furnituremodeIsActive = true;
        //console.log("furnituremode active", furnituremodeIsActive)

        //const allModelMaterials = ifcModel.material
        // for(let materials = 0; materials < allModelMaterials.length; materials++){
        //     // //console.log(allModelMaterials[materials])
        //     // allModelMaterials[materials].transparent = true
        //     // allModelMaterials[materials].opacity = 0.5
        //     // allModelMaterials[materials].color = {r: 0.8313725490196079, g: 0.8313725490196079, b: 0.8313725490196079}
        //     //ifcModel[materials].material.transparent = true
        // }



        ifcModels.pop()
        model.removeFromParent();
        scene.remove(model)


        checkBtn.style.visibility = 'visible'

       ////////////////////////
    //    const closeTab = document.getElementById('Check');
    //    closeTab.style.visibility = 'hidden'
        const containerTab = document.getElementById('programmFurniture');

        const divElement = document.createElement('div');
        divElement.id = `${'Bett'}-1`;
        divElement.classList.add('modal');
        containerTab.appendChild(divElement)

        const modalBackround = document.getElementById(`${'Bett'}-1`)
        modalBackround.style.display ='block';
        checkBtn.style.visibility = 'hidden'

       const formElement = document.createElement('form');
       formElement.classList.add('modal-content');
       formElement.action = '/action_page.php';

       divElement.appendChild(formElement)

       const formContent = document.createElement('div');
       formContent.classList.add('containerForm');


       const heading = document.createElement('p');
       heading.innerText = `Wähle das ${'Bett'} aus.`

       const decision = document.createElement('div');
       decision.classList.add('clearfix');

       const yesBtn = document.createElement('button');
       yesBtn.type = 'button';
       yesBtn.classList.add('buttonsArea')
       yesBtn.style.backgroundColor = 'darkgrey'
       yesBtn.innerText = 'ok'
       yesBtn.id = 'trueBtn'

       let clicked

       yesBtn.onclick= () => {
            const modalBackround = document.getElementById(`${'Bett'}-1`)
            modalBackround.style.display='none';
            clicked = false
            return clicked

        }

       formContent.appendChild(heading)
       formContent.appendChild(decision)
       decision.appendChild(yesBtn)

       formElement.appendChild(formContent)



        document.querySelectorAll('button').forEach(occurence => {
            let id = occurence.getAttribute('id');
            occurence.addEventListener('click', async function() {

            if(id === 'trueBtn'){

                //console.log('A button with ID ' + id + ' was clicked!')
                const buttonTxt = document.getElementById('programmFurniture')
                //console.log(buttonTxt)
                buttonTxt.innerText = `Klicke ein/e ${'Bett'} jetzt an...` ;

                var bedtest = document.getElementById(`${'Bett'}`)
                bedtest.checked = true
                //console.log("bedtest", bedtest)


            }


            })


    })

        await getAllFurniture();

        await allElements()
        await getRefDirectionFurniture()

        await startPositionAllSubsetMeshes(allSubsetMeshes)


        // for(let i = 0; i < allSubsetMeshes.length; i++){
            
        //     const sphereCopy = new Mesh(sphereGeometry, new MeshBasicMaterial({color: orangeColor}))
        //     sphereCopy.position.set(startPositionsFurns[i].x, startPositionsFurns[i].y +1.2, startPositionsFurns[i].z)
            
        //     console.log("sphere", sphereCopy.position, startPositionsFurns[i])
        //     allSubsetMeshes[i].add(sphereCopy)
        //     console.log("sphere2", sphereCopy.position, allSubsetMeshes[i])
    
    
    
        // }

        const visibleCheckboxes = document.getElementsByClassName('tabcontent-flexible')
        const checkboxesFurn = visibleCheckboxes[0]
        checkboxesFurn.style.visibility = 'hidden'
        //console.log("allsubs", allSubsetMeshes)

        for(let id = 0; id < allSubsetMeshes.length; id++){
            allSubsetMeshesIDs.push(allSubsetMeshes[id].uuid)
        }
        // canvas.ondblclick = (event) =>  pickFurniture(event, selectionMaterialFurniture ,allSubsetMeshes ) ;

    } else {
        furnituremodeIsActive = false;
        //console.log("furnituremode deactivated", furnituremodeIsActive)

        const visibleCheckboxes = document.getElementsByClassName('tabcontent-flexible')
        const checkboxesFurn = visibleCheckboxes[0]
        checkboxesFurn.style.visibility = 'hidden'

         }

    if(id === 'checkedBtn') {
        checkedBtnmodeIsActive = true;
        //console.log('checkedBtm')

        const buttonTxt = document.getElementById('programmFurniture')
        buttonTxt.innerText = `Möbelauswahl` ;


        input.shift()
        //console.log("newInput", input)

        if(input.length >= 1 ){
            activateButton.style.color = 'grey'
            activateButton.disabled = true

            activatePopUpMenu(input, checkBtn);
        } else {

            checkBtn.style.color = 'grey'
            checkBtn.disabled = true
            checkBtn.style.visibility = 'hidden'
            buttonTxt.innerText = `` ;
            canvas.onpointerup = (event) =>  console.log("hey1") ;
        }

        //canvas.onpointerup = (event) =>  console.log("hey") ;

    } else {
        checkedBtnmodeIsActive = false;
        

        //console.log('checkedBtm False')


        //activatePopUpMenu(input[1], activateButton)

    }

    if(id === 'storymode'){
        // const uploadbtn = document.getElementById('storymode')
        // uploadbtn.onclick = clickedOnce('demo'," ",'dincheck-buttonhover', uploadbtn  )


        storymodeIsActive = true;
        hightlightMaterialSecond.opacity = 0.0;
        for(let id = 0; id < areas.length; id++){
               
           
                for(let mat = 0; mat < checkedMats.length; mat++){
                    areas[id].material = checkedMats[id];
                    areas[id].position.set( areas[id].position.x, 0.0 ,  areas[id].position.z)

                }
            
        }


        for(let ref = 0; ref < areas.length; ref++){
            //console.log('helllo', areas[ref].uuid, specificFurnIDList[2].value, allSubsetMeshes)
            if(areas[ref].uuid === specificFurnIDList[2].value){
                console.log("ii",specificFurnIDList[2].value, allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3()), areas[ref].position)
                
                if(ReferenceDirections[ref].x < 0){
                    console.log("x-1 ii")
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.x = areas[ref].position.x
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize(), specificFurnIDList)
                    modifiedDirections.push(vectorDir.normalize())
                }
                if(ReferenceDirections[ref].x > 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.x = areas[ref].position.x
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())
    
                }
                if(ReferenceDirections[ref].y < 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.z = areas[ref].position.z
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())
    
                }
                if(ReferenceDirections[ref].y > 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.z = areas[ref].position.z
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())
    
                }
            }
            if(areas[ref].uuid === specificFurnIDList[0].value){
                console.log("ii2",specificFurnIDList[0].value, allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3()), areas[ref].position)
                
                if(ReferenceDirections[ref].x < 0){
                    console.log("x-1 ii")
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.x = areas[ref].position.x
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize(), specificFurnIDList)
                    modifiedDirections.push(vectorDir.normalize())
                }
                if(ReferenceDirections[ref].x > 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.x = areas[ref].position.x
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())
    
                }
                if(ReferenceDirections[ref].y < 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.z = areas[ref].position.z
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())
    
                }
                if(ReferenceDirections[ref].y > 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.z = areas[ref].position.z
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())
    
                }
            } 
            if(areas[ref].uuid !== specificFurnIDList[0].value && areas[ref].uuid !== specificFurnIDList[2].value ){
                const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                console.log( "-1 else", areas[ref].uuid, spherePos, vectorDir.normalize())
                modifiedDirections.push(vectorDir.normalize())
            }
        }

        //console.log("storymode active", storymodeIsActive)
        if(storymodeIsActive) {
            //console.log(deleteButton)
            //deleteButton.removeFromParent();
            deleteButton.style.visibility = 'hidden'
        

        }


    } else {
        storymodeIsActive = false;
        //console.log("storymode deactivated", storymodeIsActive)
    }

    if (id === 'dincheckmode'){
        const uploadbtn = document.getElementById('dincheckmode')
        uploadbtn.onclick = clickedOnce('demo'," ",'dincheck-buttonhover', uploadbtn  )
        canvas.ondblclick = (event) =>  console.log("hey") ;
        dincheckmodeIsActive = true
        const sizeArea = 1.5;
        for (let id = 0; id < specificFurnIDList.length; id++){
            const specificID = Object.entries(specificFurnIDList[id])
            //console.log("specificFurnIDList", specificFurnIDList, specificID[1][1], specificID, allSubsetMeshesIDs)
            foundMeshesCheckbox.push(specificID[1][1])
        }
            for(let g = 0; g < allSubsetMeshesIDs.length; g++){
                const index = foundMeshesCheckbox.indexOf(allSubsetMeshesIDs[g])
                if (index === -1 ) {
                    //console.log("foundMeshesCheckbox 2 Not",foundMeshesCheckbox,index, allSubsetMeshesIDs[g], allSubsetMeshes[g], areaMeshes[g], ReferenceDirections[g], ReferenceDirections)

                    const indexNoarea = allSubsetMeshesIDs.indexOf(allSubsetMeshesIDs[g] )
                    noSpecificAreaIndex.push(indexNoarea)


                    //console.log("nme", indexNoarea, areaMeshes, areaMeshes[indexNoarea])

                }
            }
            for(let index = 0; index < noSpecificAreaIndex.length; index++){

                const indexNoarea = noSpecificAreaIndex[index]
                //console.log("indexno",noSpecificAreaIndex, indexNoarea, areaMeshes[indexNoarea], areaMeshes )


                const material = new LineBasicMaterial({
                    color: 0x0000ff
                    });

                const material2 = new LineBasicMaterial({
                    color: 0xff0000
                    });
                noSpecificFurnIDList.push(areaMeshes[indexNoarea].uuid)

                    if(ReferenceDirections[indexNoarea].x > 0){
                        const curveHandles = [];


                        const oldPosition = areaMeshes[indexNoarea].position
                        const areaRandom = new BoxGeometry(sizeArea ,0.005,sizeArea)
                        const areaRandomMesh = new Mesh(
                            areaRandom,
                            new MeshBasicMaterial({color: greyColor, transparent: true, opacity: 0.2})

                        )

                        const helperBox = new BoxGeometry(0.1,0.1,0.1)

                        areaRandomMesh.position.set(areaMeshes[indexNoarea].position.x, 0,areaMeshes[indexNoarea].position.z+ sizeArea/2 + areaMeshes[indexNoarea].geometry.parameters.depth/2)

                        //console.log("areaRandomMesh", areaRandomMesh)
                        scene.add(areaRandomMesh)
                        areaMeshes.splice(indexNoarea, 1,  areaRandomMesh)
                        areasInFront.push(areaRandomMesh)



                        // const size = allSubsetMeshes[indexNoarea].geometry.boundingBox.getSize(new Vector3());
                        // const points = [];
                        // points.push( new Vector3( areaRandomMesh.position.x - size.x/2 , areaRandomMesh.position.y +0.5,  areaRandomMesh.position.z - size.z -sizeArea/2) );
                        // points.push( new Vector3( areaRandomMesh.position.x + size.x/2  , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z - size.z -sizeArea/2) );
                        // points.push( new Vector3( areaRandomMesh.position.x + size.x/2 , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z - sizeArea/2) );
                        // points.push( new Vector3( areaRandomMesh.position.x - size.x/2, areaRandomMesh.position.y +0.5, areaRandomMesh.position.z - sizeArea/2) );

                        // for ( const vertexPos of points ) {
                        //     const helperBoxMesh = new Mesh(
                        //         helperBox,
                        //         new MeshBasicMaterial({color: orangeColor, transparent: false, opacity: 0.2})
                        //     )
                        //     helperBoxMesh.position.copy( vertexPos );
                        //     curveHandles.push( helperBoxMesh );
                        //     scene.add( helperBoxMesh );

                        // }
                        // //console.log("points", points)

                        // const curve = new CatmullRomCurve3 (
                        //     curveHandles.map( ( helperBoxMesh ) => helperBoxMesh.position )
                        // );

                        // curve.curveType = 'catmullrom';
                        // curve.closed = true;
                        // curve.tension = 0;

                        // const pointsCrv = curve.getPoints( 50 );

                        // const line = new LineLoop(
                        //     new BufferGeometry().setFromPoints( points ),
                        //     new LineBasicMaterial( { color: 0x00ff00 } )
                        // );




                        // // const geometry = new BufferGeometry().setFromPoints( points );
                        // // const line = new LineLoop( geometry, material2 );
                        // scene.add( line );





                        // // const curve = new CurvePath (
                        // //     curveHandles.map( ( helperBoxMesh ) => helperBoxMesh.position )
                        // // );

                        // // curve.autoClose = true
                        // // curve.curves = line
                        // //curve.closePath() = true;
                        // //console.log("curve",curve, line)


                        // curves.push(curve)

                        // const geometryAnimate = new BoxGeometry(0.3, 0.3, 0.6);
                        // const geomAnimateMesh = new Mesh(geometryAnimate, hightlightMaterialSecond);

                        // geomsAnimate.push(geomAnimateMesh)
                        // scene.add(geomAnimateMesh)

                        // let move = areaRandomMesh.position.x;

                        // for(let j = 0 ; j < areasInFront.length; j++){

                        //     areasInFront[j].position.x += 0.001;
                        //     //console.log(areasInFront[j].position)
                        // }

                        // for(let j = 0 ; j < points.length; j++){
                        //     if(areaRandomMesh.position.x === points[j].x){
                        //         //console.log("STOP")
                        //     }
                        // }







                        // for(let i = 0 ; i < geomsAnimate.length; i++){





                        //     flow = new Flow( geomsAnimate[i] );
                        //     flow.updateCurve( 0, curves[i] );

                        //     scene.add( flow.object3D );

                        //     //console.log("Flow", flow, flow.uniforms)
                        //     someflows.push(flow)
                        // }

                        // for(let i = 0 ; i < points.length; i++){
                        //     if(geomAnimateMesh.position !== points[0]){
                        //         geomAnimateMesh.translateX += 0.1
                        //         //console.log("Pos", geomAnimateMesh.position, points[0])
                        //     }
                        // }


                    }

                    if(ReferenceDirections[indexNoarea].x < 0){
                        const areaRandom = new BoxGeometry(sizeArea ,0.005,sizeArea)
                        const areaRandomMesh = new Mesh(
                            areaRandom,
                            new MeshBasicMaterial({color: greyColor, transparent: true, opacity: 0.2})

                        )
                        const size = allSubsetMeshes[indexNoarea].geometry.boundingBox.getSize(new Vector3());
                        areaRandomMesh.position.set(areaMeshes[indexNoarea].position.x, 0,areaMeshes[indexNoarea].position.z   - sizeArea/2 - size.z/2 )
                        //areaRandomMesh.material = areaMeshes[indexNoarea].material
                        //areaMeshes[indexNoarea].add(areaRandomMesh)
                        //areaRandomMesh.uuid = areaMeshes[indexNoarea].uuid
                        scene.add(areaRandomMesh)

                        //console.log("areaRandomMesh", areaRandomMesh)
                        areaMeshes.splice(indexNoarea, 1,  areaRandomMesh)
                        areasInFront.push(areaRandomMesh)


                        // const points = [];

                        // points.push( new Vector3( areaRandomMesh.position.x -size.x/2  , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z + sizeArea/2  ) );
                        // points.push( new Vector3( areaRandomMesh.position.x + size.x/2 , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z + sizeArea/2) );

                        // points.push( new Vector3( areaRandomMesh.position.x -size.x/2  , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z + sizeArea/2  ) );
                        // points.push( new Vector3( areaRandomMesh.position.x - size.x/2 , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z + sizeArea/2 + size.z) );

                        // // points.push( new Vector3( areaRandomMesh.position.x + size.x/2  , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z + size.z + sizeArea) );
                        // // points.push( new Vector3( areaRandomMesh.position.x+ size.x/2 , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z + sizeArea) );

                        // // points.push( new Vector3( areaRandomMesh.position.x + size.x/2  , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z + size.z +sizeArea) );
                        // // points.push( new Vector3( areaRandomMesh.position.x - size.x/2 , areaRandomMesh.position.y +0.5,  areaRandomMesh.position.z + size.z + sizeArea) );

                        // //console.log("points", points)

                        // const pointsHorizontal = [];
                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x - size.x/2 , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z  + sizeArea/2 +  size.z) );
                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x + size.x/2, areaRandomMesh.position.y +0.5, areaRandomMesh.position.z  + sizeArea/2 + size.z) );


                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x + size.x/2  , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z + sizeArea/2 +  size.z ) );
                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x + size.x/2 , areaRandomMesh.position.y +0.5, areaRandomMesh.position.z + sizeArea/2 ) );
                        // //console.log("pointsHorizontal", pointsHorizontal)

                        // const geometry = new BufferGeometry().setFromPoints( points );
                        // const line = new Line( geometry, material );

                        // const geometryHor = new BufferGeometry().setFromPoints( pointsHorizontal );
                        // const lineHor = new Line( geometryHor, material );

                        // //console.log("line", line, geometry)
                        // line.add(lineHor)
                        // scene.add( line );
                    }
                    if(ReferenceDirections[indexNoarea].y > 0){
                        const areaRandom = new BoxGeometry(sizeArea ,0.005,sizeArea)
                        const areaRandomMesh = new Mesh(
                            areaRandom,
                            new MeshBasicMaterial({color: greyColor, transparent: true, opacity: 0.2})

                        )
                        areaRandomMesh.position.set(areaMeshes[indexNoarea].position.x + sizeArea/2 + areaMeshes[indexNoarea].geometry.parameters.width/2 , 0,areaMeshes[indexNoarea].position.z)
                        // areaRandomMesh.material = areaMeshes[indexNoarea].material
                        // areaMeshes[indexNoarea].add(areaRandomMesh)
                        //areaRandomMesh.uuid = areaMeshes[indexNoarea].uuid
                        scene.add(areaRandomMesh)


                        areaMeshes.splice(indexNoarea, 1,  areaRandomMesh)
                        areasInFront.push(areaRandomMesh)

                        // const size = allSubsetMeshes[indexNoarea].geometry.boundingBox.getSize(new Vector3());
                        // const points = [];
                        // points.push( new Vector3( areaRandomMesh.position.x - sizeArea/2  , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z - size.z/2 ) );
                        // points.push( new Vector3( areaRandomMesh.position.x - sizeArea/2 , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z  +  size.z/2) );

                        // points.push( new Vector3( areaRandomMesh.position.x - sizeArea/2 - size.x  , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z + size.z/2 ) );
                        // points.push( new Vector3( areaRandomMesh.position.x - sizeArea/2 , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z  +  size.z/2) );



                        // //console.log("points", points)

                        // const pointsHorizontal = [];

                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x - sizeArea/2 - size.x , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z - size.z/2 ) );
                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x - sizeArea/2 - size.x , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z  +  size.z/2) );

                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x - sizeArea/2 - size.x  , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z - size.z/2 ) );
                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x - sizeArea/2 , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z  -  size.z/2) );

                        // //console.log("pointsHorizontal", pointsHorizontal)

                        // const geometry = new BufferGeometry().setFromPoints( points );
                        // const line = new Line( geometry, material );

                        // const geometryHor = new BufferGeometry().setFromPoints( pointsHorizontal );
                        // const lineHor = new Line( geometryHor, material );

                        // //console.log("line", line, geometry)
                        // line.add(lineHor)
                        // scene.add( line );


                    }
                    if(ReferenceDirections[indexNoarea].y < 0){
                        const areaRandom = new BoxGeometry(sizeArea ,0.005,sizeArea)
                        const areaRandomMesh = new Mesh(
                            areaRandom,
                            new MeshBasicMaterial({color: greyColor, transparent: true, opacity: 0.2})

                        )
                        areaRandomMesh.position.set(areaMeshes[indexNoarea].position.x - sizeArea/2 -areaMeshes[indexNoarea].geometry.parameters.width/2 , 0,areaMeshes[indexNoarea].position.z)
                        // areaRandomMesh.material = areaMeshes[indexNoarea].material
                        //areaRandomMesh.uuid = areaMeshes[indexNoarea].uuid
                        // areaMeshes[indexNoarea].add(areaRandomMesh)
                        scene.add(areaRandomMesh)
                        areaMeshes.splice(indexNoarea, 1,  areaRandomMesh)

                        areasInFront.push(areaRandomMesh)

                        // const size = allSubsetMeshes[indexNoarea].geometry.boundingBox.getSize(new Vector3());
                        // const points = [];
                        // points.push( new Vector3( areaRandomMesh.position.x + sizeArea/2  , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z + size.z/2 ) );
                        // points.push( new Vector3( areaRandomMesh.position.x + sizeArea/2 , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z  -  size.z/2) );

                        // points.push( new Vector3( areaRandomMesh.position.x + sizeArea/2 + size.x  , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z - size.z/2 ) );
                        // points.push( new Vector3( areaRandomMesh.position.x + sizeArea/2 , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z  -  size.z/2) );



                        // //console.log("points", points)

                        // const pointsHorizontal = [];

                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x + sizeArea/2 + size.x , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z + size.z/2 ) );
                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x + sizeArea/2 + size.x , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z  -  size.z/2) );

                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x + sizeArea/2 + size.x  , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z + size.z/2 ) );
                        // pointsHorizontal.push( new Vector3( areaRandomMesh.position.x + sizeArea/2 , areaRandomMesh.position.y + 0.5, areaRandomMesh.position.z  +  size.z/2) );

                        // //console.log("pointsHorizontal", pointsHorizontal)

                        // const geometry = new BufferGeometry().setFromPoints( points );
                        // const line = new Line( geometry, material );

                        // const geometryHor = new BufferGeometry().setFromPoints( pointsHorizontal );
                        // const lineHor = new Line( geometryHor, material );

                        // //console.log("line", line, geometry)
                        // line.add(lineHor)
                        // scene.add( line );
                    }
               }
               //console.log("areasInFront", areasInFront, areaMeshes)

            //    for (let  o = 0; o < areaMeshes.length; o++){
            //     const boxhelper = new BoxHelper(areaMeshes[o], 0x000000)

            //     scene.add(boxhelper)
            //    }







        const buttonTxt = document.getElementById('programmFurniture')
        buttonTxt.innerText = `` ;

        checkallmodeIsActive = true
        furnituremodeIsActive = false
        //console.log("checkallmode activated", checkallmodeIsActive)

        for(let object = 0; object < areaMeshes.length; object++){
            const areasChild = areaMeshes[object].children[0]
            //console.log("areaChild", areasChild)

            areas.push(areasChild)

        }
        // for(let object = 0; object < areaMeshes.length; object++){
        areas = areaMeshes
        
        for(let ref = 0; ref < areas.length; ref++){
            const pos = new Vector3(areas[ref].position.x, areas[ref].position.y, areas[ref].position.z);
            const distanceX = startPositionsFurns[ref].x - pos.x
            const distanceY = startPositionsFurns[ref].y - pos.y
            const distanceZ = startPositionsFurns[ref].z - pos.z
            console.log("Distan", distanceX, distanceY, distanceZ, areas[ref].position, startPositionsFurns[ref])
            ReferencePositions.push(new Vector3(distanceX, distanceY, distanceZ))

            const RefDirArea = new Vector3(areas[ref].rotation.x,
                areas[ref].rotation.y,
                areas[ref].rotation.z).normalize();        
                
                if(RefDirArea.x === 0 && RefDirArea.y === 0 && RefDirArea.z ===0){
                    RefDirArea.x = ReferenceDirections[ref].x
                    RefDirArea.y = ReferenceDirections[ref].y
                    RefDirArea.z = ReferenceDirections[ref].z
                }
                ReferenceDirectionsAreas.push(RefDirArea)

        
                
        }
        console.log("areas", ReferenceDirectionsAreas, areas, ReferencePositions)

        
        
        boundingBoxes(areas)

        // for(let cube of areasInFront) {
        //     let cube1BB = new Box3(new Vector3(), new Vector3());
        //     cube1BB.setFromObject(cube)
        //     ////console.log("cube1BB", cube1BB)
        //     scene.add(cube)
        //     boundingCubesInFront.push(cube1BB)

        //     //console.log("boundingCubesInFront", boundingCubesInFront)
        // }

        


    } else {
        
        checkallmodeIsActive = false
        dincheckmodeIsActive = false
        //console.log("checkallmode activated", checkallmodeIsActive)
    }

    //DIN Check on clicks
    if( id === 'checkall-button'){
        dincheckBtnIsActive = true
        //console.log("dincheckBtnIsActive", dincheckBtnIsActive)

        const checkallbtn = document.getElementById('checkall-button')
        checkallbtn.onclick = clickedOnce('demo',"DIN Check wurde ausgeführt",'dincheck-buttonhover', checkallbtn  )




        DINCHECKER()

 

        translateAreaIfCollision(specificFurnIDList, 2, 0.6, 0.6)
        translateAreaIfCollision(specificFurnIDList, 0, 0.3, 0.3)

        
        //rotateOtherAreasAroundFurnitureIfCollision(noSpecificFurnIDList, 1.5)
        
      
   

        //console.log("Blue, IntersectionsIDsAreaIntersectArea", IntersectionsIDsAreaIntersectArea, IntersectionsIDsAreaIntersectAreaInFront)
        //console.log("lila, IntersectionsIDsAreaContainArea", IntersectionsIDsAreaContainArea)
        //console.log("rosa, IntersectionsIDsFurnIntersectFurn", IntersectionsIDsFurnIntersectFurn)
        //console.log("kaki, IntersectionsIDsFurnContainFurn", IntersectionsIDsFurnContainFurn)
        //console.log("beere, IntersectionsIDs", IntersectionsIDs, IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaContainWall, IntersectionsIDsFurnIntersectWall, IntersectionsIDsFurnContainWall)
        //console.log("dunkelgrün, IntersectionsIDsAreaContainFurn", IntersectionsIDsAreaContainFurn)


        for(let id = 0; id < areas.length; id++){
            areas[id].material.color = greyColor

        }


        boundingCubes.length = 0;
        boundingBoxes(areas)
        DINCHECKER()

        for(let id = 0; id < areas.length; id++){
            const materialStart = areas[id].material
            //console.log("materialStart", materialStart)
            checkedMats.push(materialStart)
        }

        //console.log("ifcPr", ifcProject)
        createTreeMenu(ifcProject, "tree-root")



    } else {
        dincheckBtnIsActive = false
        //console.log("dincheckBtnIsActiveFalse", dincheckBtnIsActive)
    }


    if(id === 'downloadmode'){
        downloadmodeIsActive = true;
        //console.log("downloadmode active", downloadmodeIsActive)
        for(let i =0 ; i < allSubsetMeshes.length; i++){
            const geom = new Box3(new Vector3(), new Vector3());
            geom.setFromObject(allSubsetMeshes[i])
            geom.copy(allSubsetMeshes[i].geometry.boundingBox).applyMatrix4(allSubsetMeshes[i].matrixWorld)
            
        }
        
        document.addEventListener('pointerup', setNewPosition(event, allSubsetMeshes ))



    } else {
        downloadmodeIsActive = false;
        //console.log("downloadmode deactivated", downloadmodeIsActive)
    }

    });
});


function clickedOnce(id, text, style, btn){
    document.getElementById(id).innerHTML = text;
    //checkCollisionAll(boundingCubes, areas, subsetBoundingBoxes)
    btn.disabled = true
    btn.classList.remove(style)

    ////console.log("boundingCubes", boundingCubes)
}

const idMesh = [];
function checkAndShowCollisions(indices) {
    for(let k = 0; k < indices.length; k++) {
       ////console.log(allSubsetMeshes[indices[k][0]].uuid)
       collidedIDs.push(allSubsetMeshes[indices[k][0]].uuid)

       collidedWithIDs.push(allSubsetMeshes[indices[k][1]].uuid)
    }
    ////console.log("collidedIDs", collidedIDs, collidedWithIDs)
    // const result = collidedIDs.filter(filterNotCollidingIDs)
    // //console.log("resilt", result)

    for (let id = 0; id < allSubsetMeshes.length; id++){
        idMesh.push(allSubsetMeshes[id].uuid)
    }


    const meshNotColliding = [];
    for ( let j = 0; j < checkedListIntersectFurnAndArea.length; j++){
        if(checkedListIntersectFurnAndArea[j] === false){
            const mesh = allSubsetMeshes[indicesIntersectFurnAndArea[j][0]].uuid


            const mesh2 = allSubsetMeshes[indicesIntersectFurnAndArea[j][1]].uuid

            const index = idMesh.indexOf(mesh2)
            ////console.log("index Mesh", index)
            meshNotColliding.push(mesh2)
            ////console.log(mesh, mesh2)
        }
    }

    filterNotCollidingIDs(idMesh, meshNotColliding)




    function filterNotCollidingIDs(idsMesh, ids){
        for(let i = 0; i < idsMesh.length; i++){
                const testingIncludes = ids.includes(idsMesh[i])
                ////console.log(allSubsetMeshes,indicesIntersectFurnAndArea, testingIncludes)
                if(testingIncludes === true) {
                    ////console.log("nope im not part of it", idsMesh[i])
                //     return allSubsetMeshes[i].uuid
                }
        }
    }
}
////////////////////////////////////
// /////CLIPPTNGPLANE//////////////////
const params = {
    clipIntersection: true,
    planeConstant: 0,
    showHelpers: false
};

const clipPlanes = [ new Plane(new Vector3(0,-1,0),0)] //new Plane(new Vector3(1,0,0),0),, new Plane(new Vector3(0,0,-1),0)


const group = new Group()
const cubeMat = new MeshPhongMaterial({color: 0x00ff00, side: DoubleSide, clippingPlanes: clipPlanes, clipIntersection: params.clipIntersection,
     })

const geom = new BoxGeometry(1,1,1)
const cube1 = new Mesh(
    geom,
    cubeMat
)
cube1.position.set(0,0,0)
//console.log("cube1", cube1)
group.add(cube1)
//scene.add(group)


const helpers = new Group()

helpers.add(new PlaneHelper(clipPlanes[0], 2, 0xff0000))
// helpers.add(new PlaneHelper(clipPlanes[1], 2, 0x00ff00))
// helpers.add(new PlaneHelper(clipPlanes[2], 2, 0x0000ff))
helpers.visible = true;
scene.add(helpers)
////////////////////////////////////

// const cube2 = new Mesh(
//     new BoxGeometry(2,2,2),
//     new MeshPhongMaterial({color: 0xffff00})
// )
// cube2.position.set(-3,0,0)

// const cube3 = new Mesh(
//     new BoxGeometry(1.5, 1.5, 1.5),
//     new MeshPhongMaterial({color: 0x00ff00})
// )
// cube3.position.set(-6,0,2)

// const cubes = [cube1, cube2, cube3]
// areaMeshes.push(cube1,cube2, cube3)

const boundingCubes = [];
let check;
let containing;
const selectedCube = []
let lastIndex;
let lastFurnitureFound
const subsetBoundingBoxes = [];



async function pickFurnitureSecond(event, furnitureMeshes, areasMeshes ) {
    
    for(let l = 0; l < labels.length; l++){
        //areas[id].add(labels[l])
        scene.remove(labels[l])
        
    }
    labels.length = 0
    
    const found = castObjects(event, furnitureMeshes)[0];
    //console.log("found Mesh", found, furnituremodeIsActive)
    if(found) {
        const index = found.faceIndex;
        // //console.log("index", index)
        lastFurniture = found.object;
        console.log(lastFurniture)

        const geometry = found.object.geometry;


            
        


        //const gumballPosition =  gumball.position.set(found.point.x,found.point.y, found.point.z)

        // center = bbox.getCenter(center);
        // center.sub(meshGroup.position);
        // transformControl.position.set(center.x, center.y, center.z);
        // transformControl.attach(meshGroup);
        //move area around

        //gumball.position.set(gumballPosition.x - lastFurniture.position.x, gumballPosition.y, gumballPosition.z - lastFurniture.position.z)

        selectedCube.push(found.object)

        for(id = 0; id < areasMeshes.length; id++){
            if(areasMeshes[id].uuid === found.object.uuid){
                console.log("id", id,areasMeshes[id].uuid , found.object.uuid )
                lastIndex = id
            }
        }
       
        let center = new Vector3(0,0,0);
        center = areasMeshes[lastIndex].geometry.boundingBox.getCenter(center);
        
        gumball.position.set(center.x, center.y, center.z)
        gumball.setSpace('local');
       
        
        //lastIndex = areasMeshes.indexOf(found.object.uuid)
        console.log("lastIndex", lastIndex, areasMeshes, furnitureMeshes)

        //move furniture around
        gumball.attach(areasMeshes[lastIndex])
        ////console.log("Position", lastFurniture.position, furnitureMeshes[lastIndex].position)
        const lastPosition = lastFurniture.position

        //furnitureMeshes[lastIndex].position.set(-lastPosition.x, lastPosition.y, -lastPosition.z)
        ////console.log("Position2", lastFurniture.position, furnitureMeshes[lastIndex].position)
        //console.log("furn1", "area",areasMeshes[lastIndex], "furn", lastFurniture, "areaPos", areasMeshes[lastIndex].position,"FurnPos", lastFurniture.position, wallSubsetMeshes, "areaPRot", areasMeshes[lastIndex].rotation,"FurnPRot", lastFurniture.rotation)
        
        
       

        if(lastFurniture.position.x === 0 && lastFurniture.position.y === 0 && lastFurniture.position.z === 0 ){
            lastFurniture.rotation.set(areasMeshes[lastIndex].rotation.x, -areasMeshes[lastIndex].rotation.y, areasMeshes[lastIndex].rotation.z)
        
            lastFurniture.position.set( - 1 * areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y,-1 * areasMeshes[lastIndex].position.z)
            // lastFurniture.rotation.set(areasMeshes[lastIndex].rotation.x, -areasMeshes[lastIndex].rotation.y, areasMeshes[lastIndex].rotation.z)
            
    
        } 
         //lastFurniture.add(areasMeshes[lastIndex])
        
         
        
        
        areasMeshes[lastIndex].add(lastFurniture)

  
        // console.log("furn2", "area",areasMeshes[lastIndex], "furn", lastFurniture, "areaPos", areasMeshes[lastIndex].position,"FurnPos", lastFurniture.position, wallSubsetMeshes, "areaPRot", areasMeshes[lastIndex].rotation, 
        // "FurnPRot", lastFurniture.rotation)

        
        //lastFurniture.position.set(lastPosition.x, lastPosition.y, lastPosition.z)
        scene.add(gumball)

      

       


    } 
}
window.addEventListener( 'keydown', function ( event ) {

        switch ( event.keyCode ) {

            // case 81: // Q
            //     gumball.setSpace( gumball.space === 'local' ? 'world' : 'local' );
            //     break;

            case 16: // Shift
                //gumball.setTranslationSnap( 100 );
                //gumball.setRotationSnap( MathUtils.degToRad( 15 ) );
                //gumball.setScaleSnap( 0.25 );
                break;

            case 84: // T
                gumball.setMode( 'translate' );
                gumball.showY = ! gumball.showY;
                break;

            case 69: // E
                
            // control.setMode( 'scale' );
            //         break;
                
                break;

             case 82: // R
                gumball.setRotationSnap( MathUtils.degToRad( 90 ) );

                gumball.showY = !gumball.showY;
                gumball.showZ =  !gumball.showZ;
                gumball.showX =  !gumball.showX;

                gumball.setMode( 'rotate' );

                
                
                // const spherePos = areas[lastIndex].children[0].children[0].getWorldPosition(new Vector3())
                // const vectorDir = new Vector3( areas[lastIndex].position.z - spherePos.z ,areas[lastIndex].position.x - spherePos.x , 0)
                
                // console.log(spherePos, vectorDir.normalize(), specificFurnIDList)
          
                // const areaRef = new Vector3(areas[lastIndex].quaternion.x , areas[lastIndex].quaternion.y, areas[lastIndex].quaternion.z);
                
                // if(areaRef.x === 0 && areaRef.y === 0 && areaRef.z === 0){
                //     console.log("zero", areaRef, ReferenceDirections[lastIndex], areas[lastIndex], areas[lastIndex].quaternion.w, areas[lastIndex].uuid)
                //     areaRef.x = modifiedDirections[lastIndex].x
                //     areaRef.y = modifiedDirections[lastIndex].y
                //     areaRef.z = modifiedDirections[lastIndex].z
                    
                //     ReferenceDirectionsAreas[lastIndex] = areaRef
                //     if(areaRef.x === 1 && areaRef.y === 0 && areaRef.z === 0){
                        
                //     }
                // } 

                    
                
            
                // if(areaRef.x === 0 && areaRef.y === 0 && areaRef.z === 0 ){
                //     areaRef.y = 1
                // }
             
               
                console.log("ReferenceDirectionsAreasR", ReferenceDirectionsAreas, ReferenceDirections, lastIndex, areas, modifiedDirections)

                break;
               

            case 67: // C
                
               
                //console.log("cbt", counter)
                break;

        //     case 86: // V
        //         const randomFoV = Math.random() + 0.1;
        //         const randomZoom = Math.random() + 0.1;

        //         cameraPersp.fov = randomFoV * 160;
        //         cameraOrtho.bottom = - randomFoV * 500;
        //         cameraOrtho.top = randomFoV * 500;

        //         cameraPersp.zoom = randomZoom * 5;
        //         cameraOrtho.zoom = randomZoom * 5;
        //         onWindowResize();
        //         break;

        //     case 187:
        //     case 107: // +, =, num+
        //         control.setSize( control.size + 0.1 );
        //         break;

        //     case 189:
        //     case 109: // -, _, num-
        //         control.setSize( Math.max( control.size - 0.1, 0.1 ) );
        //         break;

        //     case 88: // X
        //         control.showX = ! control.showX;
        //         break;

        //     case 89: // Y
        //         control.showY = ! control.showY;
        //         break;

        //     case 90: // Z
        //         control.showZ = ! control.showZ;
        //         break;

            // case 32: // Spacebar
            //     gumball.enabled = ! gumball.enabled;
            //     break;

            // case 27: // Esc
            //     gumball.reset();
            //     break;

        }

    } );

        
    let counter = 0;
    window.addEventListener( 'keyup', function ( event ) {

        for(let i = 0; i < ReferenceDirectionsAreas.length; i++) {
            ReferenceDirectionsAreas[i].normalize()
        }
        //console.log("ReferenceDirectionsAreas2", ReferenceDirectionsAreas, ReferenceDirections)
        switch ( event.keyCode ) {
                case 82:
                    // const spherePos = allSubsetMeshes[lastIndex].children[0].getWorldPosition(new Vector3())
                    // const vectorDir = new Vector3( areas[lastIndex].position.z - spherePos.z ,areas[lastIndex].position.x - spherePos.x , 0)
                    // console.log( "R else", areas[lastIndex].uuid, spherePos, vectorDir.normalize())
                    
                    
                    // modifiedDirections[lastIndex] = vectorDir.normalize()

              
                 
                    
                   
                    //console.log("area" ,ReferenceDirectionsAreas[lastIndex], areaRef,areas[lastIndex], areas[lastIndex].quaternion.w.toFixed(2))
                
                    //console.log('modif', modifiedDirections, spherePos, vectorDir.normalize(), areas[lastIndex], ReferenceDirections, lastIndex)
                    break;

            case 16: // Shift
                gumball.setTranslationSnap( null );
                gumball.setRotationSnap( null );
                gumball.setScaleSnap( null );
                break;
            
            
            case 69: // E

            console.log("Found1",areas[lastIndex].uuid, specificFurnIDList[2].value, translationList)
        
            if(areas[lastIndex].uuid === specificFurnIDList[2].value || areas[lastIndex].uuid === specificFurnIDList[0].value){
            const occurs = translationList.includes(areas[lastIndex].uuid )
            console.log("cbt1", counter, occurs)
            if(occurs){
                counter -= 1;
                        if(counter === -2){
        
                            console.log("cbt-2", counter)
                            translateAreaPush(lastIndex, -0.6,-0.6, -0.3, -0.3)
                            counter += 1
                        } else if (counter === -1){
                            translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
                            counter += 2;
                        }
                        else if (counter === 0){
                            translateAreaPush(lastIndex, -0.6,-0.6,- 0.3,- 0.3)
                            
                        }
            } 
            if(!occurs) {
                counter -= 1;
                        if(counter === -2){
        
                            console.log("cbt-2", counter)
                            translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
                            counter += 1
                        } else if (counter === -1){
                            translateAreaPush(lastIndex, -0.6,-0.6, -0.3, -0.3)
                            counter += 2;
                        }
                        else if (counter === 0){
                            translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
                            
                        }

            }
        }

            // for (let i = 0; i < translationList.length; i++) {
            //     if(translationList[i] !== areas[lastIndex].uuid){
            //         counter -= 1;
            //         if(counter === -2){
    
            //             console.log("cbt-2", counter)
            //             translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
            //             counter += 1
            //         } else if (counter === -1){
            //             translateAreaPush(lastIndex, -0.6,-0.6, -0.3, -0.3)
            //             counter += 2;
            //         }
            //         else if (counter === 0){
            //             translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
                        
            //         }
            //     } else if(translationList[i] === areas[lastIndex].uuid){
            //         counter -= 1;
            //         if(counter === -2){
    
            //             console.log("cbt-2", counter)
            //             translateAreaPush(lastIndex, -0.6,-0.6, -0.3, -0.3)
            //             counter += 1
            //         } else if (counter === -1){
            //             translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
            //             counter += 2;
            //         }
            //         else if (counter === 0){
            //             translateAreaPush(lastIndex, -0.6,-0.6,- 0.3,- 0.3)
                        
            //         }
            //     }
            // }
                
 
           
            // if(counter === 0) {
            //     translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
            //     counter += 1
            // }
            console.log("cbt2", counter)
            
            // if(translationList.length > 2 ){
            //     translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)

            // }
            // else {

            //     break;
            // }
                       
                
                
                break;
               
     

        }
        

    } );


    function translateAreaPush(lastIndex, moveX, moveZ, moveX2, moveZ2){
        if(areas[lastIndex].uuid === specificFurnIDList[2].value){
            console.log("Found2",areas[lastIndex].uuid, specificFurnIDList[2].value )
        
            indexWC = lastIndex
            lastPosition = areas[indexWC].position
            //console.log("Pos", lastPosition, ReferenceDirections[indexWC],  areas[indexWC])
            if(ReferenceDirections[indexWC].x === -1 ){
                areas[indexWC].children[0].translateX(moveX)
                

                //areas[indexWC].position.set(lastPosition.x + moveX,lastPosition.y ,lastPosition.z )
                translationList.push(areas[indexWC].uuid)

                areas[indexWC].geometry.boundingBox
                // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                // scene.add(boxhelper)

            }
            if(ReferenceDirections[indexWC].x === 1){

                areas[indexWC].children[0].translateX(moveX)
               // areas[indexWC].position.set(lastPosition.x + moveX,lastPosition.y ,lastPosition.z )
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)
                // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                // scene.add(boxhelper)

            }
            if(ReferenceDirections[indexWC].y === -1){
                areas[indexWC].children[0].translateZ(moveZ)
                //areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ)
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)
               

            }
            if(ReferenceDirections[indexWC].y === 1){
                areas[indexWC].children[0].translateZ(moveZ)
                //areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ)
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)
                
            }

    
        }
        else if(areas[lastIndex].uuid === specificFurnIDList[0].value){
                console.log("Found2",areas[lastIndex], specificFurnIDList[0].value )
             
                indexWC = lastIndex
                lastPosition = areas[indexWC].position
                //console.log("Pos", lastPosition, ReferenceDirections[indexWC],  areas[indexWC])
                if(ReferenceDirections[indexWC].x === -1 ){
                    areas[indexWC].children[0].translateX(moveX2) 
                    //areas[indexWC].position.set(lastPosition.x + moveX2,lastPosition.y ,lastPosition.z )
                    translationList.push(areas[indexWC].uuid)
    
                    areas[indexWC].geometry.boundingBox
                    // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                    // scene.add(boxhelper)
    
                }
                if(ReferenceDirections[indexWC].x === 1){
                    
                    areas[indexWC].children[0].translateX(moveX2) 
                    //areas[indexWC].position.set(lastPosition.x + moveX2,lastPosition.y ,lastPosition.z )
                    areas[indexWC].geometry.boundingBox
                    translationList.push(areas[indexWC].uuid)
                    // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                    // scene.add(boxhelper)
    
                }
                if(ReferenceDirections[indexWC].y === -1){
                    areas[indexWC].children[0].translateZ(moveZ2) 
                    //areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ2)
                    areas[indexWC].geometry.boundingBox
                    translationList.push(areas[indexWC].uuid)
                   
    
                }
                if(ReferenceDirections[indexWC].y === 1){
                    areas[indexWC].children[0].translateZ(moveZ2) 
                    //areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ2)
                    areas[indexWC].geometry.boundingBox
                    translationList.push(areas[indexWC].uuid)
                    
                }
    
            //translateAreaIfCollision(specificFurnIDList, 0, -0.3, -0.3)
        } 
        else {
            return
        }

    }

function boundingBoxes(meshes){
    ////console.log(meshes)
    for(let cube of meshes) {
        let cube1BB = new Box3(new Vector3(), new Vector3());
        cube1BB.setFromObject(cube)
        ////console.log("cube1BB", cube1BB)
        scene.add(cube)
        boundingCubes.push(cube1BB)

        // //console.log("boundingCubes", boundingCubes)
    }


}


//checkCollision(boundingCubes, selectedCube)
//welcher cube soll sich verfärben? Der found cube!
function checkCollision(boundingCubes, areas, subsetBoundingBoxes) {
    let iteration = ""
    const checks = []
    const contains = []
    const intersectsFurn = []
    const containsFurn = []
    const intersectsWall = []
    const containsWall = []

    boundingCubes.forEach(boundingCube)
    subsetBoundingBoxes.forEach(boundingCubeFurn)
    wallBounds.forEach(boundingCubeWall)

    //area area
    function boundingCube(item, index, selection){
        iteration += index
        ////console.log("222",index,item, selection[lastIndex], selection)
        if(lastIndex !== index){
            check = item.intersectsBox(selection[lastIndex])
            ////console.log(check, item, selection[lastIndex], index, lastIndex)
            containing = item.containsBox(selection[lastIndex])
            // //console.log("contains", containing, index)
            //return check
        }
        checks.push(check)
        contains.push(containing)
        ////console.log("dd", cubes[0])
    }

    //furn furn
    function boundingCubeFurn(item, index, selection){
        iteration += index
        ////console.log(index,item, selection[lastIndex])
        if(lastIndex !== index){
            check = item.intersectsBox(selection[lastIndex])
            ////console.log(check, item, selection[lastIndex], index, lastIndex)
            containing = item.containsBox(selection[lastIndex])
        }
        intersectsFurn.push(check)
        containsFurn.push(containing)
    }

    //Walls
    function boundingCubeWall(item, index, selection){
        iteration += index
        ////console.log(index,item, selection[lastIndex])
        if(lastIndex !== index){
            check = item.intersectsBox(selection[lastIndex])
            ////console.log(check, item, selection[lastIndex], index, lastIndex)
            containing = item.containsBox(selection[lastIndex])
        }
        intersectsWall.push(check)
        containsWall.push(containing)
    }

    //area furn
    const test = []
    for(let i = 0; i < subsetBoundingBoxes.length; i++){

        const tests = subsetBoundingBoxes[i].intersectsBox(boundingCubes[lastIndex])

        if(tests === true){ test.push(tests) }
        ////console.log("test", test)
    }

    // furn area
    const furnTest = [];
    for(let i = 0; i < boundingCubes.length; i++){

        const tests = boundingCubes[i].intersectsBox(subsetBoundingBoxes[lastIndex])

        if(tests === true){ furnTest.push(tests) }
        ////console.log("test2", furnTest)
    }


    // furn wall
    // const furnWallTest = [];
    // for(let i = 0; i < wallBounds.length; i++){

    //     const tests = wallBounds[i].intersectsBox(subsetBoundingBoxes[lastIndex])

    //     if(tests === true){ furnWallTest.push(tests) }
    //     ////console.log("test2", furnTest)
    // }

    // area wall
    const areaWallTest = [];
    for(let i = 0; i < wallBounds.length; i++){

        const tests = wallBounds[i].intersectsBox(boundingCubes[lastIndex])

        if(tests === true){ areaWallTest.push(tests) }
        //console.log("areaWallTest", areaWallTest, tests)
    }

    for(let cube = 0; cube < checks.length; cube++){
        //console.log("lastind", lastIndex, foundSubsetsID)

        if(cube !== lastIndex){
            const lastColor = areas[cube].material.color
            //console.log("color", areas[lastIndex].material.color)
            removeSubsetAndGetOriginalMaterials(checkedListIntersectFurnAndArea, foundSubsets, indicesIntersectFurnAndArea,1)
            removeSubsetAndGetOriginalMaterials(checkedListIntersectFurnAndArea, prepickedSubset, indicesIntersectFurnAndArea,1)
            ////console.log("cubelast", cube, lastIndex)
            ////console.log(checks)
            if(checks.includes(true) ){
                // area against area -> dark blue
                //console.log("checks", checks)
                ////console.log(checks, lastIndex, cubes[lastIndex], "checks, lstind", cubes)
                    areas[lastIndex].material.transparent = true;
                    areas[lastIndex].material.opacity = 0.5;
                    areas[lastIndex].material.color = new Color( 0x0000ff)

                    //console.log("position", allSubsetMeshes[lastIndex].position)

                    if (contains.includes(true)){
                        if(contains[cube] === true){
                            //light blue
                            //console.log(cube, "eetzuio")
                            areas[cube].material.color = new Color( 0x01c7fc)
                        }
                        if(containsFurn.includes(true)){
                            // ligth pink
                            if(containsFurn[cube] === true){
                                areas[cube].material.color = new Color( 0xd357fe)
                            }

                        }

                    }else {
                        areas[cube].material.color = greyColor //checkedMats[cube].color
                        areas[cube].material.opacity = 0.7;
                        // areas[cube].material.color = new Color( 0x00ff00)
                        // areas[cube].material.opacity = 0.7;
                    }

            }

            else {
                areas[lastIndex].material.color = greyColor
                areas[lastIndex].material.opacity = 0.7;
            }

            if (test.length >= 2){
                // light red
                //console.log("tests", test)
                areas[lastIndex].material.transparent = true;
                areas[lastIndex].material.opacity = 0.5;
                areas[lastIndex].material.color = new Color( 0xff0000)
            }
            if (furnTest.length >= 2){
                // dark ligth red
                //console.log("furnTest", furnTest)
                areas[lastIndex].material.transparent = true;
                areas[lastIndex].material.opacity = 0.7;
                areas[lastIndex].material.color = new Color( 0xff0000)
            }


            if(areaWallTest.includes(true)){
                //area against wall -> petrol
                //console.log("areaWallTest2", areaWallTest, lastIndex, allSubsetMeshes[lastIndex])
                areas[lastIndex].material.transparent = true;
                areas[lastIndex].material.opacity = 0.5;
                areas[lastIndex].material.color = new Color(0x016e8f) //
                IntersectionsIDsAreaIntersectWall.push(allSubsetMeshes[lastIndex].uuid)
            }

            if(intersectsFurn.includes(true)){
                //furniture against furniture -> purple
                //console.log("intersectsFurn", intersectsFurn)
                areas[lastIndex].material.transparent = true;
                areas[lastIndex].material.opacity = 0.5;
                areas[lastIndex].material.color = new Color( 0x7a0060)
            }

            if(intersectsFurn.includes(true) && checks.includes(true)){
                //dark wine red
                areas[lastIndex].material.transparent = true;
                areas[lastIndex].material.opacity = 0.5;
                areas[lastIndex].material.color = new Color(0x831900) // green 0x64c466
            }
        }

    }

}

function fireCollisionDetection(areas,areaMeshes,boundingCubes){
    if(areas.length >= 1){

        canvas.ondblclick = (event) =>  pickFurnitureSecond(event, allSubsetMeshes, areas) ; //cubes
        ////console.log(allSubsetMeshes)
        if (lastIndex !== undefined) {
            //console.log("lastindex animate", lastIndex)
            //console.log("hello im not undefinded", areas[lastIndex])

                for(let cube = 0; cube < boundingCubes.length; cube++){
                    boundingCubes[lastIndex].copy( areas[lastIndex].geometry.boundingBox).applyMatrix4(areas[lastIndex].matrixWorld)

                }
                ////console.log(selected)
                for(let cube = 0; cube < subsetBoundingBoxes.length; cube++){
                    subsetBoundingBoxes[lastIndex].copy( allSubsetMeshes[lastIndex].geometry.boundingBox).applyMatrix4(allSubsetMeshes[lastIndex].matrixWorld)

                }


                checkCollision(boundingCubes, areas, subsetBoundingBoxes)




        }
    } return areas[lastIndex]

}
const geomsAnimate = [];
const curves = [];
const someflows = [];





//Animation loop
const animate = () => {

    if(furnituremodeIsActive === true ){

        canvas.ondblclick = (event) =>  pickFurniture(event, selectionMaterialFurniture ,allSubsetMeshes ) ;


    }
    if( checkallmodeIsActive === true){
        
    // rotateOtherAreasAroundFurnitureIfCollision(noSpecificFurnIDList, 1.5)
    // function rotateOtherAreasAroundFurnitureIfCollision(specificFurnIDList, sizeArea){
    //     //console.log("noSpecificFurnIDList", noSpecificFurnIDList)
    //     for(let id = 0; id < specificFurnIDList.length; id++) {
    //         //console.log("ID searching", specificFurnIDList[id])
    //         if(IntersectionsIDsAreaIntersectArea.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDsAreaContainArea.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDsFurnIntersectFurn.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDsFurnContainFurn.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDs.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDsFurnIntersectArea.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDsFurnContainArea.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDsAreaIntersectWall.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDsAreaContainWall.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDsFurnIntersectWall.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDsFurnContainWall.includes(specificFurnIDList[id]) === true ||
    //             IntersectionsIDsAreaContainFurn.includes(specificFurnIDList[id]) === true ) {


    //                 for (let i = 0; i < areas.length; i++){

    //                     if(areas[i].uuid === specificFurnIDList[id]) {
    //                             indexWC = i
    //                             //console.log("ID is found!!!!!", specificFurnIDList[id], areas[i], ReferenceDirections[i], lastPosition, indexWC)

    //                             lastPosition = areas[indexWC].position
    //                             //console.log("PosRot", lastPosition, ReferenceDirections[indexWC],  areas[indexWC], allSubsetMeshes[indexWC], allSubsetMeshes[indexWC].geometry.boundingBox.getSize(new Vector3()))
    //                             const size = allSubsetMeshes[indexWC].geometry.boundingBox.getSize(new Vector3());
    //                             //console.log("size", size, lastPosition)
    //                             // if(ReferenceDirections[indexWC].x < 0> ){
    //                             //     //console.log(allSubsetMeshes[indexWC], "x-1")
    //                             //     areas[indexWC].position.set(lastPosition.x + size.x ,lastPosition.y ,lastPosition.z - size.y - sizeArea/2 )
    //                             // }
    //                             //areas[indexWC].translateX(0.2)
                                
    //                             if(ReferenceDirections[indexWC].x > 0){
    //                                 //console.log(allSubsetMeshes[indexWC], "x1")

    //                                 areas[indexWC].rotate.y += 0.005
    //                                 //areas[indexWC].position.set(lastPosition.x + size.x/2 + sizeArea/2 ,lastPosition.y  ,lastPosition.z - sizeArea/2 -size.z/2  )
                                 
    //                                 //rotateOtherAreasAroundFurnitureIfCollision(specificFurnIDList, sizeArea)


    //                             }
    //                             // if(ReferenceDirections[indexWC].y === -1){
    //                             //     //console.log(allSubsetMeshes[indexWC], "y-1")
    //                             //     areas[indexWC].position.set(lastPosition.x  - size.x - sizeArea/2,lastPosition.y ,lastPosition.z + size.y)
    //                             // }
    //                             // if(ReferenceDirections[indexWC].y === 1){
    //                             //     //console.log(allSubsetMeshes[indexWC], "y1")
    //                             //     areas[indexWC].position.set(lastPosition.x  - size.x - sizeArea/2,lastPosition.y ,lastPosition.z + size.y)
    //                             // }


    //                         }

    //                     }
    //                 }
    //             } 


    // }


               // for(let i = 0 ; i < someflows.length; i++){

        //     if ( someflows[i] ) {

        //         someflows[i].moveAlongCurve(0.001);


        //     }
        // }

    }
    if(storymodeIsActive === true){
        // //console.log("Blue, IntersectionsIDsAreaIntersectArea2", IntersectionsIDsAreaIntersectArea)
        // //console.log("lila, IntersectionsIDsAreaContainArea2", IntersectionsIDsAreaContainArea)
        // //console.log("rosa, IntersectionsIDsFurnIntersectFurn2", IntersectionsIDsFurnIntersectFurn)
        // //console.log("kaki, IntersectionsIDsFurnContainFurn2", IntersectionsIDsFurnContainFurn)
        // //console.log("beere, IntersectionsIDs2", IntersectionsIDs, IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaContainWall, IntersectionsIDsFurnIntersectWall, IntersectionsIDsFurnContainWall)
        // //console.log("dunkelgrün, IntersectionsIDsAreaContainFurn2", IntersectionsIDsAreaContainFurn)

        // //console.log("ifcPr", ifcProject)
        // createTreeMenu(ifcProject)
        
        canvas.onpointermove = (event) => collisionCheckLoop ();


        function collisionCheckLoop () {

            if(areas.length >= 1){

                canvas.onpointerdown = (event) =>  pickFurnitureSecond(event, allSubsetMeshes, areas) ; //cubes
                ////console.log(allSubsetMeshes)
                
                canvas.onpointerup = (event) => {
                    const spherePos = allSubsetMeshes[lastIndex].children[0].getWorldPosition(new Vector3())
                    const vectorDir = new Vector3( areas[lastIndex].position.z - spherePos.z ,areas[lastIndex].position.x - spherePos.x , 0)
                    console.log( "R else", areas[lastIndex].uuid, spherePos, vectorDir.normalize())
                    
                    
                    modifiedDirections[lastIndex] = vectorDir.normalize()
                
                }
                
 
                if (lastIndex !== undefined) {
                    //console.log("lastindex animate", lastIndex)
                    //console.log("hello im not undefinded", areas[lastIndex], areas[lastIndex].uuid)
                    for(let cube = 0; cube < boundingCubes.length; cube++){
                        boundingCubes[cube].copy( areas[cube].geometry.boundingBox).applyMatrix4(areas[cube].matrixWorld)

                    }
                    ////console.log(selected)
                    for(let cube = 0; cube < subsetBoundingBoxes.length; cube++){
                        subsetBoundingBoxes[cube].copy( allSubsetMeshes[cube].geometry.boundingBox).applyMatrix4(allSubsetMeshes[cube].matrixWorld)

                    }


                    DINCHECKER()
            newColorForCollidingArea(IntersectionsIDsAreaIntersectArea,IntersectionsIDsAreaIntersectAreaWith, greyColor)
            newColorForCollidingArea(IntersectionsIDsAreaContainArea,IntersectionsIDsAreaContainAreaWith, areaContainAreaColor)

            newColorForCollidingArea(IntersectionsIDsFurnIntersectFurn,IntersectionsIDsFurnIntersectFurnWith, furnIntersectFurnColor)
            newColorForCollidingArea(IntersectionsIDsFurnContainFurn,IntersectionsIDsFurnContainFurnWith, furnContainFurnColor)

            newColorForCollidingArea(IntersectionsIDs,IntersectionsIDsWith, greyColor)
            newColorForCollidingArea(IntersectionsIDsAreaContainFurn,IntersectionsIDsAreaContainFurnWith, furnClashAreaColor)

            newColorForCollidingArea(IntersectionsIDsFurnIntersectArea,IntersectionsIDsFurnIntersectAreaWith, greyColor)
            newColorForCollidingArea(IntersectionsIDsFurnContainArea,IntersectionsIDsFurnContainAreaWith, furnClashAreaColor)

            newColorForCollidingArea(IntersectionsIDsAreaIntersectWall,IntersectionsIDsAreaIntersectWallWith, greyColor)
            newColorForCollidingArea(IntersectionsIDsAreaContainWall,IntersectionsIDsAreaContainWallWith, furnClashAreaColor)

            newColorForCollidingArea(IntersectionsIDsFurnIntersectWall,IntersectionsIDsFurnIntersectWallWith, greyColor)
            newColorForCollidingArea(IntersectionsIDsFurnContainWall,IntersectionsIDsFurnContainWallWith, furnContainFurnColor)


            // translateAreaIfCollision(specificFurnIDList, 2, 0.6, 0.6)
            // translateAreaIfCollision(specificFurnIDList, 0, 0.3, 0.3)

            //makes Areas grey if there is no intersection
            for(let id = 0; id < allIDsInChecker.length; id++) {

                if(IntersectionsIDsAreaIntersectArea.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsAreaContainArea.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnIntersectFurn.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnContainFurn.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnIntersectArea.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnContainArea.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDs.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsAreaIntersectWall.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsAreaContainWall.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnIntersectWall.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnContainWall.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsAreaContainFurn.includes(allIDsInChecker[id]) === false &&

                    IntersectionsIDsAreaIntersectAreaWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsAreaContainAreaWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnIntersectFurnWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnContainFurnWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnIntersectAreaWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnContainAreaWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsAreaIntersectWallWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsAreaContainWallWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnIntersectWallWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsFurnContainWallWith.includes(allIDsInChecker[id]) === false &&
                    IntersectionsIDsAreaContainFurnWith.includes(allIDsInChecker[id]) === false ) {
                        //console.log("ID is not included!!!!!", allIDsInChecker[id])
                        for (let i = 0; i < areas.length; i++){
                            if(areas[i].uuid === allIDsInChecker[id]) {
                                areas[i].material.color = greyColor;

                            }
                        }
                    }
            }




            function newColorForCollidingArea(IntersectionsIDsAreaIntersectArea,IntersectionsIDsAreaIntersectAreaWith, color) {
                if(IntersectionsIDsAreaIntersectArea.includes(areas[lastIndex].uuid)=== true) {
                    //console.log("INCLUDED",areas[lastIndex].uuid, IntersectionsIDsAreaIntersectArea.indexOf(areas[lastIndex].uuid), indices, checkedList,IntersectionsIDsAreaIntersectAreaWith, IntersectionsIDsAreaIntersectArea)

                    const indexSearching = IntersectionsIDsAreaIntersectArea.indexOf(areas[lastIndex].uuid)

                    //console.log("INT WITH:", IntersectionsIDsAreaIntersectAreaWith[indexSearching])
                    for (let i = 0; i < areas.length; i++){
                        if(areas[i].uuid === IntersectionsIDsAreaIntersectAreaWith[indexSearching]) {
                            areas[i].material.color = color
                        }
                    }
                }
            }


            if(IntersectionsIDsAreaIntersectArea.length === 0 &&
                IntersectionsIDsAreaContainArea.length === 0 &&
                IntersectionsIDsFurnIntersectFurn.length === 0 &&
                IntersectionsIDsFurnContainFurn.length === 0 &&
                IntersectionsIDsFurnIntersectArea.length === 0 &&
                IntersectionsIDsFurnContainArea.length === 0 &&
                IntersectionsIDs.length === 0 &&
                IntersectionsIDsAreaIntersectWall.length === 0 &&
                IntersectionsIDsAreaContainWall.length === 0 &&
                IntersectionsIDsFurnIntersectWall.length === 0 &&
                IntersectionsIDsFurnContainWall.length === 0 &&
                IntersectionsIDsAreaContainFurn.length === 0 ) {

                    for (let i = 0; i < areas.length; i++){
                        areas[i].material.color = greyColor;
                    }
                }
            //console.log("Blue2, IntersectionsIDsAreaIntersectArea", IntersectionsIDsAreaIntersectArea)
            //console.log("lila2, IntersectionsIDsAreaContainArea", IntersectionsIDsAreaContainArea)
            //console.log("rosa2, IntersectionsIDsFurnIntersectFurn", IntersectionsIDsFurnIntersectFurn)
            //console.log("kaki2, IntersectionsIDsFurnContainFurn", IntersectionsIDsFurnContainFurn)
            //console.log("beere2, IntersectionsIDs", IntersectionsIDs, IntersectionsIDsFurnIntersectArea, IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaContainWall, IntersectionsIDsFurnIntersectWall, IntersectionsIDsFurnContainWall)
            //console.log("dunkelgrün2, IntersectionsIDsAreaContainFurn", IntersectionsIDsAreaContainFurn)
            
           
            canvas.onpointerup = (event) => createTreeMenu(ifcProject, "tree-root2")
            }
        }

    }

        // const areaReturn = fireCollisionDetection(areas,allSubsetMeshes,boundingCubes)
        // //fireCollisionDetection(allSubsetMeshes,allids,subsetBoundingBoxes)
        // if(areaReturn !== undefined){
        //     const indexArea = areas.indexOf(areaReturn)
        //     ////console.log("ar", indexArea, areaReturn.position, areas)
        // }

    

    
    }else {
        gumball.removeEventListener('change' , animate);
        scene.remove(gumball)
    }
    if(downloadmodeIsActive === true){
     
     
        //console.log("downloadmode active", downloadmodeIsActive)
        for(let i =0 ; i < allSubsetMeshes.length; i++){
            // const geom = new Box3(new Vector3(), new Vector3());
            // geom.setFromObject(allSubsetMeshes[i])
            // geom.copy(allSubsetMeshes[i].geometry.boundingBox).applyMatrix4(allSubsetMeshes[i].matrixWorld)
            // const center2 = new Vector3(0,0,0)
            // const modiefiedReferenz2 =  allSubsetMeshes[i].geometry.boundingBox.getCenter(center2) 
        
      

            //console.log("3", allSubsetMeshes[i].position, allSubsetMeshes[i].uuid,modiefiedReferenz2)
        
        }
    }



    controls.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

    // renderer.setAnimationLoop( function(){
    //     renderer.render(scene, camera);
    // });
    requestAnimationFrame(animate);
};


// Transform Controls
gumball = new TransformControls(camera, renderer.domElement);
gumball.addEventListener('change' , animate);
gumball.addEventListener('dragging-changed', function (event) {
    controls.enabled =! event.value;

});
gumball.setSize(0.5);
gumball.showY = ! gumball.showY;
gumball.showZ =  gumball.showZ;
gumball.showX =  gumball.showX;

//////////////////////////////////////////////////
//GUI for Clippingplane

renderer.localClippingEnabled = true;


// const gui = new GUI();

// gui.add( params, 'clipIntersection' ).name( 'clip intersection' ).onChange( function ( value ) {

//     const children = group.children;

//     for ( let i = 0; i < children.length; i ++ ) {

//         children[ i ].material.clipIntersection = value;

//     }

//     renderer.render(scene, camera);

// } );

// gui.add( params, 'planeConstant', - 10, 10 ).step( 0.01 ).name( 'plane constant' ).onChange( function ( value ) {

//     for ( let j = 0; j < clipPlanes.length; j ++ ) {

//         clipPlanes[ j ].constant = value;

//     }

//     renderer.render(scene, camera);

// } );
//////////////////////////////////////////////////////
//Adjust the viewport to the size of the browser
window.addEventListener("resize", () => {
    (size.width = window.innerWidth), (size.height = window.innerHeight);
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
    labelRenderer.setSize(size.width, size.height);

});


const raycaster = new Raycaster();
raycaster.firstHitOnly = true;
const mouse = new Vector2();

function castObjects(event, ifcModels) {
    const bounds = canvas.getBoundingClientRect();

    const x1 = event.clientX -bounds.left;
    const x2 = bounds.right -bounds.left;
    mouse.x = (x1/ x2) * 2-1;

    const y1 = event.clientY  - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = - (y1 / y2) * 2 +1;

    raycaster.setFromCamera(mouse, camera);

    const intersection = raycaster.intersectObjects(ifcModels);

    // if(intersection.length > 0){
    //     SELECTED = intersection[0].object;

    //     for (var i = 0; i < ifcModels.length; i++){
    //         if(SELECTED.position.x == ifcModels[i].position.x){
    //             thisObject = i;
    //             //console.log(thisObject)
    //         }
    //     }
    // }
    return intersection
}
function castObjectsAndEnableGumball(event, ifcModel) {
    const bounds = canvas.getBoundingClientRect();

    const x1 = event.clientX -bounds.left;
    const x2 = bounds.right -bounds.left;
    mouse.x = (x1/ x2) * 2-1;

    const y1 = event.clientY  - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = - (y1 / y2) * 2 +1;

    raycaster.setFromCamera(mouse, camera);

    const intersection = raycaster.intersectObjects(ifcModel);
    const hasCollided = intersection.length !== 0 ; // Wenn der Raycaster mit Objekt intersected, ist das Array gefüllt

        enableGumball(intersection, gumball)

        if(!hasCollided) {
            // if there are no intersections
            restorePreviousSelection()
            return;
        }
        const firstFoundItem = intersection[0];

        if(isPreviousSelection(firstFoundItem)) {
            return;
        }

        restorePreviousSelection()
        saveNewSelection(firstFoundItem)


    };




function castObject(event, geom) {
    const bounds = canvas.getBoundingClientRect();

    const x1 = event.clientX -bounds.left;
    const x2 = bounds.right -bounds.left;
    mouse.x = (x1/ x2) * 2-1;

    const y1 = event.clientY  - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = - (y1 / y2) * 2 +1;

    raycaster.setFromCamera(mouse, camera);

    const intersection = raycaster.intersectObject(geom);
    return intersection
}

const hightlightMaterial = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: 0xFFCC99,
    depthTest: false
});

const hightlightMaterialSecond = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: orangeColor,
    depthTest: false
});

const selectionMaterial = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: 0xFF4500,
    depthTest: false

});


const selectionMaterialFurniture = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: 'red',
    depthTest: false

});

const hidedObjectMaterial = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: 'grey',
    depthTest: false

});


const slabMaterial = new MeshBasicMaterial({color: 0xe8e6d5, transparent: false,  opacity: 1.0, depthTest: false})
// Draw Bounds

const intersectionPoints = [];
const allLines = [];
let spheres = [];

let spherePositions = [];

const sphereOutlinePointsWall = [];
const wallMeshes = [];
const wallOutlines = [];
const sphereCopies = [];
const movedSpheres = []
const directionCollectionX = []
const directionCollectionZ = []

const OutercrvList = [];
const coordsList = [];
const labelObjects = [];

const categories = {
    IFCWALLSTANDARDCASE ,
    IFCSLAB,
    //IFCFURNISHINGELEMENT,
    IFCDOOR,
    IFCWINDOW,
    IFCPLATE,
    IFCMEMBER,
    // IFCSANITARYTERMINAL
};

let lastSphere;
let lastSpherePosition;
let lastSphereOutlinePoints;
let lastWallMesh;
let lastOutline;
let lastSphereCopy;
let lastMovedSphere;
let lastLabelMeasure;

var xValue

const sphereGeometry = new SphereGeometry(0.1);
const sphereMaterial = new MeshBasicMaterial({color: "lightgray"});
const sphereMaterialCopy = new MeshBasicMaterial({color: "lightblue", transparent: true, opacity: 0.0 });
const sphereMaterialCopyEdge = new MeshBasicMaterial({color: "blue", transparent: true, opacity: 0.0});
const black = new MeshBasicMaterial({color: 'black', depthTest: true});
const blackOutSanis = new MeshBasicMaterial({color: 'black', depthTest: false,transparent: true, opacity: 0.3});
const wallmaterial = new MeshBasicMaterial({color: 'grey'});
const sanitarymaterial = new MeshBasicMaterial({color: 'lightgrey'});

const areaFurnitureMaterial = new MeshBasicMaterial({color: orangeColor, transparent: true, opacity: 0.5});

const firstSphereGeometry = new SphereGeometry(0.2);
const firstSphere = new Mesh(firstSphereGeometry, sphereMaterial)

const wallDepth = 0.2;
const heigthStorey = 3.0;




function undoAndRedo(event){
    if(isCtrlDown){
        spheres = [...new Set(spheres)]
        //console.log("spheresClean", spheres)

        spherePositions = [...new Set(spherePositions)]
        ////console.log("spheresPosClean", spherePositions)

        if(isZDown){
            //console.log("undo")

            lastSphere = spheres.pop()
            scene.remove(lastSphere)

            lastSpherePosition = spherePositions.pop()

            lastSphereOutlinePoints = sphereOutlinePointsWall.pop()

            lastWallMesh = wallMeshes.pop()
            scene.remove(lastWallMesh)

            lastOutline = wallOutlines.pop()
            scene.remove(lastOutline)

            lastSphereCopy = sphereCopies.pop()
            scene.remove(lastSphereCopy)

            lastMovedSphere = movedSpheres.pop()
            scene.remove(lastMovedSphere)

            lastLabelMeasure = labelObjects.pop()
            scene.remove(lastLabelMeasure)
        }

        if(isYDown && isCtrlDown){

            //console.log("redo")

            // spheres = [...new Set(spheres)]
            // //console.log("spheresClean", spheres)
            spheres.push(lastSphere)
            scene.add(lastSphere)

            spherePositions.push(lastSpherePosition)

            sphereOutlinePointsWall.push(lastSphereOutlinePoints)

            wallMeshes.push(lastWallMesh)
            scene.add(lastWallMesh)

            wallOutlines.push(lastOutline)
            scene.add(lastOutline)

            sphereCopies.push(lastSphereCopy)
            scene.add(lastSphereCopy)

            movedSpheres.push(lastMovedSphere)
            scene.add(lastMovedSphere)

            labelObjects.push(lastLabelMeasure)
            scene.add(lastLabelMeasure)

        }

    }

}



function onPointerMove(event){
        const pickLast = [];

        const planeMaterial = new MeshBasicMaterial({color: "green"})
        const intersectionPlane = new BoxGeometry(30,0, 20);
        const plane = new Mesh(intersectionPlane, planeMaterial)

        const bounds = canvas.getBoundingClientRect();

        const x1 = event.clientX -bounds.left;
        const x2 = bounds.right -bounds.left;
        mouse.x = (x1/ x2) * 2-1;

        const y1 = event.clientY  - bounds.top;
        const y2 = bounds.bottom - bounds.top;
        mouse.y = - (y1 / y2) * 2 +1;

        raycaster.setFromCamera(mouse, camera);

        const intersection = raycaster.intersectObject(plane);

        const mousePos = intersection[0].point

        const firstPoint = spherePositions[spherePositions.length - 1]
        const secondPoint = mousePos
        labelMeasure(secondPoint, firstPoint)

        if(labelObjects.length > 0){
            const ls = labelObjects.pop()
            ls.visible = false
            scene.add(labelObjects[labelObjects.length - 1]);
            // labelObjects.removeFromParent()
            // labelObjects.element = 0

        }


        // const measureLineMat = new LineBasicMaterial({color: "black", linewidth: 2})
        // const lineGeom = new BufferGeometry().setFromPoints([firstPoint,secondPoint])
        // const measureLine = new Line(lineGeom, measureLineMat)
        // scene.add(measureLine)


    if(isShiftDown){
        if (intersection.length > 0) {
            const intersect = intersection[0];
            ////console.log("intersects onPointerMove: ", intersect.point)
            intersectionPoints.push(intersect.point)


            const lastEntry = spherePositions[spherePositions.length -1]
            const secEntry = spherePositions[spherePositions.length -2]
            const lastPointerPosition = intersectionPoints[intersectionPoints.length - 1]

            const linePoints = [];
            linePoints.push(secEntry, lastEntry)

            const measureLineMat = new LineBasicMaterial({color: "black", linewidth: 2})
            const lineGeom = new BufferGeometry().setFromPoints(linePoints)
            const measureLine = new Line(lineGeom, measureLineMat)
            allLines.push(measureLine)
            scene.add(measureLine)

        }
    }

}

function onPointerDown(event){

    const planeMaterial = new MeshBasicMaterial({color: "green"})
    const intersectionPlane = new BoxGeometry(30,0, 20);
    const plane = new Mesh(intersectionPlane, planeMaterial)

    const bounds = canvas.getBoundingClientRect();

    const x1 = event.clientX -bounds.left;
    const x2 = bounds.right -bounds.left;
    mouse.x = (x1/ x2) * 2-1;

    const y1 = event.clientY  - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = - (y1 / y2) * 2 +1;

    raycaster.setFromCamera(mouse, camera);

    const intersection = raycaster.intersectObject(plane);

    if (intersection.length > 0) {
        const intersect = intersection[0];

        if(isADown){
            if(spherePositions.length === 0 ) {

                firstSphere.position.set(intersect.point.x,intersect.point.y,intersect.point.z )
                scene.add(firstSphere)
                spherePositions.push(firstSphere.position)
                spheres.push(firstSphere)
                //console.log("sphere Positions", spherePositions)

                const measure = allLines[allLines.length - 1]
                scene.add(measure)

                const xValFistPoint = spherePositions[spherePositions.length - 1].x
                const sphereCopy = new Mesh(sphereGeometry, sphereMaterialCopy)
                sphereCopy.position.set(xValFistPoint - wallDepth ,intersect.point.y,intersect.point.z )
                //scene.add(sphereCopy)



                //Creates grids and axes in the scene
                const gridLocal = new GridHelper(5,5);
                scene.add(gridLocal)

                const axesLocal = new AxesHelper();
                axesLocal.material.depthTest = false;
                axesLocal.renderOrder = 1;
                scene.add(axesLocal)

                gridLocal.position.set(spherePositions[0].x, 0, spherePositions[0].z)
                scene.add(gridLocal);

                axesLocal.position.set(spherePositions[0].x, 0, spherePositions[0].z)
                scene.add(axesLocal);



            }
        }
        if(!isADown)

            if( spherePositions.length >= 1){

                const xValFistPoint = spherePositions[spherePositions.length - 1].x
                const zValFistPoint = spherePositions[spherePositions.length - 1].z


                const sphere = new Mesh(sphereGeometry, sphereMaterial)
                const sphereCopy = new Mesh(sphereGeometry, sphereMaterialCopy)
                const movedSphere = new Mesh(sphereGeometry, sphereMaterialCopyEdge)

                scene.add(sphere)
                scene.add(sphereCopy)

                spherePositions.push(sphere.position)
                spheres.push(sphere)

                isShiftDownWall(sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect);
                isNotShiftDownWall(sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect);
                document.addEventListener('dblclick', onPointerOver(event, sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect));
            }
    }


        const firstPoint = spherePositions[spherePositions.length - 1]
        const secondPoint = spherePositions[spherePositions.length - 3]
        labelMeasure(secondPoint, firstPoint)


        const measureLineMat = new LineBasicMaterial({color: "white", linewidth: 2})
        const lineGeom = new BufferGeometry().setFromPoints([firstPoint,secondPoint])
        const measureLine = new Line(lineGeom, measureLineMat)
        scene.add(measureLine)
        // if( spherePositions.length === 1){
        //     //console.log("dfghj", spherePositions)
        //     const firstPoint = spherePositions[0]
        //     const secondPoint = spherePositions[1]
        //     labelMeasure(secondPoint, firstPoint)

        //     const measureLineMat = new LineBasicMaterial({color: "black", linewidth: 2})
        //     const lineGeom = new BufferGeometry().setFromPoints([firstPoint,secondPoint])
        //     const measureLine = new Line(lineGeom, measureLineMat)
        //     scene.add(measureLine)

        // } else if ( !spherePositions.length === 1) {

        // }

}

async function onPointerOver(event, sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect) {

    const bounds = canvas.getBoundingClientRect();

    const x1 = event.clientX -bounds.left;
    const x2 = bounds.right -bounds.left;
    mouse.x = (x1/ x2) * 2-1;

    const y1 = event.clientY  - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = - (y1 / y2) * 2 +1;

    raycaster.setFromCamera(mouse, camera);

    const intersectionSphere = raycaster.intersectObject(firstSphere);

        if (intersectionSphere.length > 0) {
            const intersectSphere = intersectionSphere[0];
            ////console.log("intersects onPointerMove: ", intersectSphere.object.material.color.r)

            intersectSphere.object.material.color.r = 2.0

            const startPosition = spherePositions[0]
            const firstPosition = spherePositions[1]

            const sphereCopyGen = new Mesh(sphereGeometry, sphereMaterialCopy)
            const movedSphereGen = new Mesh(sphereGeometry, sphereMaterialCopyEdge)

            const lastPosition = spherePositions.pop()

            // spherePositions.push(startPosition)
            // //console.log("start and end ", startPosition, lastPosition)

            //console.log("wallmeshes", wallMeshes)

            if(isXDown && isShiftDown ){
                //console.log("XXXXX", spherePositions)
                const directionValue  = spherePositions[spherePositions.length -2].z - spherePositions[spherePositions.length -4].z
                //console.log('directionZZ', directionValue)

                // verschiebe den letzen Sphere auf die selbe Gerade mit der ersten Sphere
                //lastPosition.z = startPosition.z
                //console.log("directionCollectionX.length ",directionCollectionX.length)
                //console.log("directionCollectionZ.length ",directionCollectionZ.length)
                //remove the geometry of the last drawn wall.
                const beforwallmesh = wallMeshes.pop()
                const lastwallmesh = wallMeshes.pop()
                scene.remove(beforwallmesh)
                scene.remove(lastwallmesh)

                const beforwallLine = wallOutlines.pop()
                const lastwallLine = wallOutlines.pop()
                scene.remove(beforwallLine)
                scene.remove(lastwallLine)

                if(directionValue > 0) {
                    ////console.log(lastPosition.z, startPosition.z )

                    lastLabelMeasure = labelObjects.pop()
                    scene.remove(lastLabelMeasure)

                    lastPosition.z = startPosition.z
                    //console.log("lastPosition", lastPosition.z)
                    //console.log("OutlineListSp",sphereOutlinePointsWall)

                    //remove old lightblue sphereCopy and add a new one in the right position
                    const lastSphereCopy = sphereOutlinePointsWall[sphereOutlinePointsWall.length -1]
                    lastSphereCopy[1].z =  lastPosition.z
                    scene.remove(sphereCopies[sphereCopies.length -2])

                    sphereOutlinePointsWall.pop()
                    // sphereCopy and sphere new wall
                    sphere.position.set(xValFistPoint,intersect.point.y,lastPosition.z )
                    sphereCopy.position.set(xValFistPoint ,intersect.point.y,lastPosition.z + wallDepth)
                    sphereCopies.push(sphereCopy)

                    scene.add(sphere)
                    scene.add(sphereCopy)

                    // // sphereCopy last wall with a new position
                    // sphereCopy.position.set(spherePositions[spherePositions.length - 2].x +wallDepth ,intersect.point.y,lastPosition.z )
                    // scene.add(sphereCopy)

                    // remove last drawn spherePositions
                    spherePositions.pop()
                    spherePositions.pop()
                    spherePositions.pop()

                    spherePositions.push(sphere.position)
                    spheres.push(sphere)

                    movedSphere.position.set(startPosition.x  ,startPosition.y , startPosition.z + wallDepth   )
                    scene.add(movedSphere)
                    movedSpheres.push(movedSphere)

                    labelMeasure(sphere.position, movedSphere.position)
                    scene.add(labelObjects[labelObjects.length - 1])

                    sphereOutlinePointsWall.pop();
                    sphereOutlinePointsWall.push([sphere.position, sphereCopy.position, movedSphere.position, startPosition, sphere.position])



                    const wallShape = new Shape();
                    const wallLength = startPosition.distanceTo(lastPosition)

                    // zeichnet im Bildschrim
                    wallShape.moveTo(0,0);
                    wallShape.lineTo(0,heigthStorey);
                    wallShape.lineTo(wallDepth,heigthStorey);
                    wallShape.lineTo(wallDepth,0);
                    wallShape.lineTo(0,0);

                    const extrudeSettings = {

                        depth: wallLength + wallDepth, //length wall
                        bevelEnable: true,
                        bevelSegments: 1,
                        steps: 1,
                        bevelSize: 0,
                        bevelThickness: 0
                    }


                    const wallGeom = new ExtrudeGeometry(wallShape, extrudeSettings);
                    const wallMesh = new Mesh(wallGeom, wallmaterial);

                    const edges = new EdgesGeometry(wallGeom);
                    const outlines = new LineSegments(edges, black)

                    wallMesh.rotation.y = Math.PI/2;
                    outlines.rotation.y = Math.PI/2;

                    wallMesh.position.set(startPosition.x - wallDepth  , 0, startPosition.z +wallDepth )
                    outlines.position.set(startPosition.x - wallDepth, 0, startPosition.z  +wallDepth )

                    scene.add(wallMesh)
                    scene.add(outlines)

                    wallMeshes.push(wallMesh)
                    wallOutlines.push(outlines)

                    ///////////////////////////////////////////////////////
                    // last drawn wall

                    sphereCopyGen.position.set(spherePositions[spherePositions.length - 2].x +wallDepth ,intersect.point.y,lastPosition.z )
                    scene.add(sphereCopyGen)


                    //remove last drawn spherePositions
                    //spherePositions.pop()
                    //spherePositions.pop()
                    //spherePositions.pop()

                    scene.remove(spheres[spheres.length - 5])
                    // spherePositions.push(sphere.position)
                    // spheres.push(sphere)


                    movedSphereGen.position.set(spherePositions[spherePositions.length -2].x + wallDepth, spherePositions[spherePositions.length -2].y, spherePositions[spherePositions.length -2].z   )
                    scene.add(movedSphereGen)
                    // movedSpheres.push(movedSphereGen)

                    labelMeasure(sphereCopyGen.position, movedSphereGen.position)
                    scene.add(labelObjects[labelObjects.length - 1])


                    const HelperPoint = new Vector3(spherePositions[spherePositions.length -2].x, spherePositions[spherePositions.length -2].y, spherePositions[spherePositions.length -2].z )

                    sphereOutlinePointsWall.push([sphere.position, sphereCopyGen.position, movedSphereGen.position, HelperPoint, sphere.position])

                    //console.log("spheres", spheres)
                    //console.log("spherePositions", spherePositions)


                    const wallShapeOld = new Shape();
                    const wallLengthOld = spherePositions[spherePositions.length - 2].distanceTo(sphereCopyGen.position) + wallDepth


                    // zeichnet im Bildschrim
                    wallShapeOld.moveTo(0,0);
                    wallShapeOld.lineTo(0,heigthStorey);
                    wallShapeOld.lineTo(wallDepth,heigthStorey);
                    wallShapeOld.lineTo(wallDepth,0);
                    wallShapeOld.lineTo(0,0);

                    const extrudeSettingsOld = {

                        depth: wallLengthOld + wallDepth, //length wall
                        bevelEnable: true,
                        bevelSegments: 1,
                        steps: 1,
                        bevelSize: 0,
                        bevelThickness: 0
                    }

                    const wallGeomOld = new ExtrudeGeometry(wallShapeOld, extrudeSettingsOld);
                    const wallMeshOld = new Mesh(wallGeomOld, wallmaterial);

                    const edgesOld = new EdgesGeometry(wallGeomOld);
                    const outlinesOld = new LineSegments(edgesOld, black)

                    wallMeshOld.position.set(spherePositions[spherePositions.length - 2].x , 0, spherePositions[spherePositions.length - 2].z - wallDepth  )
                    outlinesOld.position.set(spherePositions[spherePositions.length - 2].x, 0, spherePositions[spherePositions.length - 2].z - wallDepth )

                    scene.add(wallMeshOld)
                    scene.add(outlinesOld)

                    wallMeshes.push(wallMeshOld)
                    wallOutlines.push(outlinesOld)

                    scene.remove(spheres[spheres.length - 4])

                    // sphereOutlinePointsWall.push([sphere.position, sphereCopy.position, movedSphere.position, startPosition, sphere.position])

                } else {
                    //console.log("Otherwise")

                    lastLabelMeasure = labelObjects.shift()
                    scene.remove(lastLabelMeasure)

                    ////console.log(lastPosition.z, startPosition.z )
                    scene.remove(wallMeshes[0])
                    scene.remove(wallOutlines[0])

                    lastPosition.x = firstPosition.x
                    //console.log("lastPosition", lastPosition.x)
                    //console.log("OutlineListSp",sphereOutlinePointsWall)

                    // Generating new spheres for the wall, which is not drawn.
                    //remove old lightblue sphereCopy and add a new one in the right position
                    const lastSphereCopy = sphereOutlinePointsWall[sphereOutlinePointsWall.length -1]
                    lastSphereCopy[1].x =  lastPosition.x
                    scene.remove(sphereCopies[sphereCopies.length -2])

                    // sphereCopy and sphere new wall
                    sphere.position.set(lastPosition.x,intersect.point.y,zValFistPoint  )
                    sphereCopy.position.set(lastPosition.x - wallDepth,intersect.point.y,zValFistPoint)

                    scene.add(sphere)
                    scene.add(sphereCopy)

                    movedSphere.position.set(firstPosition.x - wallDepth   ,firstPosition.y , firstPosition.z   )
                    scene.add(movedSphere)
                    //movedSpheres.push(movedSphere)

                    sphereOutlinePointsWall.shift();
                    //sphereOutlinePointsWall.shift();
                    //sphereOutlinePointsWall.pop();
                    sphereOutlinePointsWall.splice(3,1)
                    sphereOutlinePointsWall.pop()
                    sphereOutlinePointsWall.unshift([sphere.position, sphereCopy.position, movedSphere.position, firstPosition, sphere.position])

                    labelMeasure(sphereCopy.position, movedSphere.position)
                    scene.add(labelObjects[labelObjects.length - 1])

                    const wallShape = new Shape();
                    const wallLength = firstPosition.distanceTo(lastPosition) + wallDepth

                    // zeichnet im Bildschrim
                    wallShape.moveTo(0,0);
                    wallShape.lineTo(0,heigthStorey);
                    wallShape.lineTo(wallDepth,heigthStorey);
                    wallShape.lineTo(wallDepth,0);
                    wallShape.lineTo(0,0);

                    const extrudeSettings = {

                        depth: wallLength, //length wall
                        bevelEnable: true,
                        bevelSegments: 1,
                        steps: 1,
                        bevelSize: 0,
                        bevelThickness: 0
                    }


                    const wallGeom = new ExtrudeGeometry(wallShape, extrudeSettings);
                    const wallMesh = new Mesh(wallGeom, wallmaterial);

                    const edges = new EdgesGeometry(wallGeom);
                    const outlines = new LineSegments(edges, black)

                    wallMesh.rotation.y = 0
                    outlines.rotation.y = 0

                    wallMesh.position.set(firstPosition.x  - wallDepth , 0, firstPosition.z )
                    outlines.position.set(firstPosition.x  - wallDepth, 0, firstPosition.z  )

                    scene.add(wallMesh)
                    scene.add(outlines)

                    wallMeshes.push(wallMesh)
                    wallOutlines.push(outlines)

                    // ///////////////////////////////////////////////////////
                        //////////////////////////
                    //move the existing spheres from the last drawn wall around

                    // sphereCopy last wall with a new position
                    //sphereCopyGen = sphereCopy
                    sphereCopyGen.position.set(lastPosition.x  ,intersect.point.y, spherePositions[spherePositions.length - 2].z + wallDepth )
                    scene.add(sphereCopyGen)

                    // remove last drawn spherePositions
                    spherePositions.pop()
                    spherePositions.pop()
                    spherePositions.pop()

                    scene.remove(spheres[spheres.length - 3])
                    spherePositions.push(sphere.position)
                    spheres.push(sphere)

                    movedSphereGen.position.set(spherePositions[spherePositions.length -2].x, spherePositions[spherePositions.length -2].y, spherePositions[spherePositions.length -2].z + wallDepth  )
                    scene.add(movedSphereGen)

                    const HelperPoint = new Vector3 (spherePositions[spherePositions.length -2].x, spherePositions[spherePositions.length -2].y, spherePositions[spherePositions.length -2].z )

                    sphereOutlinePointsWall.unshift([sphere.position, sphereCopyGen.position, movedSphereGen.position, HelperPoint, sphere.position])

                    //console.log("spheres", spheres)
                    //console.log("spherePositions", spherePositions)

                    scene.remove(labelObjects[labelObjects.length - 2])
                    labelMeasure(sphereCopyGen.position, movedSphereGen.position)
                    scene.add(labelObjects[labelObjects.length - 1])

                    // last drawn wall
                    const wallShapeOld = new Shape();
                    const wallLengthOld = movedSphereGen.position.distanceTo(sphereCopy.position)
                    //movedSpheres.push(movedSphereGen)


                    // zeichnet im Bildschrim
                    wallShapeOld.moveTo(0,0);
                    wallShapeOld.lineTo(0,heigthStorey);
                    wallShapeOld.lineTo(wallDepth,heigthStorey);
                    wallShapeOld.lineTo(wallDepth,0);
                    wallShapeOld.lineTo(0,0);

                    const extrudeSettingsOld = {

                        depth: wallLengthOld, //length wall
                        bevelEnable: true,
                        bevelSegments: 1,
                        steps: 1,
                        bevelSize: 0,
                        bevelThickness: 0
                    }

                    const wallGeomOld = new ExtrudeGeometry(wallShapeOld, extrudeSettingsOld);
                    const wallMeshOld = new Mesh(wallGeomOld, wallmaterial);

                    const edgesOld = new EdgesGeometry(wallGeomOld);
                    const outlinesOld = new LineSegments(edgesOld, black)

                    wallMeshOld.rotation.y = 3* Math.PI/2;
                    outlinesOld.rotation.y = 3* Math.PI/2;

                    wallMeshOld.position.set(spherePositions[spherePositions.length - 2].x + wallDepth , 0, spherePositions[spherePositions.length - 2].z   )
                    outlinesOld.position.set(spherePositions[spherePositions.length - 2].x + wallDepth, 0, spherePositions[spherePositions.length - 2].z  )

                    scene.add(wallMeshOld)
                    scene.add(outlinesOld)

                    wallMeshes.push(wallMeshOld)
                    wallOutlines.push(outlinesOld)

                    // scene.remove(spheres[spheres.length - 4])

                }
                document.removeEventListener( 'pointermove', onPointerMove );
                document.removeEventListener( 'dblclick', onPointerDown );
                document.removeEventListener( 'keydown', undoAndRedo );
                document.removeEventListener( 'keydown', onDocumentKeyDown );
                document.removeEventListener( 'keyup', onDocumentKeyUp );
        }


            const measureLineMat = new LineBasicMaterial({color: "black", linewidth: 2})
            const lineGeom = new BufferGeometry().setFromPoints([lastPosition,startPosition])
            const measureLine = new Line(lineGeom, measureLineMat)

            scene.add(measureLine)
            labelMeasure(startPosition, lastPosition)

            await editWallsFromFile()

        }

}

function isShiftDownWall(sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect){

    if(isShiftDown){

        sphere.position.set(xValFistPoint,intersect.point.y,intersect.point.z )
        sphereCopy.position.set(xValFistPoint - wallDepth ,intersect.point.y,intersect.point.z )

        scene.add(sphere)
        scene.add(sphereCopy)
        // //console.log('normalize', sphere.position, sphere.position.normalize())
        spherePositions.push(sphere.position)
        spheres.push(sphere)

        const directionValue = spherePositions[spherePositions.length -1].z - spherePositions[spherePositions.length -3].z
        //console.log('direction', directionValue)
        directionCollectionZ.push(directionValue)

        if (directionValue > 0 ) {
            // wenn direction positiv ist, zeigt die Line nach unten

            if (directionCollectionX[directionCollectionX.length -1] > 0) {
                // letzte Wand x-Achse schaut nach rechts
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint + wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x + wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z - wallDepth )
                const rotationAngle = 0;

                const NewHelperPos = new Vector3(sphereHelperPos.x , sphereHelperPos.y, sphereHelperPos.z- wallDepth )

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)

            }
            if (directionCollectionX[directionCollectionX.length -1] < 0) {
                // letzte Wand x-Achse schaut nach links
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint + wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x + wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z - wallDepth)
                const rotationAngle = 0;

                drawWall(sphereCopy, sphere, movedSphere, sphereHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)

            }
            if (directionCollectionX[directionCollectionX.length -1] === undefined) {
                // letzte Wand x-Achse schaut nach links
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint + wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x + wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z - wallDepth)
                const rotationAngle = 0;

                drawWall(sphereCopy, sphere, movedSphere, sphereHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)

            }



        }else{
            // ist sie negativ, zeigt sie nach oben.
            if (directionCollectionX[directionCollectionX.length -1] > 0) {

                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint - wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x - wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z)
                const rotationAngle = Math.PI;
                const NewHelperPos = new Vector3(spheres[spheres.length - 3].position.x , spheres[spheres.length - 3].position.y, spheres[spheres.length - 3].position.z - wallDepth)

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)
            }
            if (directionCollectionX[directionCollectionX.length -1] < 0) {

                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint - wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x - wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z + wallDepth )
                const rotationAngle = Math.PI;
                const NewHelperPos = new Vector3(sphereHelperPos.x, sphereHelperPos.y, sphereHelperPos.z + wallDepth)

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)
            }
            if (directionCollectionX[directionCollectionX.length -1] === undefined) {

                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(xValFistPoint - wallDepth ,intersect.point.y,intersect.point.z  )
                const movedSpherePosition = new Vector3(sphereHelperPos.x - wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z)
                const rotationAngle = Math.PI;


                drawWall(sphereCopy, sphere, movedSphere, sphereHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)
            }
        }
    }

}

function isNotShiftDownWall(sphere, sphereCopy, movedSphere, spheres, spherePositions, xValFistPoint, zValFistPoint, intersect){

    if (!isShiftDown){
        sphere.position.set(intersect.point.x,intersect.point.y,zValFistPoint )
        sphereCopy.position.set(intersect.point.x ,intersect.point.y,zValFistPoint - wallDepth)

        scene.add(sphere)
        scene.add(sphereCopy)

        spherePositions.push(sphere.position)
        spheres.push(sphere)

        const directionValue = spherePositions[spherePositions.length -1].x - spherePositions[spherePositions.length -3].x
        //console.log('directionX', directionValue)
        directionCollectionX.push(directionValue)

        if (directionValue > 0 ) {
            // wenn direction positiv ist, zeigt die Line nach rechts
            if (directionCollectionZ[directionCollectionZ.length -1] < 0) {
                // letzte Wand z-Achse schaut nach oben
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(intersect.point.x ,intersect.point.y,zValFistPoint - wallDepth)
                const movedSpherePosition = new Vector3(sphereHelperPos.x - wallDepth ,sphereHelperPos.y ,sphereHelperPos.z - wallDepth)
                const rotationAngle = Math.PI/2;
                const NewHelperPos = new Vector3(sphereHelperPos.x - wallDepth, sphereHelperPos.y, sphereHelperPos.z )

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)

            }

            if (directionCollectionZ[directionCollectionZ.length -1] > 0) {
                // letzte Wand z-Achse schaut nach oben
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(intersect.point.x ,intersect.point.y,zValFistPoint - wallDepth)
                const movedSpherePosition = new Vector3(sphereHelperPos.x  ,sphereHelperPos.y ,sphereHelperPos.z - wallDepth)
                const rotationAngle = Math.PI/2;
                const NewHelperPos = new Vector3(sphereHelperPos.x , sphereHelperPos.y, sphereHelperPos.z )

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)

            }


        } else {
            // wenn direction negativ ist, zeigt die Line nach links
            if (directionCollectionZ[directionCollectionZ.length -1] < 0) {
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(intersect.point.x ,intersect.point.y,zValFistPoint + wallDepth)
                const movedSpherePosition = new Vector3(sphereHelperPos.x  ,sphereHelperPos.y ,sphereHelperPos.z + wallDepth)
                const rotationAngle = 3*Math.PI/2;

                drawWall(sphereCopy, sphere, movedSphere, sphereHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)
            }

            if (directionCollectionZ[directionCollectionZ.length -1] > 0) {
                const sphereHelperPos = spheres[spheres.length - 3].position
                const sphereCopyPosition = new Vector3(intersect.point.x  ,intersect.point.y,zValFistPoint + wallDepth)
                const movedSpherePosition = new Vector3(sphereHelperPos.x + wallDepth  ,sphereHelperPos.y ,sphereHelperPos.z + wallDepth)
                const rotationAngle = 3*Math.PI/2;
                const NewHelperPos = new Vector3(sphereHelperPos.x + wallDepth, sphereHelperPos.y, sphereHelperPos.z)

                drawWall(sphereCopy, sphere, movedSphere, NewHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle)
            }

        }

    }

}


function onDocumentKeyDown(event) {
    switch(event.keyCode){
        case 16: isShiftDown = true;
        break;

        case 88: isXDown = true;
        break;

        case 65: isADown = true;
        break;

        case 17: isCtrlDown = true;
        break;

        case 90: isZDown = true;
        break;

        case 89: isYDown = true;
        break;



    }
}

function onDocumentKeyUp(event) {
    switch(event.keyCode){
        case 16: isShiftDown = false;
        break;

        case 88: isXDown = false;
        break;

        case 65: isADown = false;
        break;

        case 17: isCtrlDown = false;
        break;

        case 90: isZDown = false;
        break;

        case 89: isYDown = false;
        break;


    }

}
// Gumball
function enableGumball(items, tfcontrols) {
    if (items.length > 0 ) {
        const object = items[0].object;
        if (object != tfcontrols.object) {
            tfcontrols.attach(object);
            scene.add(tfcontrols)

        }
    }
};




const previousSelection = {
    mesh: null,
    material: null,
};




function isPreviousSelection(item) {
    return previousSelection.mesh === item.object;
}
function saveNewSelection(item) {
    ////console.log("found", item)
    previousSelection.mesh = item.object;
    previousSelection.material = item.object.material;
    positionToilet = item.object.position
    //toiletPositions.push(positionToilet)
    ////console.log(positionToilet)
}

function restorePreviousSelection() {
    if(previousSelection.mesh) {
        // if there is no collision, return the original color of the sphere
        previousSelection.mesh.material = previousSelection.material;
        //reset
        previousSelection.mesh = null;
        previousSelection.material = null;
    }
}




function labelMeasure(firstPt, secondPt){
    const distances = firstPt.distanceTo(secondPt)
    const distancePositive = Math.abs(distances)
    const message = distancePositive.toFixed(2)

    const middelPointsX = ( firstPt.x + secondPt.x) * 0.5;
    const middelPointsY = ( firstPt.y + secondPt.y) * 0.5;
    const middelPointsZ = ( firstPt.z + secondPt.z) * 0.5;

    const middelPoint = new Vector3(middelPointsX, middelPointsY, middelPointsZ)

    const labelBase = document.createElement('div');
    labelBase.className = 'label-container'

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'X';
    deleteButton.className = 'delete-button hidden';
    labelBase.appendChild(deleteButton)



    const label = document.createElement('p');
    label.classList.add('label-style');
    labelBase.appendChild(label);

    label.textContent = message;
    const labelObject = new CSS2DObject(labelBase);
    const textPosition = labelObject.position.copy(middelPoint) ;

    labelObjects.push(labelObject)

    // scene.add(labelObjects[1]);


    deleteButton.onclick = () => {
        labelObject.removeFromParent();
        labelObject.element = null;
        labelBase.remove();
    }

    labelBase.onmouseenter = () => {
        deleteButton.classList.remove('hidden')
    }
    labelBase.onmouseleave = () => {
        deleteButton.classList.add('hidden')
    }
}


function drawWall(sphereCopy, sphere, movedSphere, sphereHelperPos, sphereCopyPosition, movedSpherePosition, rotationAngle) {
    // ist sie negativ, zeigt sie nach links
    scene.remove(sphereCopy)
    sphereCopy.position.set(sphereCopyPosition.x,sphereCopyPosition.y, sphereCopyPosition.z );
    scene.add(sphereCopy)
    sphereCopies.push(sphereCopy)

    movedSphere.position.set( movedSpherePosition.x, movedSpherePosition.y, movedSpherePosition.z)
    scene.add(movedSphere)
    movedSpheres.push(movedSphere)

    sphereOutlinePointsWall.push([sphere.position, sphereCopy.position, movedSphere.position, sphereHelperPos, sphere.position])

    const wallShape = new Shape();
    const wallLength = sphere.position.distanceTo(movedSphere.position)

    // zeichnet im Bildschrim
    wallShape.moveTo(0,0);
    wallShape.lineTo(0,heigthStorey);
    wallShape.lineTo(wallDepth,heigthStorey);
    wallShape.lineTo(wallDepth,0);
    wallShape.lineTo(0,0);

    const extrudeSettings = {

        depth: wallLength, //length wall
        bevelEnable: true,
        bevelSegments: 1,
        steps: 1,
        bevelSize: 0,
        bevelThickness: 0
    }

    const wallGeom = new ExtrudeGeometry(wallShape, extrudeSettings);
    const wallMesh = new Mesh(wallGeom, wallmaterial)

    const edges = new EdgesGeometry(wallGeom);
    const outlines = new LineSegments(edges, black)

    wallMesh.rotation.y = rotationAngle;
    outlines.rotation.y = rotationAngle;

    wallMesh.position.set(sphereHelperPos.x , 0, sphereHelperPos.z )
    outlines.position.set(sphereHelperPos.x , 0, sphereHelperPos.z )

    wallMeshes.push(wallMesh)
    wallOutlines.push(outlines)

    scene.add(wallMesh)
    scene.add(outlines)

}


// -------------------------------------------------------
// EDITING IFC
// -------------------------------------------------------

async function editToiletPosition(){
    const sanitaryIDs =  await loader.ifcManager.getAllItemsOfType(0, IFCSANITARYTERMINAL, false);
    const firstObjectID = sanitaryIDs[0];
    //for (let ids = 0; ids < sanitaryIDs.length; ids++) {
        //console.log("sanitary Toilet", sanitaryIDs[0])
        var id = sanitaryIDs[0]

        const sanitaryObj = await loader.ifcManager.getItemProperties( 0, id);
        //console.log("sanitaryObj: ",sanitaryObj);

        const productDefShape = sanitaryObj.Representation.value
        const ProductDefShape =  await loader.ifcManager.getItemProperties(0, productDefShape );
        //console.log("Product Def Shape: ",ProductDefShape)

        const representationCurve = ProductDefShape.Representations
        //const RelPlace =  await loader.ifcManager.getItemProperties(0, relplacement );
        //console.log("Representations Curve2D",representationCurve[1])

        const curve = await loader.ifcManager.getItemProperties(0, representationCurve[1].value );
        // //console.log("Shape Repr",curve.Items[0].value)
        const curveItems = curve.Items[0].value
        const items = await loader.ifcManager.getItemProperties(0, curveItems);
        //console.log("Items", items)

        const itemPos = items.Position
        //console.log("itemPos", itemPos)
        const axis2Placement3D = await loader.ifcManager.getItemProperties(0, itemPos.value);
        //console.log("axis2Placement3D", axis2Placement3D);

        const location = axis2Placement3D.Location.value
        const localPos = await loader.ifcManager.getItemProperties(0, location);
        //console.log("location", localPos);

        const localPoint = localPos.Coordinates

        // diese Werte müssen mit three.js toilet.position übereinstimmen
        //console.log("coords X", localPoint[0].value)
        //console.log("coords Y", localPoint[1].value)
        //console.log("coords Z", localPoint[2].value)

        //const UserInput = prompt("geben sie den x Wert für die Toilette ein:");
        //const xVal = parseInt(UserInput);

        // const xVal = 4
        // generatingToilet(xVal)

        // localPos.Coordinates[0].value = xVal
        // localPos.Coordinates[1].value = 5
        // localPos.Coordinates[2].value = 0

        // await loader.ifcManager.ifcAPI.WriteLine(0, localPos);

}


async function editFurnishingElementsPosition(){
    const sanitaryIDs =  await loader.ifcManager.getAllItemsOfType(0, IFCFURNISHINGELEMENT, false);
    const firstObjectID = sanitaryIDs[0];
    //for (let ids = 0; ids < sanitaryIDs.length; ids++) {
        //console.log("sanitary Toilet", sanitaryIDs[0])
        var id = sanitaryIDs[0]

        const sanitaryObj = await loader.ifcManager.getItemProperties( 0, id);
        //console.log("sanitaryObj: ",sanitaryObj);

        const productDefShape = sanitaryObj.Representation.value
        const ProductDefShape =  await loader.ifcManager.getItemProperties(0, productDefShape );
        //console.log("Product Def Shape: ",ProductDefShape)

        const representationCurve = ProductDefShape.Representations
        //const RelPlace =  await loader.ifcManager.getItemProperties(0, relplacement );
        //console.log("Representations Curve2D",representationCurve[1])

        const curve = await loader.ifcManager.getItemProperties(0, representationCurve[1].value );
        // //console.log("Shape Repr",curve.Items[0].value)
        const curveItems = curve.Items[0].value
        const items = await loader.ifcManager.getItemProperties(0, curveItems);
        //console.log("Items", items)

        const itemPos = items.Position
        //console.log("itemPos", itemPos)
        const axis2Placement3D = await loader.ifcManager.getItemProperties(0, itemPos.value);
        //console.log("axis2Placement3D", axis2Placement3D);

        const location = axis2Placement3D.Location.value
        const localPos = await loader.ifcManager.getItemProperties(0, location);
        //console.log("location", localPos);

        const localPoint = localPos.Coordinates

        // diese Werte müssen mit three.js toilet.position übereinstimmen
        //console.log("coords X", localPoint[0].value)
        //console.log("coords Y", localPoint[1].value)
        //console.log("coords Z", localPoint[2].value)

        //const UserInput = prompt("geben sie den x Wert für die Toilette ein:");
        //const xVal = parseInt(UserInput);

        // const xVal = 4
        // generatingToilet(xVal)

        // localPos.Coordinates[0].value = xVal
        // localPos.Coordinates[1].value = 5
        // localPos.Coordinates[2].value = 0

        // await loader.ifcManager.ifcAPI.WriteLine(0, localPos);

}


async function editWallsFromFile(){
    const WallsIDs =  await loader.ifcManager.getAllItemsOfType(0, IFCWALLSTANDARDCASE, false);
    const firstWallID = WallsIDs[0];
    for (let ids = 0; ids < WallsIDs.length; ids++) {
        //console.log(WallsIDs[ids])
        var id = WallsIDs[ids]

        const wall = await loader.ifcManager.getItemProperties( 0, id);
        //console.log("wall: ",wall);

        const productDefShape = wall.Representation.value
        const ProductDefShape =  await loader.ifcManager.getItemProperties(0, productDefShape );
        //console.log("Product Def Shape: ",ProductDefShape)

        const representationCurve = ProductDefShape.Representations
        //const RelPlace =  await loader.ifcManager.getItemProperties(0, relplacement );
        //console.log("Representations Curve2D",representationCurve[0])

        const curve = await loader.ifcManager.getItemProperties(0, representationCurve[0].value );
        // //console.log("Shape Repr",curve.Items[0].value)
        const curveItems = curve.Items[0].value
        const items = await loader.ifcManager.getItemProperties(0, curveItems);
        ////console.log("Items", items)

        const representationSolid = ProductDefShape.Representations
        //const RelPlace =  await loader.ifcManager.getItemProperties(0, relplacement );
        //console.log("Representations solid",representationSolid[1])

        const solid = await loader.ifcManager.getItemProperties(0, representationSolid[1].value );
        // //console.log("Shape Repr",curve.Items[0].value)
        const SolidItems = solid.Items[0].value
        const Solids = await loader.ifcManager.getItemProperties(0, SolidItems);
        //console.log("Itemssolid", Solids)

        const areaSwept = Solids.SweptArea
        const sweptArea = await loader.ifcManager.getItemProperties(0, areaSwept.value);
        //console.log("sweptArea", sweptArea)

        const outerCrv = sweptArea.OuterCurve
        const Outercrv = await loader.ifcManager.getItemProperties(0, outerCrv.value);
        //console.log("OuterCrv", Outercrv.Points)

        // //console.log("spherpso ", spherePositions)
        //console.log("OuterPoints Spheres",sphereOutlinePointsWall)

        // Outline Curves von allen ifcWalls
        OutercrvList.push(Outercrv.Points)
        //console.log("outerList", OutercrvList)
    }
    await settingPoints(OutercrvList, 0)
    await settingPoints(OutercrvList, 1)
    await settingPoints(OutercrvList, 2)
    await settingPoints(OutercrvList, 3)
    await settingPoints(OutercrvList, 4)

    data = await loader.ifcManager.ifcAPI.ExportFileAsIFC(0);
    blob = new Blob([data]);
    const file = new File([blob], "./create.ifc");


    const downloadbutton = document.getElementById('download-button')
    const link = document.createElement('a');
    link.download = './create.ifc';
    link.href = URL.createObjectURL(file);


    downloadbutton.appendChild(link);

    const downloadFile = () => {
        //console.log("downloaded")
        link.click();
        link.remove();};
    downloadbutton.addEventListener('click', downloadFile);

}

async function settingPoints(OutercrvList, pointNumber){
    parseInt(pointNumber)
    for(let values = 0; values < OutercrvList.length; values++) {
        //console.log("forloop Outercurves", OutercrvList[values][pointNumber])

        // all zero Values
        const Polypoints = OutercrvList[values][pointNumber].value
        //console.log(Polypoints) // id
        const pts = await loader.ifcManager.getItemProperties(0, Polypoints);
        //console.log("pts", pts.Coordinates)

        pts.Coordinates[0].value = sphereOutlinePointsWall[values][pointNumber].x
        pts.Coordinates[1].value = sphereOutlinePointsWall[values][pointNumber].z

        await loader.ifcManager.ifcAPI.WriteLine(0, pts);
    }
}


// --------------------------------------------------------
// PICKING AND CHECKBOXES
//---------------------------------------------------------

//const outputID = document.getElementById('id-output');

async function pick(event, material, getProps,ifcModels ) {

    const found = castObjects(event, ifcModels)[0];
    if(found) {
    const index = found.faceIndex;
    ////console.log("index", index)
    lastModel = found.object;

    const geometry = found.object.geometry;
    ////console.log("geometry", geometry)

    // Id which collided with raycaster
    const ifc = loader.ifcManager;
    const id = ifc.getExpressId(geometry, index );


    ////console.log(id);

    if (getProps) {
      //await wallEdit(found, id);
      //console.log('props')
    }

    loader.ifcManager.createSubset({
        modelID: found.object.modelID,
        ids: [id],
        material: material,
        scene,
        removePrevious: true,
    });
    }
     else if(lastModel) {
        loader.ifcManager.removeSubset(lastModel.modelID, material);
        lastModel = undefined;
    }




};

function translateAreaIfCollision(specificFurnIDList, a, moveX, moveZ){
    //console.log("noSpecificFurnIDList", noSpecificFurnIDList)

    for(let id = 0; id < specificFurnIDList.length; id++) {
        //console.log("ID WC!!!!!", specificFurnIDList[a], lastIndex)
        if( IntersectionsIDsAreaIntersectArea.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsAreaContainArea.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnIntersectFurn.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnContainFurn.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDs.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnIntersectArea.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnContainArea.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsAreaIntersectWall.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsAreaContainWall.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnIntersectWall.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnContainWall.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsAreaContainFurn.includes(specificFurnIDList[a].value) === true ) {


            


                for (let i = 0; i < areas.length; i++){

                    if(areas[i].uuid === specificFurnIDList[a].value) {
                            indexWC = i
                            //console.log("ID is WC!!!!!", specificFurnIDList[a].value, areas[i], ReferenceDirections[i], lastPosition, indexWC)
                            
                        }

                    }
        }else {
            return
        }
    }

            lastPosition = areas[indexWC].position
            //console.log("Pos", lastPosition, ReferenceDirections[indexWC],  areas[indexWC])
            if(ReferenceDirections[indexWC].x === -1 ){
                areas[indexWC].position.set(lastPosition.x + moveX,lastPosition.y ,lastPosition.z )
                translationList.push(areas[indexWC].uuid)

                areas[indexWC].geometry.boundingBox
                // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                // scene.add(boxhelper)

            }
            if(ReferenceDirections[indexWC].x === 1){
                areas[indexWC].position.set(lastPosition.x + moveX,lastPosition.y ,lastPosition.z )
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)
                // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                // scene.add(boxhelper)

            }
            if(ReferenceDirections[indexWC].y === -1){
                areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ)
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)
               

            }
            if(ReferenceDirections[indexWC].y === 1){
                areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ)
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)
                
            }


}
//'./Animations/Rollstuhl_Kollision_WC_1_mirror.mp4'
//'./Animations/Rollstuhl_Kollision_WC_1.mp4'

function videoAfterTranslationWC(indexFurniture, indexFurniture2, sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4){
    for(let check = 0; check < translationList.length; check++){
        
   
           
    //     const src = sourceVideo4 ; // transform gif to mp4
    //     // video -y nicht gespiegelt
    //     return src
   

        if(foundMeshesCheckbox[indexFurniture]  === translationList[check] ){

            const src = sourceVideo1 ; // transform gif to mp4
            // video -y gespiegelt
            
            return src

           
        } else if (foundMeshesCheckbox[indexFurniture]  !== translationList[check] ) {
           
            const src = sourceVideo2 ; // transform gif to mp4
            // video -y nicht gespiegelt
            return src

            
        }
       
    }
}
const kitchenanimations = [`./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`, `./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`, `./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`,`./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`];
const showeranimations = [`./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`];
const tubeanimations = [`./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`];
const sinkanimations = [`./Animations/Rollstuhl_Kollision_Waschbecken.mp4`, `./Animations/Rollstuhl_Kollision_Waschbecken.mp4`, `./Animations/Rollstuhl_Kollision_Waschbecken.mp4`, `./Animations/Rollstuhl_Kollision_Waschbecken.mp4`];
const bedanimations = [`./Animations/Rollstuhl_Kollision_Bett_x_-1.mp4`, './Animations/Rollstuhl_Kollision_Bett_x_1.mp4', './Animations/Rollstuhl_Kollision_Bett_x_1.mp4', './Animations/Rollstuhl_Kollision_Bett_y_1.mp4'];
const wcanimations = [`./Animations/Rollstuhl_Kollision_WC_1.mp4`,`./Animations/Rollstuhl_Kollision_WC_1.mp4`,`./Animations/Rollstuhl_Kollision_WC_1.mp4`,`./Animations/Rollstuhl_Kollision_WC_1.mp4`];

const otheranimations = [`./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`];
const wallanimations = ['wallanimations']




const mesh = [];
let prepickedSubset = [];
const areaNewList = [];
const areaNewList2 = [];
const wallClashmaterial = new MeshBasicMaterial({color: wallCollisionColor, transparent: true,  opacity: 0.5, depthTest: true})
const wallCollisionName = ['Dusche Wand','Küche Wand', 'Badewanne Wand', 'Waschtisch Wand', 'Bett Wand', 'WC Wand']


async function prepickByID(event, material, secondMaterial,Expressid ) {
    loader.ifcManager.removeSubset(0, secondMaterial);
    loader.ifcManager.removeSubset(0, wallClashmaterial);
    for(let l = 0; l < labels.length; l++){
        //areas[id].add(labels[l])
        scene.remove(labels[l])
        
    }

    labels.length = 0
    prepickedSubset.length = 0
    
    //console.log(Expressid, collidedIDs, checkedListIntersectFurnAndArea)
    const searchID = Expressid[0]
    ////console.log("NO1", searchID, searchedID)
    if(searchedID !== undefined){
        if(searchID !== searchedID) {
            ////console.log("NO", searchID, searchedID)
            removeSubsetAndGetOriginalMaterials(checkedListIntersectFurnAndArea, foundSubsets, indicesIntersectFurnAndArea, 1)

        }
    }
    //console.log(allLists.includes(searchID), searchID,IntersectionsIDsAreaIntersectArea )
    if(allLists.includes(searchID) === true){
        const problembtn = document.createElement('button');
        problembtn.textContent = '❗️DIN-Verstoß';
        problembtn.className = 'problemcontainer';
    
        for(let id = 0; id < areas.length; id++){
    
            //labelBase.textContent = moreInfo.toString()
            const labelObject = new CSS2DObject(problembtn);
    
            labelObject.uuid = areas[id].uuid
            labels.push(labelObject)
    
        }
        for(let id = 0; id < areas.length; id++){
            //console.log(areas[id], labels, problembtn, ) 
        if( areas[id].uuid === searchID) {
            //console.log("hello area",  areas[id].uuid, collisionID, areas[id], ReferenceDirections[id], specificFurnIDList)
             // Create video and play
                labels[id].position.set(areas[id].position.x + 0.3,areas[id].position.y ,areas[id].position.z )
                //areas[id].add(labels[l])
                scene.add(labels[id])

                await  specificAnimation( IntersectionsIDs, kitchenanimations, noIntersectionsIDs, furnClashAreaColor, 1, 'Küche', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDs, showeranimations, noIntersectionsIDs, furnClashAreaColor, 5, 'Dusche', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDs, tubeanimations, noIntersectionsIDs, furnClashAreaColor, 4, 'Badewanne', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDs, sinkanimations, noIntersectionsIDs, furnClashAreaColor, 3, 'Waschtisch', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDs, bedanimations, noIntersectionsIDs, furnClashAreaColor, 0, 'Bett',  4.5, 3.5)
                await  specificAnimation( IntersectionsIDs, wcanimations, noIntersectionsIDs, furnClashAreaColor, 2, 'WC', 1.5, 1.5)
            
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 1, 'Küche Wand', 1.5, 1.5)
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 5, 'Dusche Wand', 1.5, 1.5)
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 4, 'Badewanne Wand', 1.5, 1.5)
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 3, 'Waschtisch Wand', 1.5, 1.5)
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 0, 'Bett Wand', 4.5, 3.5)
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 2, 'WC Wand', 1.5, 1.5)
            
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, kitchenanimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 1, 'Küche', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, showeranimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 5, 'Dusche', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, tubeanimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 4, 'Badewanne', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, sinkanimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 3, 'Waschtisch', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, bedanimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 0, 'Bett',  4.5, 3.5)
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, wcanimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 2, 'WC', 1.5, 1.5)
            
            
                
            
            
        } 
        indexID = noSpecificFurnIDList.indexOf(areas[id].uuid);
        if(noSpecificFurnIDList[indexID] === searchID ){
            console.log("SONSTIGE")
            const Videomaterial = videoMaterial(otheranimations[0], 1.5, 1.5, id)
                        //for(let mat = 0; mat < checkedMats.length; mat++){
            areas[id].material = Videomaterial;

            areas[id].position.set( areas[id].position.x, 1 ,  areas[id].position.z)
    
        }
     
       
    }
    
    }
    

   showCollisionText('containerText', 'containerTextNot')
   //showCollisionText('containerTextNot')
    function showCollisionText(className,classNameGreen, ){
        const stringID = searchID.toString();
        const collisionTextShow = document.getElementsByClassName(className);
        const arrayNodes = Array.from(collisionTextShow)

        const collisionTextShowGreen = document.getElementsByClassName(classNameGreen);
        const arrayNodesGreen = Array.from(collisionTextShowGreen)


        const collisionShowID = document.getElementById(stringID);


        ShowTextPerNode(intersectionidHTML,stringID, arrayNodes )
        ShowTextPerNode(noIntersectionidHTML,stringID, arrayNodes )

     }
    let firstOcc;



    function specificAnimationWalls(IntersectionsIDsTest, IntersectionsIDsTestWith, source, index, name){
        if(noSpecificFurnIDList.includes(searchID) === true){
        for(let  r = 0; r < IntersectionsIDsTest.length; r++){
            if(noSpecificFurnIDList.includes(IntersectionsIDsTest[r]) === true){
                
                for (let id = 0; id < areas.length; id++){
                    if( areas[id].uuid === searchID) {
                        const Videomaterial = videoMaterial(otheranimations[0], 1.5, 1.5, id)
                        //for(let mat = 0; mat < checkedMats.length; mat++){
                        areas[id].material = Videomaterial;
    
                        areas[id].position.set( areas[id].position.x, 1 ,  areas[id].position.z)
    
    
                        }
                    }
            }
        }
    }
        
        if(IntersectionsIDsTest.includes(foundMeshesCheckbox[index]) === true){
            //console.log("name", name, foundMeshesCheckbox[index])

                //const firstOcc = includesIDinList([foundMeshesCheckbox[index]])

                const indexWall = IntersectionsIDsTest.indexOf(searchID)

                //console.log('indexWall', indexWall, IntersectionsIDsTest, IntersectionsIDsTestWith, searchID, foundMeshesCheckbox, specificFurnIDList, specificFurnIDList[index].key, noSpecificFurnIDList)
                
                if(searchID === IntersectionsIDsTest[indexWall]){
                    //console.log('wallani', name)
                    loader.ifcManager.createSubset({
                        modelID: model.modelID,
                        ids: [ IntersectionsIDsTestWith[indexWall] ],
                        material: wallClashmaterial,
                        scene,
                        removePrevious: true,
                    });

                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'Dusche'){
                            wallCollisonAnimationArea('Dusche Wand', IntersectionsIDsTest, indexWall, showeranimations, 1.5, 1.5)
                        } 
                        
                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'Küche' ) {
                            wallCollisonAnimationArea('Küche Wand', IntersectionsIDsTest, indexWall, kitchenanimations, 1.5, 1.5)
                        }
                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'Badewanne' ){
                            wallCollisonAnimationArea('Badewanne Wand', IntersectionsIDsTest, indexWall, tubeanimations, 1.5, 1.5)
                        }
                        
                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'Waschtisch' ){
                            wallCollisonAnimationArea('Waschtisch Wand', IntersectionsIDsTest, indexWall, sinkanimations, 1.5, 1.5)
                        }
                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'Bett' ){
                            wallCollisonAnimationArea('Bett Wand', IntersectionsIDsTest, indexWall, bedanimations, 4.5, 3.5)
                        }
                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'WC' ){
                            wallCollisonAnimationArea('WC Wand', IntersectionsIDsTest, indexWall, wcanimations, 1.5, 1.5)
                        }
                       

               
                    

                    function wallCollisonAnimationArea(name, IntersectionsIDsTest, indexWall, showeranimations, width, depth){

                        //if(name === 'Dusche Wand' || name === 'Küche Wand' ||name === 'Badewanne Wand' ||name === 'Waschtisch Wand' ||name === 'Bett Wand' ||name === 'WC Wand' ){
                            let videoSource
                            for (let id = 0; id < areas.length; id++){


                                if(areas[id].uuid === IntersectionsIDsTest[indexWall]){
                                    for (let video = 0; video < showeranimations.length; video++){
                                        if(ReferenceDirections[id].x > 0){
                                            //console.log("0", ReferenceDirections[id])
                                            videoSource = showeranimations[0]
        
                                        }
                                        if(ReferenceDirections[id].x < 0){
                                            //console.log("1", ReferenceDirections[id])
                                            videoSource = showeranimations[1]
                                        }
        
                                        if(ReferenceDirections[id].y < 0){
                                            //console.log("2", ReferenceDirections[id])
                                            videoSource = showeranimations[2]
        
                                        }
        
                                        if(ReferenceDirections[id].y > 0){
                                            //console.log("3", ReferenceDirections[id])
                                            videoSource = showeranimations[3]
        
        
                                        }
        
                                    }
                                    const Videomaterial = videoMaterial(videoSource, width, depth, id)
                                    
        
                                    // let geo = new EdgesGeometry(areas[id].geometry);
                                    // let mat = new LineBasicMaterial({ color: "black", linewidth: 10 });
                                    // let wireframe = new LineSegments(geo, mat);
                                    // wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
                                    // areas[id].add(wireframe);
        
                                    areas[id].material = Videomaterial
                                    //console.log("heigt", allSubsetMeshes[id], allSubsetMeshes[id].geometry.boundingBox.max.y, areas[id])
                                    areas[id].position.set( areas[id].position.x, allSubsetMeshes[id].geometry.boundingBox.max.y,  areas[id].position.z)
        
                                } else  {

                                    for(let mat = 0; mat < checkedMats.length; mat++){
                                        areas[id].material = checkedMats[id];
        
                                        areas[id].position.set( areas[id].position.x, 0.0 ,  areas[id].position.z)
        
        
                                    }
                                }
                            
                            }

                        }
                    };

                } else if(IntersectionsIDsTest.includes(foundMeshesCheckbox[index]) === false) {
                    for (let id = 0; id < areas.length; id++){
                        if( areas[id].uuid !== searchID) {
                            for(let mat = 0; mat < checkedMats.length; mat++){
                                areas[id].material = checkedMats[id];
                                areas[id].position.set( areas[id].position.x, 0.0 ,  areas[id].position.z)


                            }
                        }

                }
                }
            } 

        
           
            function videoMaterial(source, width, depth, id){
        
                let textureVid = document.createElement("video")


                textureVid.src = source ; // transform gif to mp4
                textureVid.loop = true;
                textureVid.width = '900';
                textureVid.height = '1080';
                textureVid.play();


                // Load video texture
                let videoTexture = new VideoTexture(textureVid);
                videoTexture.format = RGBFormat;

                // videoTexture.minFilter = NearestFilter;
                // videoTexture.maxFilter = NearestFilter;

                videoTexture.generateMipmaps = false;
                // videoTexture.wrapS = RepeatWrapping;
                // videoTexture.wrapT = RepeatWrapping;
                // //console.log(areas[id])
                videoTexture.repeat.set(areas[id].geometry.parameters.width/width, areas[id].geometry.parameters.depth/depth)
                
                // Create mesh

                var Videomaterial = new MeshBasicMaterial( { map: videoTexture, depthTest: true, transparent: true, opacity: 0.8 } );
                //console.log(Videomaterial, videoTexture)
                return Videomaterial
                //areas[id].geometry.parameters.height = allSubsetMeshes[id].geometry.boundingBox.max.y

            }


    async function specificAnimation( IntersectionsIDsTest, source, noIntersectionsIDs, firstMaterial, index, name, width, depth) {
        
        if(IntersectionsIDsTest.includes(foundMeshesCheckbox[index]) === true){
            console.log("name", name, foundMeshesCheckbox[index], specificFurnIDList, foundMeshesCheckbox,)

            const firstOcc = includesIDinList([foundMeshesCheckbox[index]])
           
            await extraAnimationArea('WC','Waschtisch', 2, 3, './Animations/Rollstuhl_Kollision_WC_1_mirror.mp4', './Animations/Rollstuhl_Kollision_WC_1.mp4', './Animations/Rollstuhl_Kollision_Waschbecken.mp4', './Animations/Rollstuhl_Kollision_Waschbecken.mp4');
            //await extraAnimationArea('Waschtisch', 3, './Animations/Rollstuhl_Kollision_WC_1_mirror.mp4', './Animations/Rollstuhl_Kollision_WC_1.mp4');
        
            async function extraAnimationArea(nameFurn, nameFurn2, indexFurniture,indexFurniture2,  sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4){
                //console.log(foundMeshesCheckbox[indexFurniture] , foundMeshesCheckbox[indexFurniture2] )
                console.log(name, nameFurn, nameFurn2)
                if(name === nameFurn || name === nameFurn2){
                    for(let id = 0; id < areas.length; id++){
                        if(IntersectionsIDsTest.includes(foundMeshesCheckbox[indexFurniture]) === true){
                            if(searchID === foundMeshesCheckbox[indexFurniture] ){
                                ////console.log("IDARREA", areas[id],  foundMeshesCheckbox[indexFurniture], translationList)
                                if(areas[id].uuid === foundMeshesCheckbox[indexFurniture]  ){
                                    videoArea (sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4)
                                    for(let u = 0; u < areaNewList.length; u++){
                                        scene.add(areaNewList[0])
                                    }
                                } 
                            }if (searchID !== foundMeshesCheckbox[indexFurniture] ){
                                ////console.log("NOOOOOOO", areas[id].uuid, foundMeshesCheckbox[indexFurniture] )
                                for(let u = 0; u < areaNewList.length; u++){
                                    scene.remove(areaNewList[u])
                                }
                
                                if(mesh.length > 0){
                                    for(let p = 0; p < mesh.length; p++){
                                        scene.add(mesh[p])
                                    }
                                    
                                }   
                                
                            }
                        }
                        if(IntersectionsIDsTest.includes(foundMeshesCheckbox[indexFurniture2]) === true){
                            if(searchID === foundMeshesCheckbox[indexFurniture2]){
                                if(areas[id].uuid === foundMeshesCheckbox[indexFurniture2]  ){
                                    videoArea (sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4)
                                    for(let u = 0; u < areaNewList2.length; u++){
                                        scene.add(areaNewList2[0])
                                    }
                                }
                            
                            } 
                        
                            if (searchID !== foundMeshesCheckbox[indexFurniture2] ){
                                ////console.log("NOOOOOO2O", areas[id].uuid, foundMeshesCheckbox[indexFurniture2] )
                            
                                for(let u = 0; u < areaNewList2.length; u++){
                                    scene.remove(areaNewList2[u])
                                }
                                if(mesh.length > 0){
                                    for(let p = 0; p < mesh.length; p++){
                                        scene.add(mesh[p])
                                    }
                                    
                                }   
                                
                            } 

                        }
                        function videoArea (sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4) {
                                let textureVid = document.createElement("video")

                                function generateAreaForAnimation(boxX, boxZ, material, posx, posy, posz){
                                    //console.log("Area", areas[id], ReferenceDirections[id], foundMeshesCheckbox[indexFurniture] , foundMeshesCheckbox[indexFurniture2] )
                                    const areaRandom = new BoxGeometry(boxX  ,0.008,boxZ)

                                    material.map.repeat.y = boxZ/boxZ
                                    material.map.repeat.x = boxX/boxX

                                    const  areaNew = new Mesh(areaRandom, material )



                                    areaNew.position.set(posx, posy, posz  )

                                    if(areas[id].uuid === foundMeshesCheckbox[indexFurniture] ) {
                                        areaNewList.push(areaNew)
                                        //areaNewList2.push(areaNew)
                                    }
                                    if(areas[id].uuid === foundMeshesCheckbox[indexFurniture2] ) {
                                        areaNewList2.push(areaNew)
                                        //areaNewList2.push(areaNew)
                                    }
                                    
                                    //scene.add(areaNewList[0])
                                    ////console.log("areaNweF", areaNewList, areaNewList2)
                                    //IntersectionsIDsTest.splice()
                                    
                                }


                                if(areas[id].uuid === foundMeshesCheckbox[indexFurniture2] ) {
                                    const src = sourceVideo3
                                    textureVid.src = src ; // transform gif to mp4
                                    textureVid.loop = true;
                                    textureVid.width = '900';
                                    textureVid.height = '1080';
                                    textureVid.play();
    
                                    // Load video texture
                                    let videoTexture = new VideoTexture(textureVid);
                                    videoTexture.format = RGBFormat;
    
                                    videoTexture.generateMipmaps = false;
    
                                    // Create mesh
    
                                    const materialVideo = new MeshBasicMaterial( { map: videoTexture ,depthTest: true, transparent: true, opacity: 0.8 } );
                                    
                                    const meshHide = areas[id];
                                    mesh.push(meshHide)
                                    scene.remove(meshHide)

                                    if(ReferenceDirections[id].x > 0){
                                        generateAreaForAnimation(1.5, areas[id].geometry.parameters.depth + 1.5,materialVideo,
                                            areas[id].position.x,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z + ((areas[id].geometry.parameters.depth + 1.5)/2) - areas[id].geometry.parameters.depth/2 )

                                    }
                                    if(ReferenceDirections[id].x < 0){
                                        generateAreaForAnimation(1.5, areas[id].geometry.parameters.depth + 1.5,materialVideo,
                                            areas[id].position.x,
                                            areas[id].position.y +0.85,
                                            areas[id].position.z - ((areas[id].geometry.parameters.depth + 1.5)/2) + areas[id].geometry.parameters.depth/2 )


                                    }

                                    if(ReferenceDirections[id].y < 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.depth + 1.5,1.5, materialVideo,
                                            areas[id].position.x - ((areas[id].geometry.parameters.depth + 1.5)/2) + areas[id].geometry.parameters.depth/2,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z )


                                        ////console.log("areaNwe", areaNewList)

                                    }

                                    if(ReferenceDirections[id].y > 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.depth + 1.5, 1.5,materialVideo,
                                            areas[id].position.x + ((areas[id].geometry.parameters.depth + 1.5)/2) - areas[id].geometry.parameters.depth/2,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z )



                                    }
                                } if(areas[id].uuid === foundMeshesCheckbox[indexFurniture] ) {

                                    const src = videoAfterTranslationWC(indexFurniture, indexFurniture2,sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4)
                                    textureVid.src = src ; // transform gif to mp4
                                    textureVid.loop = true;
                                    textureVid.width = '900';
                                    textureVid.height = '1080';
                                    textureVid.play();
    
                                    // Load video texture
                                    let videoTexture = new VideoTexture(textureVid);
                                    videoTexture.format = RGBFormat;
    
                                    videoTexture.generateMipmaps = false;
    
                                    // Create mesh
    
                                    const materialVideo = new MeshBasicMaterial( { map: videoTexture, depthTest: true, transparent: true, opacity: 0.8 } );
                                    
                                    const meshHide = areas[id];
                                    mesh.push(meshHide)
                                    scene.remove(meshHide)


                                    if(ReferenceDirections[id].x > 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.width, areas[id].geometry.parameters.depth + 1.5,materialVideo,
                                            areas[id].position.x,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z + ((areas[id].geometry.parameters.depth + 1.5)/2) - areas[id].geometry.parameters.depth/2 )

                                    }
                                    if(ReferenceDirections[id].x < 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.width, areas[id].geometry.parameters.depth + 1.5,materialVideo,
                                            areas[id].position.x,
                                            areas[id].position.y +0.85,
                                            areas[id].position.z - ((areas[id].geometry.parameters.depth + 1.5)/2) + areas[id].geometry.parameters.depth/2 )


                                    }

                                    if(ReferenceDirections[id].y < 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.depth + 1.5,areas[id].geometry.parameters.width, materialVideo,
                                            areas[id].position.x - ((areas[id].geometry.parameters.depth + 1.5)/2) + areas[id].geometry.parameters.depth/2,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z )


                                        ////console.log("areaNwe", areaNewList)

                                    }

                                    if(ReferenceDirections[id].y > 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.depth + 1.5, areas[id].geometry.parameters.width,materialVideo,
                                            areas[id].position.x + ((areas[id].geometry.parameters.depth + 1.5)/2) - areas[id].geometry.parameters.depth/2,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z )



                                    }
                                }
                            }



                    }
                } else {
                    
                    
                    await changeAreaToAnimaton(firstOcc, IntersectionsIDsTest, source, noIntersectionsIDs, firstMaterial, width, depth)
                }
            };





        }
    }





   

    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations, 5, ['Dusche Wand'])
    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations,1, ['Küche Wand'])
    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations,4, ['Badewanne Wand'])
    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations,3, ['Waschtisch Wand'])
    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations,0, ['Bett Wand'])
    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations,2,[ 'WC Wand'])

    
        const subs = loader.ifcManager.createSubset({
            modelID: model.modelID,
            ids: [ searchID ],
            material: secondMaterial,
            scene,
            removePrevious: true,
        });
    
        prepickedSubset.push(subs)
        console.log("subs", prepickedSubset)

 
    
       



    function includesIDinList(IntersectionsIDsTest){
        return IntersectionsIDsTest.includes(searchID)
    }




    async function changeAreaToAnimaton(firstOcc, IntersectionsIDsTest, source, noIntersectionsIDsTest, firstMaterial, width, depth) {
        
        if(firstOcc === true) {
            loader.ifcManager.removeSubset(0,  greenMaterial);
            for(let i = 0; i < IntersectionsIDsTest.length; i++){
                // if(checkedListIntersectFurnAndArea[i] === true){
                const collisionID = IntersectionsIDsTest[i]

                if (collisionID === searchID){
                    console.log("here we go", collisionID,)
                               
                   
                    for(let id = 0; id < areas.length; id++){

                            //labelBase.textContent = moreInfo.toString()
        
                        console.log("ID Position", areas[id].uuid ,collisionID)
                             
                        if( areas[id].uuid === collisionID) {
                            console.log("hello area",  areas[id].uuid, collisionID, areas[id], ReferenceDirections[id], specificFurnIDList)
                             // Create video and play
                            //if(collisionID == )
                            let videoSource
                            for (let video = 0; video < source.length; video++){
                                if(ReferenceDirections[id].x > 0){
                                    videoSource = source[0]

                                }
                                if(ReferenceDirections[id].x < 0){
                                    videoSource = source[1]
                                }

                                if(ReferenceDirections[id].y < 0){
                                    videoSource = source[2]

                                }

                                if(ReferenceDirections[id].y > 0){
                                    videoSource = source[3]


                                }

                            }
                           

                            const Videomaterial = videoMaterial(videoSource,  width, depth)

                            function videoMaterial(source,  width, depth){

                                let textureVid = document.createElement("video")


                                textureVid.src = source ; // transform gif to mp4
                                textureVid.loop = true;
                                textureVid.width = '900';
                                textureVid.height = '1080';
                                textureVid.play();


                                // Load video texture
                                let videoTexture = new VideoTexture(textureVid);
                                videoTexture.format = RGBFormat;

                                // videoTexture.minFilter = NearestFilter;
                                // videoTexture.maxFilter = NearestFilter;

                                videoTexture.generateMipmaps = false;
                                // videoTexture.wrapS = RepeatWrapping;
                                // videoTexture.wrapT = RepeatWrapping;
                                // //console.log(areas[id])
                                videoTexture.repeat.set(areas[id].geometry.parameters.width/width, areas[id].geometry.parameters.depth/depth)
                                
                                // Create mesh

                                var Videomaterial = new MeshBasicMaterial( { map: videoTexture, depthTest: true, transparent: true, opacity: 0.8 } );
                                //console.log(Videomaterial, videoTexture)
                                return Videomaterial
                                //areas[id].geometry.parameters.height = allSubsetMeshes[id].geometry.boundingBox.max.y

                            }


                            // let geo = new EdgesGeometry(areas[id].geometry);
                            // let mat = new LineBasicMaterial({ color: "black", linewidth: 10 });
                            // let wireframe = new LineSegments(geo, mat);
                            // wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
                            // areas[id].add(wireframe);

                            areas[id].material = Videomaterial
                            //console.log("heigt", allSubsetMeshes[id], allSubsetMeshes[id].geometry.boundingBox.max.y, areas[id])
                            areas[id].position.set( areas[id].position.x, allSubsetMeshes[id].geometry.boundingBox.max.y,  areas[id].position.z)





                        } 
                        // else if( areas[id].uuid !== collisionID) {
                        //     console.log("else if",  areas[id].uuid, collisionID)
                        //     for(let mat = 0; mat < checkedMats.length; mat++){
                        //         areas[id].material = checkedMats[id];

                        //         areas[id].position.set( areas[id].position.x, 0.0 ,  areas[id].position.z)


                        //     }
                        // }

                    }


                    // const subs = loader.ifcManager.createSubset({
                    //     modelID: model.modelID,
                    //     ids: [ searchID ],
                    //     material: secondMaterial,
                    //     scene,
                    //     removePrevious: true,
                    // });
                    // prepickedSubset.push(subs)

                } else if (collisionID !== searchID){

                        ////console.log("areaNweDel",  areaNewList)

                        //scene.remove(areaNewList[0])


                }
            }
        } else if(firstOcc === false) {

            loader.ifcManager.removeSubset(0,  secondMaterial);

            for(let k = 0; k < noIntersectionsIDsTest.length; k++){

                const collisionID = noIntersectionsIDsTest[k]
                
                ////console.log("collisionID NOs", collisionID, noIntersectionsIDsFurnIntersectArea)
                // remove animationmateral
                for(let id = 0; id < areas.length; id++){
               
                    if( areas[id].uuid !== searchID) {
                        for(let mat = 0; mat < checkedMats.length; mat++){
                            areas[id].material = checkedMats[id];
                            areas[id].position.set( areas[id].position.x, 0.0 ,  areas[id].position.z)

                        }
                    }
                }
            

                // if (collisionID === searchID){
                //     ////console.log("here we go", collisionID, searchID, indicesIntersectFurnAndArea[i])


                //     const subs2 = loader.ifcManager.createSubset({
                //         modelID: model.modelID,
                //         ids: [ searchID ],
                //         material: greenMaterial,
                //         scene,
                //         removePrevious: true,
                //     });

                // }
            }
        }

        }

}

function ShowTextPerNode(intersectionidHTML,stringID, arrayNodes ) {
    const arrayIDs = [];
    for(let a = 0; a < intersectionidHTML.length; a++){
        ////console.log(arrayNodes[a].id
        if(intersectionidHTML[a] === stringID) {

            //console.log("yes")
            for(let b = 0; b < arrayNodes.length; b++){
                ////console.log(arrayNodes[b].id)

                const arrayids = arrayNodes[b].id.toString()
                ////console.log("arrayids", arrayids)
                arrayIDs.push(arrayids)
                if(arrayids === intersectionidHTML[a] ) {
                    const index = arrayIDs.indexOf(intersectionidHTML[a])
                    ////console.log("found idindex", index)
                    arrayNodes[index].style.color = 'blue'
                    arrayNodes[index].style.visibility = 'visible'

                } else {
                    arrayNodes[b].style.visibility = 'hidden';
                }
            }

        }
    }
}



let collidingFurnIDs = [];
async function pickCheckbox(event, material, secondMaterial,Expressid ) {

    const filterRadioButtonChecked = Array.from(document.getElementsByName('noIntersection')).filter(x => x ['checked']);
        //console.log("radioButtonValue", filterRadioButtonChecked, areas, )
        const radioButtonValue = filterRadioButtonChecked[0].value
        if(radioButtonValue !== undefined) {
        //console.log("radioButtonValue",radioButtonValue)

        for (let j = 0; j < areas.length; j++) {
            let areasid = areas[j].uuid.toString();
            if( areasid === radioButtonValue){
                let zoomPosition = areas[j].position
                //console.log('zoomPosition', zoomPosition, areas[j], areas, radioButtonValue,)
                // if(zoomPosition.z < 0 && zoomPosition.x < 0) {

                //     camera.position.set(zoomPosition.x  - zoomPosition.x/2 , 1.5, zoomPosition.z - zoomPosition.z/2)
                //     //console.log("z - x-")

                // }
                // if(zoomPosition.z > 0 && zoomPosition.x < 0 ) {

                //     camera.position.set(zoomPosition.x  - zoomPosition.x/2 , 1.5, zoomPosition.z + zoomPosition.z/2)
                //     //console.log("z+ x-")

                // }
                // if(zoomPosition.z > 0 && zoomPosition.x > 0 ) {

                //     camera.position.set(zoomPosition.x  + zoomPosition.x/2 , 1.5, zoomPosition.z + zoomPosition.z/2)
                //     //console.log("z+ x+")

                // }
                if(zoomPosition.z < 0 && zoomPosition.x > 0) {
                    controls.position0.y = 2
                    camera.position.y = 10
                    camera.position.x = zoomPosition.x
                    camera.position.z = zoomPosition.z
                    controls.target.set(zoomPosition.x, zoomPosition.y, zoomPosition.z);

                    //sconsole.log("controls1", controls, camera)
                    //camera.position.set(zoomPosition.x  + zoomPosition.x/2 , 1.5, zoomPosition.z - zoomPosition.z)
                    //console.log("z - x+")

                }
                if(zoomPosition.z < 0 && zoomPosition.x < 0) {
                    controls.position0.y = 2
                    camera.position.y = 10
                    camera.position.x = zoomPosition.x
                    camera.position.z = zoomPosition.z
                    controls.target.set(zoomPosition.x , zoomPosition.y, zoomPosition.z);

                   


                    //console.log("controls2", controls, camera,  controls.getDistance())
                    //camera.position.set(zoomPosition.x  + zoomPosition.x/2 , 1.5, zoomPosition.z - zoomPosition.z)
                    //console.log("z - x-")

                }



            }
        }

    }



};

let searchedID
async function pickByIDClick(event, material, secondMaterial,Expressid ) {

    collisionColorShow(checkedListIntersectFurnAndArea, indicesIntersectFurnAndArea)
    collisionColorShow(checkedListIntersectAreaAndFurn, indicesIntersectAreaAndFurn)

    function collisionColorShow(checkedListIntersectFurnAndArea, indicesIntersectFurnAndArea){
        //console.log(Expressid, collidedIDs, checkedListIntersectFurnAndArea)

        const searchID = Expressid[0]

        // const ifcElement = await loader.ifcManager.getItemProperties(model.modelID, searchID)
        // //console.log(ifcElement)

        for(let i = 0; i < checkedListIntersectFurnAndArea.length; i++){
            if(checkedListIntersectFurnAndArea[i] === true){
                const collisionID = allSubsetMeshes[indicesIntersectFurnAndArea[i][0]].uuid
                ////console.log("collisionid", collisionID)
                if (collisionID === searchID){

                    //console.log("here we go", collisionID, searchID, indicesIntersectFurnAndArea[i])

                    collidingFurnIDs.push(allSubsetMeshes[indicesIntersectFurnAndArea[i][1]].uuid)
                    //console.log("collidingFurnIDs",collidingFurnIDs )

                    for ( let idmesh = 0; idmesh < collidingFurnIDs.length; idmesh++){
                        const sub = loader.ifcManager.createSubset({
                            modelID: model.modelID,
                            ids: [ collidingFurnIDs[idmesh] ],
                            material: new MeshBasicMaterial({color: 'blue', transparent: true,  opacity: 0.5, depthTest: false}),
                            scene,
                            removePrevious: true,
                        });
                        foundSubsets.push(sub)
                        //foundSubsetsID.push(id)
                    }
                    //collidingFurnIDs.forEach(generateSubsetWithID)
                    //console.log("foundSubsets", foundSubsets)
                    generateSubsetWithIDred(searchID)


                }
            }


        }

        for(let i = 0; i < checkedListAreaIntersectWall.length; i++){
            if(checkedListAreaIntersectWall[i] === true){
                const wallSubsetMeshesNew = wallSubsetMeshes.concat(allSubsetMeshes)
                const collisionID = allSubsetMeshes[indicesIntersectAreaAndWall[i][0]].uuid
                //console.log("collisionid wall", collisionID)
                if (collisionID === searchID){

                    //console.log("here we go walls", collisionID, searchID, indicesIntersectAreaAndWall[i], wallSubsetMeshesNew)

                    collidingFurnIDs.push(wallSubsetMeshes[indicesIntersectAreaAndWall[i][1]].uuid)
                    //console.log("collidingFurnIDs",collidingFurnIDs )

                    for ( let idmesh = 0; idmesh < collidingFurnIDs.length; idmesh++){
                        const sub = loader.ifcManager.createSubset({
                            modelID: model.modelID,
                            ids: [ collidingFurnIDs[idmesh] ],
                            material: new MeshBasicMaterial({color: 'blue', transparent: true,  opacity: 0.5, depthTest: false}),
                            scene,
                            removePrevious: true,
                        });
                        foundSubsets.push(sub)
                        //foundSubsetsID.push(id)
                    }
                    //collidingFurnIDs.forEach(generateSubsetWithID)
                    //console.log("foundSubsets", foundSubsets)
                    generateSubsetWithIDred(searchID)


                }
            }


        }
        searchedID = searchID

        if(searchID !== searchedID) {
            foundSubsets = []
        }


    }


};

let foundSubsets = [];
let foundSubsetsID = [];
let redSubset = [];
function generateSubsetWithID(id) {
    //console.log("id color", id)

    const sub = loader.ifcManager.createSubset({
        modelID: model.modelID,
        ids: [ id ],
        material: new MeshBasicMaterial({color: 'blue', transparent: true,  opacity: 0.5, depthTest: false}),
        scene,
        removePrevious: true,
    });
    foundSubsets.push(sub)
    foundSubsetsID.push(id)
}

function generateSubsetWithIDred(id) {
    //console.log("id", id)
    const sub = loader.ifcManager.createSubset({
        modelID: model.modelID,
        ids: [ id ],
        material: new MeshBasicMaterial({color: orangeColor, transparent: true,  opacity: 0.5, depthTest: false}),
        scene,
        removePrevious: true,
    });

    foundSubsets.push(sub)
    foundSubsetsID.push(id)
    redSubset.push(sub)
}

function removeSubsetAndGetOriginalMaterials(checkedListIntersectFurnAndArea, foundSubsets, indicesIntersectFurnAndArea, index) {
    for(let i = 0; i < checkedListIntersectFurnAndArea.length; i++){
        for(let k = 0; k < foundSubsets.length; k++){
            foundSubsets[k].material = allSubsetMeshes[indicesIntersectFurnAndArea[i][index]].material
        }
        
        foundSubsets.length = 0
        foundSubsets = []
        foundSubsetsID = []
        redSubset = []
        collidingFurnIDs = []
        prepickedSubset.length = 0
    }
}

//---------------------------------------------------------------------------------
//-------------------------Select every single furniture --------------------------
//---------------------------------------------------------------------------------
function activatePopUpMenu (input, activateButton) {
    const closeTab = document.getElementById('Check');
    closeTab.style.visibility = 'hidden'

    const containerTab = document.getElementById('programmFurniture');

        const divElement = document.createElement('div');
        divElement.id = `${input[0]}-1`;
        divElement.classList.add('modal');
        containerTab.appendChild(divElement)

        // activateButton.onclick = (event) => {
            //console.log('clicked')
            const modalBackround = document.getElementById(`${input[0]}-1`)
            modalBackround.style.display ='block';
            checkBtn.style.visibility = 'hidden'

        // }

        //containerTab.appendChild(activateButton)


    //     const popup = document.createElement('span');
    //     popup.innerText = 'x';
    //     popup.classList.add('close');
    //     popup.title = 'Close Modal';

    //     popup.onclick = () => {
    //         const modalBackround = document.getElementById(`${input[0]}-1`)
    //         modalBackround.style.display='none';
    //    }

    //    divElement.appendChild(popup)

       const formElement = document.createElement('form');
       formElement.classList.add('modal-content');
       formElement.action = '/action_page.php';

       divElement.appendChild(formElement)

       const formContent = document.createElement('div');
       formContent.classList.add('containerForm');


       const heading = document.createElement('p');
       heading.innerText = `Gibt es ein/e ${input[0]}?`

       const decision = document.createElement('div');
       decision.classList.add('clearfix');

       const yesBtn = document.createElement('button');
       yesBtn.type = 'button';
       yesBtn.classList.add('buttonsArea')
       yesBtn.style.backgroundColor = 'darkgrey'
       yesBtn.innerText = 'ja'
       yesBtn.id = 'trueBtn'

       let clicked

       yesBtn.onclick= () => {
            const modalBackround = document.getElementById(`${input[0]}-1`)
            modalBackround.style.display='none';
            clicked = false
            return clicked

        }
        // const noBtn = document.createElement('button');
        // noBtn.type = 'button';
        // noBtn.classList.add('buttonsArea')
        // noBtn.innerText = 'nein'
        // noBtn.id = 'falseBtn'

        // noBtn.onclick= () => {
        //     const modalBackround = document.getElementById(`${input[0]}-1`)
        //     modalBackround.style.display='none';
        //     clicked = false
        //     return clicked

        // }

        const noBtn = document.createElement('button');
        noBtn.type = 'button';
        noBtn.classList.add('buttonsArea')
        noBtn.innerText = 'nein'
        noBtn.id = 'falseBtn'

        noBtn.onclick= () => {
            const modalBackround = document.getElementById(`${input[0]}-1`)
            modalBackround.style.display='none';
            clicked = false

            specificFurnIDList.push({ key: `${input[0]}`, value: 0 })
            return clicked

        }

       formContent.appendChild(heading)
       formContent.appendChild(decision)
       decision.appendChild(yesBtn)
       decision.appendChild(noBtn)
       formElement.appendChild(formContent)



        document.querySelectorAll('button').forEach(occurence => {
            let id = occurence.getAttribute('id');
            occurence.addEventListener('click', async function() {

            if(id === 'trueBtn'){

                //console.log('A button with ID ' + id + ' was clicked!')
                const buttonTxt = document.getElementById('programmFurniture')
                //console.log(buttonTxt)
                buttonTxt.innerText = `Klicke ein/e ${input[0]} jetzt an...` ;

                var bedtest = document.getElementById(`${input[0]}`)
                bedtest.checked = true
                //console.log("bedtest", bedtest)


            }
             else if(id === 'falseBtn') {


                input.shift()
                //console.log("newInput", input)

                if(input.length >= 1 ){
                    checkBtn.style.visibility = 'visible'
                    //console.log('A button with ID ' + id + ' was clicked!')
                    const buttonTxt = document.getElementById('programmFurniture')
                    buttonTxt.innerText = `Kein/e ${input[0]}.` ;

                    var bedtest = document.getElementById(`${input[0]}`)
                    bedtest.checked = false
                    //console.log("bedtest else", bedtest)

                    activatePopUpMenu(input, checkBtn);
                }

            }

        })

    })
    // // Get the modal
    // var modal = document.getElementById(`${input}-1`);

    // // When the user clicks anywhere outside of the modal, close it
    // window.onclick = function(event) {
    //     if (event.target == modal) {
    //     modal.style.display = "none";
    //     }
    // }

}





// Gets the id of all the items of a specific category (per category one array with all ids)
const furnSizes = [];
const idsElementsForCheck = [];
let ids = []
const idsSanitaryList = [];
const idsFurnitureList = [];
const wallDimensionsX = [];
const wallDimensionsY = [];
const wallPlacements = [];
const wallDirection = [];

async function getAllFurniture() {
    const idsFurn= await loader.ifcManager.getAllItemsOfType(0, IFCFURNISHINGELEMENT, false);
    const idsSanitary = await loader.ifcManager.getAllItemsOfType(0, IFCFLOWTERMINAL, false);


    const idsWalls = await loader.ifcManager.getAllItemsOfType(0, IFCWALLSTANDARDCASE, false);
    //console.log(idsWalls)

    wallSubsetMeshesIDs.push(idsWalls)


    allIDsInChecker = idsFurn.concat(idsSanitary, idsWalls)


    //console.log("allIDsInChecker", allIDsInChecker)

    for(let wall = 0; wall < idsWalls.length; wall++){
        const wallRepresentation = await loader.ifcManager.getItemProperties(0, idsWalls[wall], true)

        const sweptArea = wallRepresentation.Representation.Representations[1].Items[0].SweptArea
        const xValueWall = sweptArea.XDim.value
        const yValueWall = sweptArea.YDim.value
        //console.log("wallRep", xValueWall, yValueWall, wallRepresentation)
        wallDimensionsX.push(xValueWall)
        wallDimensionsY.push(yValueWall)

        // const direction = sweptArea.Position.RefDirection.DirectionRatios
        // const XDir = direction[0].value
        // const YDir = direction[1].value
        // //console.log("X udn Y Dir", XDir, YDir)

        const wallObjectPlacement = wallRepresentation.ObjectPlacement.RelativePlacement.Location.Coordinates
        const wallplacementX = wallObjectPlacement[0].value
        const wallplacementY = wallObjectPlacement[1].value
        const wallplacementZ = wallObjectPlacement[2].value
        //console.log("position wall", wallplacementX, wallplacementY, wallplacementZ)
        const placement = new Vector3(wallplacementX, wallplacementZ, wallplacementY)

        wallPlacements.push(placement)

        const ReferenceDir = wallRepresentation.ObjectPlacement.RelativePlacement.RefDirection
        if(ReferenceDir == null) {

            const wallrefDirNull = new Vector3(1, 0 , 0)
            //  //console.log(refDirNull)
            wallDirection.push(wallrefDirNull)
            //console.log("null Ref")
        }
        if(ReferenceDir!== null) {
            //console.log("ReferenceDirAAA", ReferenceDir.DirectionRatios)
            const refDirVector = new Vector3(ReferenceDir.DirectionRatios[0].value, ReferenceDir.DirectionRatios[1].value, ReferenceDir.DirectionRatios[2].value)
            wallDirection.push(refDirVector)
        }



        const placementSweptArea = wallRepresentation.Representation.Representations[1].Items[0].SweptArea.Position.Location.Coordinates
        const XPlacement = placementSweptArea[0].value
        const YPlacement = placementSweptArea[1].value



        const a = wall;
        //console.log("wallDirection",idsWalls[a],  wallDirection)
        const wallCopy = new BoxGeometry(wallDimensionsX[a] - 0.01, 3, wallDimensionsY[a]-0.01)
        const wallMesh = new Mesh(
            wallCopy,
            new MeshBasicMaterial({color: 'grey', transparent: true, opacity: 0.1})

        )

        //console.log("        wall", wallMesh,  wallMesh.position, wallDimensionsX[a], wallDimensionsY[a], wallPlacements[a], wallDirection)


        if(wallDirection[a].x === 1) {
            //console.log("x = 1")
            wallMesh.position.set(wallPlacements[a].x + wallDimensionsX[a]/2, 1.5, -wallPlacements[a].z )
            computeWallBB(wallMesh)
            wallMesh.uuid = idsWalls[wall]
            wallSubsetMeshes.push(wallMesh)


        }
        if(wallDirection[a].x === -1) {
            //console.log("x = -1")
            wallMesh.position.set(wallPlacements[a].x - wallDimensionsX[a]/2, 1.5, -wallPlacements[a].z )
            computeWallBB(wallMesh)
            wallMesh.uuid = idsWalls[wall]
            wallSubsetMeshes.push(wallMesh)

        }
        if(wallDirection[a].y === 1) {
            //console.log("y = 1")
            wallMesh.position.set(wallPlacements[a].x  , 1.5, -wallPlacements[a].z - wallDimensionsX[a]/2 )
            wallMesh.rotateY(Math.PI/2)
            computeWallBB(wallMesh)
            wallMesh.uuid = idsWalls[wall]
            wallSubsetMeshes.push(wallMesh)
        }
        if(wallDirection[a].y === -1) {
            //console.log("y = -1")
            wallMesh.position.set(wallPlacements[a].x  , 1.5, -wallPlacements[a].z + wallDimensionsX[a]/2 )
            wallMesh.rotateY(Math.PI/2)
            computeWallBB(wallMesh)
            wallMesh.uuid = idsWalls[wall]
            wallSubsetMeshes.push(wallMesh)
        }


        scene.add(wallMesh)




    }





    ids = idsSanitary.concat(idsFurn)

    //console.log(ids)
    idsElementsForCheck.push(ids)
    idsSanitaryList.push(idsSanitary)
    idsFurnitureList.push(idsFurn)
    for (let furniture = 0; furniture <ids.length; furniture++ ){
        // every single furniture Mesh gets his own subset with different color
        const id = ids[furniture]

        furnitureSubset = loader.ifcManager.createSubset({
            modelID: 0,
            ids: [id],
            scene,
            removePrevious: true,
            customID: [id].toString()
        });

        furnitureSubset.position.set(0 , 0, 0)


        //scene.remove(furnitureSubset)
        //console.log("furnitsub", furnitureSubset)

        // let geo = new EdgesGeometry(furnitureSubset.geometry);
        // let mat = new LineBasicMaterial({ color: "black", linewidth: 10 });
        // let wireframe = new LineSegments(geo, mat);
        // wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
        // scene.add(wireframe);

        furnitureSubset.geometry.computeBoundsTree()
        //computeBoundsTree()

        let furnitureBB = new Box3(new Vector3(), new Vector3())
        furnitureBB.copy(furnitureSubset.geometry.boundingBox)
        furnitureSubset.updateMatrixWorld(true)


        furnitureBB.applyMatrix4(furnitureSubset.matrixWorld)

        const sizeFurnBB = furnitureBB.getSize(new Vector3())
        //console.log("sizeFurnBB", sizeFurnBB)
        furnSizes.push(sizeFurnBB)
        const boxhelper = new BoxHelper(furnitureSubset, 0x000000)

        //scene.add(boxhelper)




        //furnitureBB.setFromObject(furnitureSubset)
        let centerPtFurniture = furnitureSubset.geometry.boundingBox.getCenter(new Vector3())
        //console.log("furnitureBB", furnitureBB ,centerPtFurniture)
        centerPoints.push(centerPtFurniture)

        subsetBoundingBoxes.push(furnitureBB)
        //boundingCubes.push(furnitureBB)

        allSubsetMeshes.push(furnitureSubset)
    }




    const uuids = []
    ////console.log("furnituresub", allSubsetMeshes)
    for(let i = 0; i < allSubsetMeshes.length; i++){
        delete allSubsetMeshes[i].uuid
        allSubsetMeshes[i].uuid = ids[i]

   



    }

    // spheres around the center of the Furnitures
    for ( let point = 0; point < centerPoints.length; point++){
        const geom1 = new SphereGeometry(0.02)
        const centerSphere = new Mesh(
            geom1,
            new MeshPhongMaterial({color: 0x00ffff, transparent:true, opacity: 0.0})
        )
        centerSphere.position.set(centerPoints[point].x, centerPoints[point].y, centerPoints[point].z)
        //scene.add(centerSphere)


        //movement areas random

        const areaRandom = new BoxGeometry(furnSizes[point].x,0.005,furnSizes[point].z)
        const areaRandomMesh = new Mesh(
            areaRandom,
            new MeshBasicMaterial({color: greyColor, transparent: true, opacity: 0.2})

        )

        areaRandomMesh.position.set(centerPoints[point].x, 0, centerPoints[point].z)
        allSubsetMeshes[point].add(centerSphere)
        allSubsetMeshes[point].add(areaRandomMesh)

      
        areaMeshes.push(areaRandomMesh)
        

        areaMeshes[point].uuid = allSubsetMeshes[point].uuid


        


    }
}

function computeWallBB(wallMesh) {
    wallMesh.geometry.computeBoundsTree()

    let wallBB = new Box3(new Vector3(), new Vector3())
    wallBB.copy(wallMesh.geometry.boundingBox)
    wallMesh.updateMatrixWorld(true)


    wallBB.applyMatrix4(wallMesh.matrixWorld)

    const sizeFurnBB = wallBB.getSize(new Vector3())
    //console.log("sizeWallBB", sizeFurnBB)
    //furnSizes.push(sizeFurnBB)
    const boxhelper = new BoxHelper(wallMesh, 0x000000)
    //scene.add(boxhelper)

    wallBounds.push(wallBB)



    // //wallBB.setFromObject(wallMesh)
    // let centerPtFurniture = wallMesh.geometry.boundingBox.getCenter(new Vector3())
    // //console.log("wallBB", wallBB ,centerPtFurniture)
    // centerPoints.push(centerPtFurniture)

    // subsetBoundingBoxes.push(wallBB)
    // //boundingCubes.push(wallBB)
    // allSubsetMeshes.push(wallMesh)
}


//GREY MODELL
async function getSpecificSubset(entity, material) {
    const subsetMesh = []
    const ids = await loader.ifcManager.getAllItemsOfType(0, entity, false);

    for (let entity = 0; entity < ids.length; entity++ ){
        // every single entity Mesh gets his own subset with different color
        const id = ids[entity]

        entitySubset = loader.ifcManager.createSubset({
            modelID: 0,
            ids: [id],
            scene,
            removePrevious: true,
            material: material,
            customID: [id].toString()
        });
        subsetMesh.push(entitySubset)
        //return entitySubset
    }
    return subsetMesh

}

async function allElements(){

    await getSpecificSubset(IFCWALLSTANDARDCASE, hidedObjectMaterial)
    const doors = await getSpecificSubset(IFCDOOR, hidedObjectMaterial)
    //console.log(`doors`, doors)
    //await getSpecificSubset(IFCSLAB)
    await getSpecificSubset(IFCWINDOW, hidedObjectMaterial)
    await getSpecificSubset(IFCPLATE, hidedObjectMaterial)
    await getSpecificSubset(IFCMEMBER, hidedObjectMaterial)
    await getSpecificSubset(IFCSLAB, slabMaterial)




}

// getAllPositionsFurniture(furnitureMeshes)
// function getAllPositionsFurniture(furnitureMeshes) {
//     for(let i = 0; i < allids.length; i++){
//         //const coords = await coordinatesFurniture(allids[i])
//         //console.log("coords", allids[i])
//     }
//     //console.log( furnitureMeshes)
// }


const changedFurniturePosition = [];
const pickedIDs = [];
// // pick furniture
async function pickFurniture(event, material ,furnitureMeshes ) {

    const found = castObjects(event, furnitureMeshes)[0];
    //console.log("found Mesh", found)


    if(found) {
        if(furnituremodeIsActive === true || checkedBtnmodeIsActive === true) {
            //console.log("hello beauty")
            checkBtn.style.visibility = 'visible'
        } else {
            checkBtn.style.visibility = 'hidden'
        }

        const index = found.faceIndex;
        //console.log("index", index)
        lastFurnitureFound = found.object;

        const geometry = found.object.geometry;

        //console.log("geometry", geometry, geometry.uuid)

        const gumballPosition =  gumball.position.set(found.point.x,found.point.y, found.point.z)
        ////console.log("gumballPosition", gumballPosition)

        // Id which collided with raycaster
        const ifc = loader.ifcManager;
        const id = ifc.getExpressId(geometry, index );
        //console.log("id", found.object.id, id, found.object.modelID)

        delete geometry.uuid
        geometry.uuid = id
        //console.log("geometry2", geometry, geometry.uuid)


        gumball.attach(lastFurnitureFound)

        ////console.log(gumball.position)
        scene.add(gumball)

        gumball.position.set(gumballPosition.x - lastFurnitureFound.position.x, gumballPosition.y, gumballPosition.z - lastFurnitureFound.position.z)


        const coords = await coordinatesFurniture(id)
        ////console.log(coords)
        const startPositionFurniture = new Vector3(coords[0].value, coords[1].value, coords[2].value)
        //console.log("startPositionFurniture", startPositionFurniture)

        let indexFound = furnitureMeshes.indexOf(found.object)
        const modifiedCenter = new Vector3(centerPoints[indexFound].x, centerPoints[indexFound].y-centerPoints[indexFound].y, centerPoints[indexFound].z)

        //console.log("indexfound", indexFound, centerPoints, centerPoints[indexFound], )
        let area


        var bed = document.getElementById('Bett').checked
        var kitchen = document.getElementById('Küchenzeile').checked
        var toilet = document.getElementById('WC').checked
        var sink = document.getElementById('Waschtisch').checked
        var tube = document.getElementById('Badewanne').checked
        var shower = document.getElementById('Dusche').checked


        let lastFurnitureFoundBB = new Box3(new Vector3(), new Vector3())
        lastFurnitureFoundBB.setFromObject(lastFurnitureFound)
        lastFurnitureFoundBB.copy( lastFurnitureFound.geometry.boundingBox).applyMatrix4(lastFurnitureFound.matrixWorld)

        const sizeBB = lastFurnitureFoundBB.getSize(new Vector3())
        //console.log("lastBB",sizeBB )


        async function setSpecificArea(checkboxID, width, length ){
        
            
            if(checkboxID){

                area = await generateAreaFurniture(width, length, modifiedCenter)
                scene.add(area)
                areaMeshes.splice(indexFound, 1,  area)
                for(let i = 0; i <areaMeshes.length; i++){
                    ReferencePositionAreas.push(area.position)
                }
               
            }

            return area
        }




        async function positionFurnitureArea( rotate, checkboxID, width, length, positionX, positionY, positionZ) {
            if(checkboxID){

            
                //console.log("checkboxID", geometry.uuid)
                let area =await setSpecificArea(checkboxID, width, length)
                area.position.set( positionX,  positionY,  positionZ)
               
                //console.log("area", area, length, width, sizeBB)
                area.rotation.set( 0,rotate,0);
                specificFurnIDList.push({key: input[0], value: geometry.uuid})



                //console.log("specificFurnIDList", specificFurnIDList, noSpecificAreaIndex)
                // addingAreaInFrontOfFurniture(toilet)
                // addingAreaInFrontOfFurniture(sink)

                //console.log(" noSpecificAreaIndex",noSpecificAreaIndex,allSubsetMeshesIDs)

                function addingAreaInFrontOfFurniture(checkID) {
                    if(checkID){
                        const areaRandom = new BoxGeometry(1.5 ,0.005,1.5)
                        const areaRandomMesh = new Mesh(
                            areaRandom,
                            new MeshBasicMaterial({color: greyColor, transparent: true, opacity: 0.2})

                        )
                        if(ReferenceDirections[indexFound].x > 0){
                            areaRandomMesh.position.set(modifiedCenter.x, 0,modifiedCenter.z + 1.5/2 + width/2)
                            areaRandomMesh.uuid = geometry.uuid

                            // areaMeshes[indexFound].geometry.boundingBox.expandByObject(areaRandomMesh);
                            // const boxhelper = new BoxHelper(areaMeshes[indexFound], 0x000000)
                            // scene.add(boxhelper)

                        }

                        if(ReferenceDirections[indexFound].x < 0){
                            areaRandomMesh.position.set(modifiedCenter.x, 0,modifiedCenter.z - 1.5/2 - width/2)
                            areaRandomMesh.uuid = geometry.uuid

                            // //console.log("is obj3d? ", areaRandomMesh.isObject3D,  allSubsetMeshes[indexFound])
                            // areaMeshes[indexFound].add(areaRandomMesh)
                            // allSubsetMeshes[indexFound].geometry.boundingBox.expandByObject(areaRandomMesh);

                            //console.log('bbb', allSubsetMeshes[indexFound].geometry.boundingBox)

                        }
                        if(ReferenceDirections[indexFound].y > 0){
                            areaRandomMesh.position.set(modifiedCenter.x+ 1.5/2 + width/2 , 0,modifiedCenter.z)
                            areaRandomMesh.uuid = geometry.uuid
                            // areaMeshes[indexFound].geometry.boundingBox.expandByObject(areaRandomMesh);
                            // const boxhelper = new BoxHelper(areaMeshes[indexFound], 0x000000)
                            // scene.add(boxhelper)

                        }
                        if(ReferenceDirections[indexFound].y < 0){
                            areaRandomMesh.position.set(modifiedCenter.x - 1.5/2 - width/2 , 0,modifiedCenter.z)
                            areaRandomMesh.uuid = geometry.uuid
                            // areaMeshes[indexFound].geometry.boundingBox.expandByObject(areaRandomMesh);
                            // const boxhelper = new BoxHelper(areaMeshes[indexFound], 0x000000)
                            // scene.add(boxhelper)

                        }
                        // allSubsetMeshes[point].add(centerSphere)
                        // allSubsetMeshes[point].add(areaRandomMesh)

                        // areaMeshes.push(areaRandomMesh)

                        // areaMeshes[point].uuid = allSubsetMeshes[point].uuid

                        scene.add(areaRandomMesh)

                        areasInFront.push(areaRandomMesh)

                    }
                }

                return area
            }
            

        }

        if(ReferenceDirections[indexFound].x > 0){
            //console.log("smaller 0 X")


            area = await  positionFurnitureArea(0, toilet, 0.7, 1.2 + sizeBB.x, modifiedCenter.x + 0.3 , modifiedCenter.y ,modifiedCenter.z - (sizeBB.z  - 0.7)/2)
            area = await  positionFurnitureArea(0,sink,0.55, 0.9 , modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z - (sizeBB.z  - 0.55)/2 )

            area = await  positionFurnitureArea(0,tube,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z + (sizeBB.z + 1.5 )/2 )
            area = await  positionFurnitureArea(0,shower,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z  )


            let sidemax = Math.max(sizeBB.x, sizeBB.z)
            if(sidemax < 1.5){sidemax = 1.5}
            area= await  positionFurnitureArea(0,kitchen,1.4, sidemax, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z + (sizeBB.z + 1.5 )/2 )

            area = await  positionFurnitureArea(0,bed,sizeBB.x + 1.5 , 1.5 + 1.2 + sizeBB.z, modifiedCenter.x -0.15  , modifiedCenter.y ,modifiedCenter.z + 1.5/2)

      
            //area.position.set(modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z + sizeBB.z/2 + area.geometry.parameters.depth / 2 )
        }
        if(ReferenceDirections[indexFound].x < 0){
            //console.log("greater 0 X")
            area = await  positionFurnitureArea(0,toilet, 0.7, 1.2 + sizeBB.x, modifiedCenter.x - 0.3 , modifiedCenter.y ,modifiedCenter.z + (sizeBB.z - 0.7)/2 )
            area = await  positionFurnitureArea(0,sink,0.55, 0.9 , modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z + (sizeBB.z  - 0.55)/2 )

            area = await  positionFurnitureArea(0,tube,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z - (sizeBB.z + 1.5 )/2 )
            area = await  positionFurnitureArea(0,shower,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z  )


            let sidemax = Math.max(sizeBB.x, sizeBB.z)
            if(sidemax < 1.5){sidemax = 1.5}
            area= await  positionFurnitureArea(0,kitchen,1.5, sidemax, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z - (sizeBB.z + 1.5 )/2 )

            area = await  positionFurnitureArea(0,bed,sizeBB.x + 1.5 , 1.5 + 1.2 + sizeBB.z, modifiedCenter.x -0.15  , modifiedCenter.y ,modifiedCenter.z - 1.5/2)
            
        }


        if(ReferenceDirections[indexFound].y > 0){
            //console.log("smaller 0 y")

            area = await  positionFurnitureArea(Math.PI/2, toilet, 0.7, 1.2 + sizeBB.x, modifiedCenter.x - (sizeBB.x  - 0.7)/2 , modifiedCenter.y ,modifiedCenter.z + 0.3 )

            area = await  positionFurnitureArea(Math.PI/2,sink,0.55, 0.9 , modifiedCenter.x - (sizeBB.x  - 0.55)/2  , modifiedCenter.y ,modifiedCenter.z  )
            area = await  positionFurnitureArea(Math.PI/2,tube,1.5, 1.5, modifiedCenter.x + (sizeBB.x + 1.5 )/2   , modifiedCenter.y ,modifiedCenter.z )
            area = await  positionFurnitureArea(Math.PI/2,shower,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z  )

            let sidemax = Math.max(sizeBB.x, sizeBB.z)
            if(sidemax < 1.5){sidemax = 1.5}
            area= await  positionFurnitureArea(Math.PI/2,kitchen,1.5, sidemax, modifiedCenter.x + (sizeBB.x + 1.5 )/2 , modifiedCenter.y ,modifiedCenter.z  )
            area = await  positionFurnitureArea(Math.PI/2,bed,sizeBB.x + 1.5 , 1.5 + 1.2 + sizeBB.z, modifiedCenter.x + 1.5/2   , modifiedCenter.y ,modifiedCenter.z -0.15)

            // if(toilet){
            //     //console.log("toitop", sizeBB.z, sizeBB.z - area.geometry.parameters.depth, area.geometry.parameters.depth,  modifiedCenter.z)
            //     const difference = sizeBB.x - area.geometry.parameters.depth
            //     area.position.set(modifiedCenter.x - difference/2 , modifiedCenter.y ,modifiedCenter.z )

            // } else {

            //     area.position.set(modifiedCenter.x + sizeBB.x/2 + area.geometry.parameters.depth / 2 , modifiedCenter.y ,modifiedCenter.z )
            // }
           

        }

        if(ReferenceDirections[indexFound].y < 0){
            //console.log("greater 0 y")
            area = await  positionFurnitureArea(Math.PI/2, toilet, 0.7, 1.2 + sizeBB.x, modifiedCenter.x + (sizeBB.x  - 0.7)/2 , modifiedCenter.y ,modifiedCenter.z + 0.3 )

            area = await  positionFurnitureArea(Math.PI/2,sink,0.55, 0.9 , modifiedCenter.x + (sizeBB.x  - 0.55)/2  , modifiedCenter.y ,modifiedCenter.z  )
            area = await  positionFurnitureArea(Math.PI/2,tube,1.5, 1.5, modifiedCenter.x - (sizeBB.x + 1.5 )/2   , modifiedCenter.y ,modifiedCenter.z )
            area = await  positionFurnitureArea(Math.PI/2,shower,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z  )

            let sidemax = Math.max(sizeBB.x, sizeBB.z)
            if(sidemax < 1.5){sidemax = 1.5}
            area = await  positionFurnitureArea(Math.PI/2,kitchen,1.5, sidemax, modifiedCenter.x - (sizeBB.x + 1.5 )/2 , modifiedCenter.y ,modifiedCenter.z  )
            area = await  positionFurnitureArea(Math.PI/2,bed,sizeBB.x + 1.5 , 1.5 + 1.2 + sizeBB.z, modifiedCenter.x - 1.5/2   , modifiedCenter.y ,modifiedCenter.z -0.15)
            
        }

    }


}

async function startPositionAllSubsetMeshes(furnitureMeshes){
    for ( let i = 0; i < furnitureMeshes.length; i++){

       const meshid = furnitureMeshes[i].position

       //console.log("meshid", meshid, )
       ////console.log(furnitureMeshes[i].uuid)
        const allIDsFurn = furnitureMeshes[i].uuid
        //console.log(allSubsetMeshes[i].uuid)

        const pickedFurnishingElement = await loader.ifcManager.getItemProperties( 0,allSubsetMeshes[i].uuid );
        // //console.log("furnishingElement: ",pickedFurnishingElement);

        const objectPlacement = pickedFurnishingElement.ObjectPlacement.value
        const ObjectPlacement =  await loader.ifcManager.getItemProperties(0, objectPlacement );
        // //console.log("objectPlacement: ",ObjectPlacement)

        const relativePlacement = ObjectPlacement.RelativePlacement.value
        const RelPlace =  await loader.ifcManager.getItemProperties(0, relativePlacement );
        // //console.log("RelPlace",RelPlace)
        const location = RelPlace.Location.value
        const Location =  await loader.ifcManager.getItemProperties(0, location );
        // //console.log("centerPoints2", areaMeshes[i])
        // //console.log("Location",Location)

        const startPos = new Vector3(Location.Coordinates[0].value, Location.Coordinates[2].value, -Location.Coordinates[1].value)

        startPositionsFurns.push(startPos)
    }
    console.log("startPositionsFurns", startPositionsFurns)
}

async function setNewPosition (event, furnitureMeshes) {


    const updatedPositionsFurniture = [];

    for ( let i = 0; i < furnitureMeshes.length; i++){
        //console.log("centerPoints", centerPoints, allSubsetMeshes, areaMeshes)
        updatedPositionsFurniture.push(furnitureMeshes[i].position)

       const meshid = furnitureMeshes[i].position

       //console.log("meshid", meshid, )
       ////console.log(furnitureMeshes[i].uuid)
        const allIDsFurn = furnitureMeshes[i].uuid
        //console.log(allSubsetMeshes[i].uuid)

        const pickedFurnishingElement = await loader.ifcManager.getItemProperties( 0,allSubsetMeshes[i].uuid );
        // //console.log("furnishingElement: ",pickedFurnishingElement);


        const objectPlacement = pickedFurnishingElement.ObjectPlacement.value
        // const ObjectPlacement =  await loader.ifcManager.getItemProperties(0, objectPlacement );
        // console.log("objectPlacement: ",ObjectPlacement)

        const ObjectPlacements =  await loader.ifcManager.getItemProperties(0, objectPlacement, true );
        console.log("objectPlacement 2: ",ObjectPlacements)

       

        // const relativePlacement = ObjectPlacement.RelativePlacement.value
        // const RelPlace =  await loader.ifcManager.getItemProperties(0, relativePlacement );
        // // //console.log("RelPlace",RelPlace)

        const refDir =  ObjectPlacements.RelativePlacement.RefDirection
        //RelPlace.RefDirection
        console.log("refDir", refDir)
        
        // const location = RelPlace.Location.value
        // const Location =  await loader.ifcManager.getItemProperties(0, location );
        // //console.log("centerPoints2", areaMeshes[i])
        // //console.log("Location",Location)



        // locationSaver.push(Location.Coordinates)

        // console.log("locationSaver", locationSaver, Location)

        for(let j = 0; j < locationSaver.length; j++){
            const sphereLocal = new Mesh(sphereGeometry, new MeshBasicMaterial({color: 0xff0000}))
            sphereLocal.position.set(locationSaver[i][0].value, locationSaver[i][2].value, -locationSaver[i][1].value)
            //scene.add(sphereLocal)
            spheresLocal.push(sphereLocal.position)

        }

        // const referencePointFurnitureX = centerPoints[i].x - locationSaver[i][0].value
        // const referencePointFurnitureZ = centerPoints[i].z + locationSaver[i][1].value
        // ReferenzX.push(referencePointFurnitureX)
        // ReferenzZ.push(referencePointFurnitureZ)
        // //console.log("CoordsFurn", ReferenzX, ReferenzZ)
        // // differenz vom Mittelpunkt substemesh zu sphereLocal Position


        // if (allSubsetMeshes[i].position.z > 0){
        //     ////console.log("negative z", allSubsetMeshes[i].position.z)
        //     allSubsetMeshes[i].position.z = - allSubsetMeshes[i].position.z
        // }



        const center = new Vector3(0,0,0)
        const modiefiedReferenz =  allSubsetMeshes[i].geometry.boundingBox.getCenter(center) 
        
        const modiefiedReferenzX =  modiefiedReferenz.x
        const modiefiedReferenzZ = modiefiedReferenz.z
        const modiefiedReferenzY = modiefiedReferenz.y

        //console.log("1" ,allSubsetMeshes[i].position, allIDsFurn,  modiefiedReferenz)
        
        const sphereLocal = new Mesh(sphereGeometry, new MeshBasicMaterial({color: 0xffff00})) //gelb
        sphereLocal.position.set(modiefiedReferenzX, modiefiedReferenzY, modiefiedReferenzZ)
        //scene.add(sphereLocal)


        const centerArea = new Vector3(0,0,0)
        const modiefiedReferenzArea =  areas[i].position
        

        //console.log("hello", allSubsetMeshes[i].position, allIDsFurn, Location.Coordinates, modiefiedReferenz, modiefiedReferenzArea, ReferencePositionAreas, ReferencePositions)
        
        const sphereLocalArea = new Mesh(sphereGeometry, new MeshBasicMaterial({color: 0xff00ff})) //pink
        sphereLocalArea.position.set(modiefiedReferenzArea.x,1, modiefiedReferenzArea.z)
        //scene.add(sphereLocalArea)

        const sphereLocalArea2 = new Mesh(sphereGeometry, new MeshBasicMaterial({color: 0x0000ff})) //blau
        sphereLocalArea2.position.set( modiefiedReferenzArea.x + ReferencePositions[i].x , modiefiedReferenzArea.y + ReferencePositions[i].y, modiefiedReferenzArea.z + ReferencePositions[i].z)
        //scene.add(sphereLocalArea2)


        const sphereLocalArea3 = new Mesh(sphereGeometry, new MeshBasicMaterial({color: 0x00ff00})) //grün
        sphereLocalArea3.position.set( startPositionsFurns[i].x , 1.3 ,startPositionsFurns[i].z)
        //scene.add(sphereLocalArea3)

        ///Rotation
        if (ObjectPlacements.RelativePlacement.RefDirection == null) {
            refDirNull = new Vector3(1, 0 , 0)
            //console.log(refDirNull)
            
        } else {

            //const refDirection =  await loader.ifcManager.getItemProperties(0, refDir.value );
            ////console.log("refDirect", refDirection, )

            ObjectPlacements.RelativePlacement.RefDirection.DirectionRatios[0].value = modifiedDirections[i].x
            ObjectPlacements.RelativePlacement.RefDirection.DirectionRatios[1].value = modifiedDirections[i].y
            ObjectPlacements.RelativePlacement.RefDirection.DirectionRatios[2].value = modifiedDirections[i].z

            //await loader.ifcManager.ifcAPI.WriteLine(0, refDirection);
            //console.log("referenceVector", refDirection, allIDsFurn )

         }
        ///LOcation
        console.log("R", modifiedDirections[i], ReferenceDirections[i], areas[i].uuid )
        if(modifiedDirections[i].x === ReferenceDirections[i].x && modifiedDirections[i].y === ReferenceDirections[i].y && modifiedDirections[i].z === ReferenceDirections[i].z){
            console.log("equals", modiefiedReferenzArea, ReferencePositions[i])
            ObjectPlacements.RelativePlacement.Location.Coordinates[0].value = ( modiefiedReferenzArea.x +  ReferencePositions[i].x )
            ObjectPlacements.RelativePlacement.Location.Coordinates[1].value =  -(modiefiedReferenzArea.z + ReferencePositions[i].z)
            ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =  modiefiedReferenzArea.y + ReferencePositions[i].y
            
        } else if(modifiedDirections[i].x !== ReferenceDirections[i].x || modifiedDirections[i].y !== ReferenceDirections[i].y || modifiedDirections[i].z !== ReferenceDirections[i].z){
            console.log("unequals", modiefiedReferenzArea, ReferencePositions[i])

            if(modifiedDirections[i].x < 0){
                console.log("x-1", modiefiedReferenzArea, ReferencePositions[i])
                ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =  modiefiedReferenzArea.x + (ReferencePositions[i].z )
                ObjectPlacements.RelativePlacement.Location.Coordinates[1].value =  -(modiefiedReferenzArea.z - ReferencePositions[i].x)
                ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =  modiefiedReferenzArea.y 
                
            }
            if(modifiedDirections[i].x > 0){
                console.log("x+1", modiefiedReferenzArea, ReferencePositions[i])
                ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =  modiefiedReferenzArea.x + ( ReferencePositions[i].z )
                ObjectPlacements.RelativePlacement.Location.Coordinates[1].value =  -(modiefiedReferenzArea.z + (- ReferencePositions[i].x))
                ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =  modiefiedReferenzArea.y 
                
            }
            if(modifiedDirections[i].y < 0){
                console.log("y-1", modiefiedReferenzArea, ReferencePositions[i])
                ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =  modiefiedReferenzArea.x + (ReferencePositions[i].z )
                ObjectPlacements.RelativePlacement.Location.Coordinates[1].value =  -(modiefiedReferenzArea.z + ReferencePositions[i].x)
                ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =  modiefiedReferenzArea.y 
                
            }
            if(modifiedDirections[i].y > 0){
                console.log("y+1", modiefiedReferenzArea, ReferencePositions[i])
                ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =  modiefiedReferenzArea.x - (ReferencePositions[i].x )
                ObjectPlacements.RelativePlacement.Location.Coordinates[1].value =  -(modiefiedReferenzArea.z + ReferencePositions[i].z)
                ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =  modiefiedReferenzArea.y 
                
            }
        }
            
          
        
       
        // locationSaver[i][0].value +
        // locationSaver[i][1].value 
 
        // const ObjectPlacement =  await loader.ifcManager.getItemProperties(0, objectPlacement );
        // await loader.ifcManager.ifcAPI.WriteLine(0, Location);

        await loader.ifcManager.ifcAPI.WriteLine(0, ObjectPlacements.RelativePlacement);
  

       
    }

    const dataFurn = await loader.ifcManager.ifcAPI.ExportFileAsIFC(0);

    blob = new Blob([dataFurn]);


    const file = new File([blob], "./DINable.ifc");


    const downloadbutton = document.getElementById('download-button')
    const link = document.createElement('a');
    link.download = './DINable.ifc';
    link.href = URL.createObjectURL(file);


    downloadbutton.appendChild(link);

    const downloadFile = () => {
        //console.log("downloaded")
        link.click();
        link.remove();};
    downloadbutton.addEventListener('click', downloadFile);




    //console.log("updatedPositionsFurniture", updatedPositionsFurniture)
}



async function getRefDirectionFurniture(){



        const idsFurn= await loader.ifcManager.getAllItemsOfType(0, IFCFURNISHINGELEMENT, false);
        const idsSanitary = await loader.ifcManager.getAllItemsOfType(0, IFCFLOWTERMINAL, false);
        ////console.log("idsFurn", typeof(idsFurn))
        for(let i = 0; i < ids.length; i++) {
            const pickedFurnishingElement = await loader.ifcManager.getItemProperties( 0, ids[i] );
            ////console.log("furnishingElement: ",pickedFurnishingElement);

            const objectPlacement = pickedFurnishingElement.ObjectPlacement.value
            const ObjectPlacement =  await loader.ifcManager.getItemProperties(0, objectPlacement );
            // //console.log("objectPlacement: ",ObjectPlacement)

            const relativePlacement = ObjectPlacement.RelativePlacement.value
            const RelPlace =  await loader.ifcManager.getItemProperties(0, relativePlacement );
            // //console.log("RelPlace",RelPlace)

            const refDir = RelPlace.RefDirection
            ////console.log("refDir", refDir)
            if (refDir == null) {
                refDirNull = new Vector3(1, 0 , 0)
                //console.log(refDirNull)
                ReferenceDirections.push(refDirNull)
            } else {

                const refDirection =  await loader.ifcManager.getItemProperties(0, refDir.value );
                ////console.log("refDirect", refDirection, )
                const refDirectionX = refDirection.DirectionRatios[0].value
                const refDirectionY = refDirection.DirectionRatios[1].value
                const refDirectionZ = refDirection.DirectionRatios[2].value

                const referenceVector = new Vector3(refDirectionX, refDirectionY, refDirectionZ)
                //console.log("referenceVector", referenceVector )


                ReferenceDirections.push(referenceVector)
            }




        }


    ////console.log("ReferenceDirections", ReferenceDirections)

}


async function generateAreaFurniture(lengtharea, widtharea, lastFurnitureFound){

    const areaMesh = new Mesh(
        new BoxGeometry(widtharea,0.01,lengtharea),
        new MeshBasicMaterial({color: greyColor, transparent: true, opacity: 0.7})
    )

   
    areaMesh.position.set(lastFurnitureFound.x,   lastFurnitureFound.y,  lastFurnitureFound.z  )
    return areaMesh

}







async function coordinatesFurniture(id) {
    const pickedFurnishingElement = await loader.ifcManager.getItemProperties( 0, id);
    ////console.log("furnishingElement: ",pickedFurnishingElement);

    const objectPlacement = pickedFurnishingElement.ObjectPlacement.value
    const ObjectPlacement =  await loader.ifcManager.getItemProperties(0, objectPlacement );
    // //console.log("objectPlacement: ",ObjectPlacement)

    const relativePlacement = ObjectPlacement.RelativePlacement.value
    const RelPlace =  await loader.ifcManager.getItemProperties(0, relativePlacement );
    // //console.log("RelPlace",RelPlace)

    const location = RelPlace.Location.value
    const Location =  await loader.ifcManager.getItemProperties(0, location );
    // //console.log("Location",Location)


    const coordinatesX = Location.Coordinates[0].value
    const coordinatesY = Location.Coordinates[1].value
    const coordinatesZ = Location.Coordinates[2].value

    return Location.Coordinates
}



setupProgress();

function setupProgress() {
const text = document.getElementById('progress-text')
loader.ifcManager.setOnProgress((event) => {
    const percent = event.loaded / event.total * 100;
    const formatted = Math.trunc(percent);
    text.innerText = formatted;
})
};

async function wallEdit(found, id) {
    const WallsIDs =  await loader.ifcManager.getAllItemsOfType(found.object.modelID, IFCWALLSTANDARDCASE, false);
    const firstWallID = WallsIDs[found.object.modelID];
    const wall = await loader.ifcManager.getItemProperties( found.object.modelID, id);
    //console.log("wall: ",wall);

    const productDefShape = wall.Representation.value
    const ProductDefShape =  await loader.ifcManager.getItemProperties(found.object.modelID, productDefShape );
    //console.log("Product Def Shape: ",ProductDefShape)

    const representationCurve = ProductDefShape.Representations
    //const RelPlace =  await loader.ifcManager.getItemProperties(0, relplacement );
    //console.log("Representations Curve2D",representationCurve[0])

    const curve = await loader.ifcManager.getItemProperties(found.object.modelID, representationCurve[0].value );
    // //console.log("Shape Repr",curve.Items[found.object.modelID].value)
    const curveItems = curve.Items[0].value
    const items = await loader.ifcManager.getItemProperties(found.object.modelID, curveItems);
    //console.log("Items", items)

    const representationSolid = ProductDefShape.Representations
    //const RelPlace =  await loader.ifcManager.getItemProperties(0, relplacement );
    //console.log("Representations solid",representationSolid[1])

    const solid = await loader.ifcManager.getItemProperties(found.object.modelID, representationSolid[1].value );
    // //console.log("Shape Repr",curve.Items[found.object.modelID].value)
    const SolidItems = solid.Items[0].value
    const Solids = await loader.ifcManager.getItemProperties(found.object.modelID, SolidItems);
    //console.log("Itemssolid", Solids)

    const areaSwept = Solids.SweptArea
    const sweptArea = await loader.ifcManager.getItemProperties(found.object.modelID, areaSwept.value);
    //console.log("sweptArea", sweptArea)

    const outerCrv = sweptArea.OuterCurve
    const Outercrv = await loader.ifcManager.getItemProperties(found.object.modelID, outerCrv.value);
    //console.log("OuterCrv", Outercrv)

    const UserInput = prompt("geben sie den x Wert ein:");
    var a = parseInt(UserInput);

    const b = 0;

    for (let i = 0; i < Outercrv.Points.length; i++) {
         //Point 0 out
        const outerPoints = Outercrv.Points[i]
        //console.log("points forloop: ", outerPoints)
        const OuterPoints = await loader.ifcManager.getItemProperties(found.object.modelID, outerPoints.value);

        OuterPoints.Coordinates[0].value =OuterPoints.Coordinates[0].value + a
        OuterPoints.Coordinates[1].value = OuterPoints.Coordinates[1].value + b

        await loader.ifcManager.ifcAPI.WriteLine(found.object.modelID, OuterPoints);
    }

    data = await loader.ifcManager.ifcAPI.ExportFileAsIFC(found.object.modelID);
    blob = new Blob([data]);
    const file = new File([blob], "./changes.ifc");

    const downloadbutton = document.getElementById('download-button')
    const link = document.createElement('a');
    link.download = './changes.ifc';
    link.href = URL.createObjectURL(file);


    downloadbutton.appendChild(link);

    const downloadFile = () => {
        //console.log("downloaded")
        link.click();
        link.remove();};
    downloadbutton.addEventListener('click', downloadFile);
}




// Tree view

const toggler = document.getElementsByClassName("caret");
for (let i = 0; i < toggler.length; i++) {
    toggler[i].onclick = () => {
        toggler[i].parentElement.querySelector(".nested").classList.toggle("active");
        toggler[i].classList.toggle("caret-down");
    }
}

// Spatial tree menu

function createTreeMenu(ifcProject, id) {
    const root = document.getElementById(id);
    removeAllChildren(root);
    const ifcProjectNode = createNestedChild(root, ifcProject);

    ifcProject.children.forEach(async child => {
        await constructTreeMenuNode(ifcProjectNode, child);
    })
}

function nodeToString(node) {
    return `${node.expressID}`

}

async function constructTreeMenuNode(parent, node) {
    const children = node.children;

    if (children.length === 0) {
        await createSimpleChild(parent, node);
        return;
    // }
    // else {
    //     for( let i = 0; i < children.length; i++){
    //         //console.log("child", children[i].type)
    //         if(children[i].type === 'IFCFURNISHINGELEMENT') {
    //             for(let id = 0; id < noIntersectionsIDs.length; id++){
    //                 if(children[i].expressID === noIntersectionsIDs[id]) {
    //                     node.expressID
    //                     //console.log("no int",children[i].expressID , noIntersectionsIDs[id], node)

    //                 }
    //             }

    //             ////console.log(children[i].expressID)
    //         }
    //     }


    }

    const nodeElement = createNestedChild(parent, node);

    children.forEach(async child => {
        await constructTreeMenuNode(nodeElement, child);
    })
}

function createNestedChild(parent, node) {
    const content = nodeToString(node);
    const root = document.createElement('li');
    createTitle(root, content + `- ${node.type}`);
    const childrenContainer = document.createElement('ul');
    childrenContainer.classList.add("activetree");
    root.appendChild(childrenContainer);
    parent.appendChild(root);
    return childrenContainer;
}

function createTitle(parent, content) {
    const title = document.createElement("span");
    title.classList.add("caret");

    title.onclick = () => {
        title.parentElement.querySelector(".nested").classList.toggle("activetree");
        title.classList.toggle("caret-down");
    }
    title.textContent = content
    parent.appendChild(title);
}

const listIdOthers = [];
let allEntitiesInFile = [];
let collisionType;
async function createSimpleChild(parent, node) {
    const content = nodeToString(node);
    ////console.log(node.type)
    const childNode = document.createElement('li');
    childNode.classList.add('leaf-node');


    childNode.textContent = content;
    ////console.log("nodes", typeof(childNode.textContent), truePositions, childNode)

    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsAreaIntersectArea)
    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsAreaContainArea)
    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsFurnContainFurn)
    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsFurnIntersectFurn)
    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsFurnContainArea)
    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsFurnIntersectArea)
    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsAreaContainFurn)
    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsAreaIntersectWall)
    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsAreaContainWall)
    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsFurnIntersectWall)
    // getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsFurnContainWall)

    //colorForNodesIntersection(noIntersectionsIDs, '#4CBB17',childNode, 'noIntersection', parent)
    function getHierarchieOfCollisions(IntersectionsIDs, IntersectionsIDsAreaIntersectArea) {
        for (let id = 0; id < IntersectionsIDs.length; id++) {
            const indexAreaIntersectArea = IntersectionsIDsAreaIntersectArea.indexOf(IntersectionsIDs[id])
            ////console.log( "filter", indexAreaIntersectArea,IntersectionsIDs[id], IntersectionsIDsAreaIntersectArea[indexAreaIntersectArea])
            if(indexAreaIntersectArea > -1) {
                 IntersectionsIDsAreaIntersectArea.splice(indexAreaIntersectArea, 1)
                 ////console.log( "IntersectionsIDsAreaIntersectArea",IntersectionsIDsAreaIntersectArea)
            }

         }
    }

    colorForNodes(IntersectionsIDsAreaIntersectWall, '#8137be', childNode,parent, content, node, " Kollision mit einer Wand" )
    colorForNodes(IntersectionsIDsAreaContainWall, '#8137be', childNode,parent, content, node, " Die Bewegungsfläche enthält die Wand" )
    colorForNodes(IntersectionsIDsFurnIntersectWall, '#8137be', childNode,parent, content, node, " Ein Möbel kollidiert mit der Wand " )
    colorForNodes(IntersectionsIDsFurnContainWall, '#8137be', childNode,parent, content, node, " Ein Möbel enthält die Wand." )

    colorForNodes(IntersectionsIDsFurnIntersectFurn, '#570042', childNode,parent, content, node, "Möbel überschneiden sich." )
    colorForNodes(IntersectionsIDsAreaContainFurn, '#296017', childNode,parent, content, node, "Bewegungsfläche und Möbel enthalten sich." )
    colorForNodes(IntersectionsIDsFurnContainArea, '#296017', childNode,parent, content, node, "Möbel und Bewegungsfläche enthalten sich." )
    colorForNodes(IntersectionsIDsFurnContainFurn, '#504b13', childNode,parent, content, node, "Möbel enthalten sich." )
    colorForNodes(IntersectionsIDsAreaContainArea, '#67116e', childNode,parent, content, node, "Bewegungsflächen enthalten sich." )
    colorForNodes(IntersectionsIDsFurnIntersectArea, '#99244f', childNode,parent, content, node, "Kollision eines Möbels mit mindestens einer Bewegungsfläche" )
    colorForNodes(IntersectionsIDs, '#99244f', childNode,parent, content, node, "Kollision eines Möbels mit mindestens einer Bewegungsfläche" )
    colorForNodes(IntersectionsIDsAreaIntersectArea, '#007050', childNode,parent, content, node, "Bewegungsflächen überlagern sich DIN-konform." )




    for(let u = 0; u < allSubsetMeshes.length; u++){
        const occurenceID = getOccurence(noIntersectionsIDs, allSubsetMeshes[u].uuid)
        for(let p = 0; p < wallSubsetMeshes.length; p++){
            const occurenceIDwall = getOccurence(noIntersectionsIDs, wallSubsetMeshes[p].uuid)
            ////console.log("occurendce", occurenceIDwall, occurenceID)

            if(occurenceID === 0 && occurenceIDwall === 0) {
                ////console.log("occ",allSubsetMeshes[u].uuid)
                noIntersectionsIDs.push(allSubsetMeshes[u].uuid)
            }
        }

    }

    colorForNodes(noIntersectionsIDs, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm
    // colorForNodes(noIntersectionsIDsAreaContainFurn, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm
    // colorForNodes(noIntersectionsIDsAreaIntersectArea, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm
    // colorForNodes(noIntersectionsIDsAreaContainArea, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm
    // colorForNodes(noIntersectionsIDsFurnIntersectFurn, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm
    // colorForNodes(noIntersectionsIDsFurnContainFurn, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm

    //colorForNodes(wallSubsetMeshesIDs, '#4CBB17', childNode,parent, content, node, "Wand" ) //grüm

    colorForNodesNoCollisionCheck ( '#000000', childNode, content, node)


    //colorForNodesIntersection(IntersectionsIDs, '#C70039',childNode, 'noIntersection', parent, content) //rot

    //childNode.textContent = content + `- ${node.type}`;
    parent.appendChild(childNode );

    collisionTypeText(intersectionidHTML, noIntersectionsIDs, childNode,'#C70039', content, parent)

    childNode.onpointerenter =  (event) => prepickByID(event, hightlightMaterial, hightlightMaterialSecond, [node.expressID]);

    parent.onpointerup =  (event) => pickCheckbox(event, hightlightMaterial, hightlightMaterialSecond, [node.expressID]);

        //await loader.ifcManager.selector.prepickIfcItemsByID(0, [node.expressID])


    childNode.onpointerdown =  (event) => pickByIDClick(event, selectionMaterial, hightlightMaterialSecond, [node.expressID]);
    //canvas.ondblclick = (event) =>  pickFurnitureSecond(event, allSubsetMeshes, areas) ; //cubes

}
function checkRadioValue(event, radiobuttons){
    let value;
    for(let i = 0; i < radiobuttons.length; i++){
        if(radiobuttons[i].type === 'radio' && radiobuttons[i].checked) {
            value = radiobuttons[i].value

            ////console.log(value)

        }
    }
}
const noIntersectionidHTML = [];
function colorForNodes (liste, colorNode, childNode, parent, content, node, text) {
    const specificID = [];
    let occNumber;
    
    // = document.createElement('p');
    // occNumber.classList.add('container');
    // occNumber.style.paddingLeft = '102px';
    // occNumber.style.fontSize = '8px'

    //occNumber.textContent = 'hello'
    for(let i = 0; i < liste.length; i++){
        let idsfurniture = liste[i].toString();
        if(childNode.textContent ===  idsfurniture){
            
           
            //  console.log("allLists", allLists, " ---",
            //  IntersectionsIDsAreaIntersectArea, 
            //  IntersectionsIDsAreaContainArea,
            //  IntersectionsIDsFurnIntersectFurn,
            //  IntersectionsIDsFurnContainFurn,
            //  IntersectionsIDsFurnIntersectArea,
            //  IntersectionsIDsFurnContainArea,
            //  IntersectionsIDs,
            //  IntersectionsIDsAreaIntersectWall,
            //  IntersectionsIDsAreaContainWall,
            //  IntersectionsIDsFurnIntersectWall,
            //  IntersectionsIDsFurnContainWall,
            //  IntersectionsIDsAreaContainFurn )

            ////console.log("childNode greem", childNode.textContent, content)
            ////console.log("true", childNode, idsfurniture, ids)
            childNode.style.color = colorNode; //green
            childNode.style.padding = '10px 0px 0px 0px'
            
            noIntersectionidHTML.push(idsfurniture)


            for (let id = 0; id < specificFurnIDList.length; id++){
                specificID.push(specificFurnIDList[id].value)
                ////console.log("test", specificFurnIDList[id].value)


                    if(specificFurnIDList[id].value == childNode.textContent ) {
                        //console.log("content", childNode.textContent , [id])
                        if(id == 2){
                            node.type = 'WC'
                        }
                        if(id == 0){
                            node.type = 'Bett'
                        }
                        if(id == 3){
                            node.type = 'Waschtisch'
                        }
                        if(id == 4){
                            node.type = 'Badewanne'
                        }
                        if(id == 5){
                            node.type = 'Dusche'
                        }
                        if(id == 1){
                            node.type = 'Küchenzeile'
                        }

                    } else {
                        if(node.type == 'IFCFURNISHINGELEMENT') {
                            node.type = 'Sonstiges Möbel'
                        }
                        if(node.type == 'IFCFLOWTERMINAL') {
                            node.type = 'Sanitärmöbel'
                        }

                    }



            }


            // if(node.type == 'IFCFURNISHINGELEMENT') {
            //     node.type = 'Möbel'
            // }

            const radiobox = document.createElement('input');
            radiobox.type = 'radio';
            radiobox.id = idsfurniture;
            radiobox.name = 'noIntersection'
            radiobox.value = idsfurniture

            radiobox.classList.add('container');


            const radioDot = document.createElement('span');
            radioDot.classList.add('dot');
            radioDot.style.left = '-25px';
            radioDot.style.top = '10px';

            const label = document.createElement('label')
            label.classList.add('container')

            label.appendChild(radiobox);
            label.appendChild(radioDot);

            //label.appendChild(occNumber)

            for(let p = 0; p < allIDsInChecker.length; p++){
                const occurence =  allLists.filter(x => x === allIDsInChecker[p]).length 
                //console.log("occurence", occurence, allIDsInChecker[p], content, childNode.textContent, node)
                
                    if(node.expressID === allIDsInChecker[p]){
                        
                        childNode.textContent = content + `- ${node.type}` + ` - ${text}`  +  `- Anzahl Kollisionen: ${occurence}`
                    }
             }
           



            //label.appendChild(textCollision)


            // const infobutton = document.createElement('button');
            // infobutton.textContent  = 'i'

            // infobutton.id = idsfurniture;
            // infobutton.classList.add('infobutton');
            // //infobutton.classList.add('hover-round');
            // infobutton.classList.add('infobutton:hover');
            // //infobutton.classList.add('close-button');
            // infobutton.style.marginTop = 0;

            // // infobutton.style.border = 'solid'

            // infobutton.style.borderRadius = '50%';
            // infobutton.style.paddingLeft = '8px';
            // infobutton.style.paddingBottom = '4px';
            // infobutton.style.paddingRight = '8px';
            // infobutton.style.height = '20px'


            deleteButton = document.createElement('button');
            deleteButton.textContent = '+';
            deleteButton.className = 'label-container';

            const labelBase = document.createElement('div');
            labelBase.className = ' delete-button hidden '
            labelBase.style.backgroundColor = 'rgba(255,255,255,0.5)'

            //const btn = document.getElementById('storymode')
            

            radiobox.onclick= () => {

                moreInformationPlusButton( 'Küchenzeile',
                "DIN 18040-2: 2011-09: 5.4 Wohn- Schlafräume und Küchen",
                "Wohn-, Schlafräume und Küchen sind für Menschen mit motorischen Einschränkungen bzw. für Rollstuhl- nutzer barrierefrei nutzbar, wenn sie so dimensioniert sind, dass bei nutzungstypischer Möblierung jeweils ausreichende Bewegungsflächen vorhanden sind. Bewegungsflächen dürfen sich überlagern.",
                "Vor Kücheneinrichtungen ist eine Bewegngsfläche von 120cm vorzusehen.",
                "Vor Kücheneinrichtungen ist eine Bewegngsfläche von 150cm vorzusehen. Bei der Planung der haustechnischen Anschlüsse in einer Küche für Rollstuhlnutzer ist die Anordnung von Herd, Arbeitsplatte und Spüle übereck zu empfehlen.")

                moreInformationPlusButton( 'Dusche',
                "DIN 18040-2: 2011-09: 5.5.5 Duschplätze",
                "Duschplätze müssen so gestaltet sein, dass sie barrierefrei z. B. auch mit einem Rollator bzw. Rollstuhl nutz- bar sind.  ",
                "Dies wird erreicht durch: die niveaugleiche Gestaltung zum angrenzenden Bodenbereich des Sanitärraumes und einer Absenkung von max. 2 cm; ggf. auftretende Übergänge sollten vorzugsweise als geneigte Fläche ausgebildet werden; rutschhemmende Bodenbeläge im Duschbereich (sinngemäß nach GUV-I 8527 mindestens Bewertungs- gruppe B). Die Fläche des Duschplatzes kann in die Bewegungsflächen des Sanitärraumes einbezogen werden, wenn der Übergang zum Duschplatz bodengleich gestaltet ist und wenn die zur Entwässerung erforderliche Neigung max. 2 % beträgt.",
                "Die Nachrüstmöglichkeit für einen Dusch-Klappsitz, in einer Sitzhöhe von 46 cm bis 48 cm; beidseitig des Dusch-Klappsitzes eine Nachrüstmöglichkeit für hochklappbare Stützgriffe, deren Oberkante 28 cm über der Sitzhöhe liegt. Eine Einhebel-Duscharmatur mit Handbrause muss aus der Sitzposition in 85 cm Höhe über OFF erreichbar sein. Um Verletzungsgefahren insbesondere für blinde und sehbehinderte Menschen beim Vorbeugen zu ver- meiden, sollte der Hebel von Einhebel-Dusch-Armaturen nach unten weisen.")

                moreInformationPlusButton( 'Badewanne',
                "DIN 18040-2: 2011-09: 5.5.6 Badewannen",
                " ",
                "Das nachträgliche Aufstellen einer Badewanne z. B. im Bereich der Dusche sollte möglich sein.",
                "Das nachträgliche Aufstellen einer Badewanne z. B. im Bereich der Dusche muss möglich sein. Sie muss mit einem Lifter nutzbar sein.")


                moreInformationPlusButton( 'Waschtisch',
                "DIN 18040-2: 2011-09: 5.5.4 Waschplätze",
                "Waschplätze müssen so gestaltet sein, dass eine Nutzung auch im Sitzen möglich ist.",
                "Dies wird mit folgenden Maßnahmen erreicht: 1. bauseitige Möglichkeit, einen mindestens 100 cm hohen Spiegel bei Bedarf unmittelbar über dem Waschtisch anzuordnen; 2. Beinfreiraum unter dem Waschtisch;",
                "1. Vorderkantenhöhe des Waschtisches von max. 80 cm über OFF; 2. Unterfahrbarkeit von mindestens 55 cm Tiefe und Abstand der Armatur zum vorderen Rand des Waschtisches von höchstens 40 cm (siehe Bild 16); 3. Beinfreiraum unter dem Waschtisch mit einer Breite von mindestens 90 cm (axial gemessen); Angaben zu den erforderlichen gestaffelten Höhen und Tiefen (siehe Bild 16); 4. einem mindestens 100 cm hohen Spiegel, der unmittelbar über dem Waschtisch angeordnet ist.")

                moreInformationPlusButton( 'WC',
                "DIN 18040-2: 2011-09: 5.5.3 WC-Becken",
                "",
                "Zur leichteren Nutzbarkeit des WC-Beckens ist ein seitlicher Mindestabstand von 20 cm zur Wand oder zu anderen Sanitärobjekten einzuhalten.",
                "Zweckentsprechend angeordnet sind WC-Becken mit 1.einer Höhe des WC-Beckens einschließlich Sitz zwischen 46 cm und 48 cm über OFF. 2. Ausreichende Bewegungsflächen neben WC-Becken sind. 2.1 mindestens 70 cm tief, von der Beckenvorderkante bis zur rückwärtigen Wand; 2.2 mindestens 90 cm breit an der Zugangsseite und für Hilfspersonen mindestens 30 cm breit an der gegenüberliegenden Seite (siehe Bild 12). In Gebäuden mit mehr als einer Wohneinheit für uneingeschränkte Rollstuhlnutzung sind die Zu- gangsseiten abwechselnd rechts oder links vorzusehen. 3. Folgende Bedienelemente und Stützen sind erforderlich: 3.1 Rückenstütze, angeordnet 55 cm hinter der Vorderkante des WC-Beckens. Der WC-Deckel ist als alleinige Rückenstütze ungeeignet; 3.2 Spülung, mit der Hand oder dem Arm bedienbar, im Greifbereich des Sitzenden, ohne dass der Benutzer die Sitzposition verändern muss. Wird eine berührungslose Spülung verwendet, muss ihr ungewolltes Auslösen ausgeschlossen sein; 3.3 Toilettenpapierhalter, erreichbar ohne Veränderung der Sitzposition; 3.4 Stützklappgriffe. 4. Stützklappgriffe müssen folgende Anforderungen erfüllen (siehe auch Bild 13): 4.1 auf jeder Seite des WC-Beckens montiert; 4.2 hochklappbar; 4.3 15 cm über die Vorderkante des WC-Beckens hinausragend; 4.4 bedienbar mit wenig Kraftaufwand in selbst gewählten Etappen; 4.5 Abstand zwischen den Stützklappgriffen 65 cm bis 70 cm; 4.6 Oberkante über der Sitzhöhe 28 cm; 4.7 Befestigung, die einer Punktlast von mindestens 1 kN am Griffende standhält. ANMERKUNG Es wird z. B. unterschieden zwischen Stützklappgriffen mit und ohne Feder. Die Klappgriffe mit Feder können mit geringerem Kraftaufwand beim Hochklappen bedient werden.")

                moreInformationPlusButton( 'Bett',
                "DIN 18040-2: 2011-09: 5.4  Wohn- Schlafräume und Küchen",
                "Wohn-, Schlafräume und Küchen sind für Menschen mit motorischen Einschränkungen bzw. für Rollstuhl- nutzer barrierefrei nutzbar, wenn sie so dimensioniert sind, dass bei nutzungstypischer Möblierung jeweils ausreichende Bewegungsflächen vorhanden sind.",
                "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei mindestens einem Bett: 120 cm entlang der einen und 90 cm entlang der anderen Längsseite;",
                "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei mindestens einem Bett: 150 cm entlang der einen und 120 cm entlang der anderen Längsseite;")

                moreInformationPlusButton( 'Sonstiges Möbel',
                "DIN 18040-2: 2011-09: 5.4  Wohn- Schlafräume und Küchen",
                "Wohn-, Schlafräume und Küchen sind für Menschen mit motorischen Einschränkungen bzw. für Rollstuhl- nutzer barrierefrei nutzbar, wenn sie so dimensioniert sind, dass bei nutzungstypischer Möblierung jeweils ausreichende Bewegungsflächen vorhanden sind.",
                "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei sonstigen Möbeln: vor sonstigen Möbeln: 90cm;",
                "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei sonstigen Möbeln: 150cm;")

                moreInformationPlusButton( 'Sanitärmöbel',
                "DIN 18040-2: 2011-09: 5.5 Sanitärräume",
                "In einer Wohnung mit mehreren Sanitärräumen muss mindestens einer der Sanitärräume barrierefrei nutzbar sein. Mit den Anforderungen dieses Abschnitts der Norm sind Sanitärräume sowohl für Menschen mit motorischen Einschränkungen bzw. für Rollstuhlnutzer als auch für blinde und sehbehinderte Menschen barrierefrei nutzbar. Aus Sicherheitsgründen dürfen Drehflügeltüren nicht in Sanitärräume schlagen, um ein Blockieren der Tür zu vermeiden. Türen von Sanitärräumen müssen von außen entriegelt werden können. Armaturen sollten als Einhebel- oder berührungslose Armatur ausgebildet sein. Berührungslose Armaturen dürfen nur in Verbindung mit Temperaturbegrenzung eingesetzt werden. Um ein Verbrühen zu vermeiden, ist die Wassertemperatur an der Auslaufarmatur auf 45 °C zu begrenzen. Die Ausstattungselemente sollten sich visuell kontrastierend von ihrer Umgebung abheben (z. B. heller Waschtisch/dunkler Hintergrund oder kontrastierende Umrahmungen). Die Wände von Sanitärräumen sind bauseits so auszubilden, dass sie bei Bedarf nachgerüstet werden können mit senkrechten und waagerechten Stütz- und/oder Haltegriffen neben dem WC-Becken sowie im Bereich der Dusche und der Badewanne. Ist ein Sanitärraum ausschließlich über ein Fenster zu lüften, ist zur Bedienbarkeit 5.3.2 zu beachten."  ,
                "Jeweils vor den Sanitärobjekten wie WC-Becken, Waschtisch, Badewanne und im Duschplatz ist eine Bewegungsfläche anzuordnen. Ausreichend ist eine Mindestfläche von 120cm×120cm;",
                "Jeweils vor den Sanitärobjekten wie WC-Becken, Waschtisch, Badewanne und im Duschplatz ist eine Bewegungsfläche anzuordnen. Ausreichend ist eine Mindestfläche von 120cm×120cm;",
                "Jeweils vor den Sanitärobjekten wie WC-Becken, Waschtisch, Badewanne und im Duschplatz ist eine Bewegungsfläche anzuordnen. Ausreichend ist eine Mindestfläche von 150cm×150cm;")


                function moreInformationPlusButton(nodetype, headerText, moreInfo, rules, rulesR){
                    if( node.type == nodetype.toString() ) {
                        //console.log('info '+ radiobox.id )

                        //labelBase.textContent = moreInfo.toString()
                        const header = document.createElement('h3');
                        header.textContent = headerText.toString()
                        labelBase.appendChild(header)

                        const enter = document.createElement('br');
                        labelBase.appendChild(enter)

                        const info = document.createElement('p');
                        info.textContent = moreInfo.toString()
                        labelBase.appendChild(info)

                        const enter2 = document.createElement('br');
                        labelBase.appendChild(enter2)

                        const ruletext = document.createElement('h4');
                        ruletext.textContent = "In einer barrierefrei nutzbaren Wohnung: " + rules.toString()
                        labelBase.appendChild(ruletext)

                        const enter3 = document.createElement('br');
                        labelBase.appendChild(enter3)

                        const ruletextR = document.createElement('h4');
                        ruletextR.textContent = "In einer Wohnung im R-Standard: " +  rulesR.toString()
                        labelBase.appendChild(ruletextR)

                        deleteButton.appendChild(labelBase)

                        const labelObject = new CSS2DObject(deleteButton);


                        for(id = 0; id < areas.length; id++){
                            if(areas[id].uuid == content) {

                                //console.log("ID Position", areas[id].position, areas[id], areas, id)
                                labelObject.position.set(areas[id].position.x, areas[id].position.y , areas[id].position.z)
                            }
                        }



                        labelObjects.push(labelObject)

                        // scene.add(labelObjects[1]);


                        labelBase.onclick = () => {
                            labelObject.removeFromParent();
                            labelObject.element = null;
                            labelBase.remove();
                        }

                      

                        deleteButton.onmouseenter = () => {
                            labelBase.classList.remove('hidden')
                        }
                        deleteButton.onmouseleave = () => {
                            labelBase.classList.add('hidden')
                        }

                        scene.add(labelObject)
                       
                       

                    }

                }

            }

            //label.appendChild(infobutton);

            parent.appendChild(label);

        }

    }


}

function colorForNodesNoCollisionCheck ( colorNode, childNode, content, node) {

        if(childNode.textContent === content){

            //console.log("childNode undef", childNode.textContent, content)
            ////console.log("true", childNode, idsfurniture, ids)
            childNode.style.color = colorNode; //green
            childNode.style.padding = '10px 0px 0px 0px'

            // if(node.type == 'IFCFURNISHINGELEMENT') {
            //     node.type = 'Möbel'
            // }

            childNode.textContent = content + `- ${node.type}`



        }

    }



const intersectionidHTML = [];
function colorForNodesIntersection (liste, colorNode, childNode, nameNode, parent, content) {

    for(let i = 0; i < liste.length; i++){
        let idsfurniture = liste[i].toString();
        if(childNode.textContent ===  idsfurniture){
            //console.log("childNode red", childNode)
            ////console.log("true", childNode, idsfurniture, ids)
            childNode.style.color = colorNode; //green
            //childNode.style.marginBottom = '-20px';

            radiobox = document.createElement('input');
            radiobox.type = 'radio';
            radiobox.id = idsfurniture;
            radiobox.name = nameNode
            radiobox.value = idsfurniture

            radiobox.classList.add('container');


            const radioDot = document.createElement('span');
            radioDot.classList.add('dot');
            radioDot.style.left = '-25px';
            radioDot.style.top = '10px';

            const label = document.createElement('label')
            label.classList.add('container')



            label.appendChild(radiobox);
            label.appendChild(radioDot);
            //label.appendChild(textCollision)
            parent.appendChild(label);

            intersectionidHTML.push(idsfurniture)

            // const info = document.createElement('button');

            // info.classList.add('containerButton');
            // //info.classList.add('info-button');
            // info.innerText = "i"
            // label.appendChild(info)
        } else {
            //intersectionidHTML.push(idsfurniture)

        }



    }


}

function collisionTypeText(liste, noListe, childNode,colorNode, content, parent) {
    const textCollision = document.createElement('p');
    const textNoCollision = document.createElement('p');


    for(let id = 0; id < allSubsetMeshes.length; id++) {
        const allids = allSubsetMeshes[id].uuid.toString()
        idMeshToString.push(allids)

    }
    for(let d = 0; d < areas.length; d++) {
        const areaID = areas[d].uuid.toString()
        const includesID = liste.includes(areaID)
       // //console.log("includesID",includesID)
        if(includesID) {
            //console.log("areaID", areaID)
            const idindex = idMeshToString.indexOf(areaID)
            ////console.log(areas[idindex])
            if(areas[idindex].material.color === furnClashAreaColor) {
                textCollision.classList.add('containerText')
                ////console.log("found area", areas[idindex])
                textCollision.innerText =  " Möbel -" + `${ content }`+ "- kollidiert mit mindestens einer Bewegungsfläche "
                textCollision.style.paddingLeft = '0px';
                textCollision.style.marginBottom = '0px';
                textCollision.style.paddingTop = '5px';
                textCollision.style.color = '#858585'; //

                ////console.log(textCollision)
                textCollision.id = areaID;

                textCollision.style.visibility = 'hidden';
                parent.appendChild(textCollision)
            }
        }
        if(noListe.includes(areaID)) {

            const idindex = idMeshToString.indexOf(areaID)
            //console.log("no areaid", areaID, idindex)
                for(let b = 0; b < noListe.length; b++){
                    //console.log("no areaid 2", areas[idindex].material.color)
                    if(areas[idindex].material.color === greyColor) {
                        //console.log("no areaid 3")
                        textNoCollision.classList.add('containerTextNot')
                        ////console.log("found area", areas[idindex])
                        textNoCollision.innerText =  " Möbel -" + `${ content }`+ "- kollidiert mit keiner Bewegungsfläche "
                        textNoCollision.style.paddingLeft = '0px';
                        textNoCollision.style.marginBottom = '0px';
                        textNoCollision.style.paddingTop = '5px';
                        textNoCollision.style.color = '#858585';
                        ////console.log(textNoCollision)
                        textNoCollision.id = areaID;

                        textNoCollision.style.visibility = 'visible';
                        parent.appendChild(textNoCollision)
                    }
                }




            // //console.log("areaID NO", areaID, areas.indexOf(areaID))
            // for(let c= 0; c < areas.length; c++){
            //     if(areas[c].uuid === areaID) {
            //         //console.log("tgsufj",areas[c], c, allSubsetMeshes[c])

            // const idindex = allSubsetMeshes[c]
            // ////console.log(areas[idindex])
            // //if(areas[idindex].material.color === greyColor) {
            //     textCollision.classList.add('containerTextNot')
            //     ////console.log("found area", areas[idindex])
            //     textCollision.innerText =  " Möbel -" + `${ content }`+ "- kollidiert NICHT mit  einer Bewegungsfläche "
            //     textCollision.style.paddingLeft = '0px';
            //     textCollision.style.marginBottom = '0px';
            //     textCollision.style.paddingTop = '5px';
            //     textCollision.style.color = '#858585';

            //     ////console.log(textCollision)
            //     textCollision.id = areaID;

            //     textCollision.style.visibility = 'hidden';
            //     parent.appendChild(textCollision)
            //                 }
            // }

            //}
        }


        }
    }

    // for(let i = 0; i < liste.length; i++){
    //         //console.log("liste", liste)

    //             // if(areaID !== liste[i]){
    //             //     //console.log("material", areaID, areas[d].material, furnClashAreaColor, liste[i])

    //             // if(areas[d].material.color === furnClashAreaColor ){
    //             //     //console.log("beere furn clash area")
    //             //     textCollision.innerText =  " Möbel -" + `${ content }`+ "- kollidiert mit mindestens einer Bewegungsfläche "
    //             //     textCollision.style.paddingLeft = '0px';
    //             //     textCollision.style.marginBottom = '0px';
    //             //     textCollision.style.paddingTop = '5px';
    //             //     textCollision.style.color = '#858585';

    //             //     ////console.log(textCollision)
    //             //     textCollision.id = areaID;

    //             //     textCollision.style.visibility = 'hidden';
    //             //     parent.appendChild(textCollision)



    //             //     }
    //             }
    //         }
    //     }



//    childNode.onmouseenter()=  (event) =>  visibilityNode(event, textCollision)
//         function visibilityNode(event, textCollision) {
//             textCollision.style.visibility = 'hidden'
//         }

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}



let objectData ={
    "expressID": 186,
    "type": [],
    "GlobalId": {
        "type": 1,
        "value": "2idC0G3ezCdhA9WVjWemc$"
    },
    "OwnerHistory": {},
    "Name": {
        "type": 1,
        "value": "Muro b\\X2\\00E1\\X0\\sico:Partici\\X2\\00F3\\X0\\n con capa de yeso:163541"
    },
    "Description": null,
    "ObjectType": {},
    "ObjectPlacement": {},
    "Representation": {},
    "Tag": {},
    "psets": [
        {
            "expressID": 253,
            "type": 1451395588,
            "GlobalId": {
                "type": 1,
                "value": "3LVpPLOTD8Y8ACz1_oabXX"
            },
            "OwnerHistory": {},
            "Name": {
                "type": 1,
                "value": "Pset_ReinforcementBarPitchOfWall"
            },
            "Description": null,
            "HasProperties": [
                {
                    "expressID": 252,
                    "type": 3650150729,
                    "Name": {
                        "type": 1,
                        "value": "Reference"
                    },
                    "Description": null,
                    "NominalValue": {
                        "type": 2,
                        "label": "IFCLABEL",
                        "valueType": 1,
                        "value": "Partici\\X2\\00F3\\X0\\n con capa de yeso"
                    },
                    "Unit": null
                }
            ]
        },
    ],
    "mats": []
}

function createPset(objectData){
    let newPset = {}
    newPset.expressID = 254
    newPset.type = objectData.psets[0].type
    newPset.GlobalId ={
        'type' : 1,
        'value' : "3LVpPLOTD8Y8ACz1_IFCJS"
    }
    newPset.OwnerHistory = {}
    newPset.Name = {
        'type' : 1,
        'value' : 'Pset_Ifcjs'
    }
    newPset.Description = null
    newPset.HasProperties = []

    return newPset
}

let newPset = createPset(objectData)
objectData.psets = [...objectData.psets, ...[newPset]]
newPset.Name.value = 'Pset_Edit'
//console.log(objectData)




animate();