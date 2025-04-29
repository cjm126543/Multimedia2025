import * as THREE from 'three';

//import { VRButton } from 'three/addons/webxr/VRButton.js';

import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
// CUSTOM IMPORTS
import { getStartButton, capturarInterseccionIniciarJuego, generateFlag, animateFlag, totalTime } from "./buttons.js"
import { balanceOn, balanceOff, crearObjetos, terminaContadores } from './functions.js';

//Variables INICIALES
let container;
let camera, scene, renderer;
let controller1, controller2;
let controllerGrip1, controllerGrip2;

let raycaster;
let floor;

const intersected = [];
const tempMatrix = new THREE.Matrix4();

let group;

let numObjetos = 3;

//VARIABLES TAREA ALEX
let unicoObjetoAInterseccionar = null;
let isDrawingLeft = false;
let isDrawingRight = false;
let currentLineLeft = null;
let currentLineRight = null;
let drawingPointsLeft = [];
let drawingPointsRight = [];

// VARIABLES TAREA CARLOS
var balanced, contador;
var threshold;
export var balanceTime;
export var tempBalanceTime;
export var gameStarted;
var FIN;


init();
animate();

function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x808080 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.set( 0, 1.6, 3 );

    const floorGeometry = new THREE.PlaneGeometry( 10, 10 );
    const floorMaterial = new THREE.MeshStandardMaterial( {
            color: 0xeff312,
            roughness: 1.0,
            metalness: 0.0,
            transparent: true,
            opacity: 0
    } );
    floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    //scene.add( floor );

    scene.add( new THREE.HemisphereLight( 0x808080, 0x606060 ) );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 6, 0 );
    light.castShadow = true;
    light.shadow.camera.top = 2;
    light.shadow.camera.bottom = - 2;
    light.shadow.camera.right = 2;
    light.shadow.camera.left = - 2;
    light.shadow.mapSize.set( 4096, 4096 );
    scene.add( light );

    group = new THREE.Group();
    scene.add( group );
    group.add(floor);
    group.add(getStartButton())

    generateFlag(group);

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild( renderer.domElement );

    //document.body.appendChild( VRButton.createButton( renderer ) );
    const arButton = document.createElement('button');
    arButton.textContent = 'ENTRAR EN MR';
    arButton.style.position = 'absolute';
    arButton.style.bottom = '20px';
    arButton.style.left = '20px';
    arButton.style.padding = '10px';
    arButton.style.background = '#222';
    arButton.style.color = '#fff';
    arButton.style.border = '1px solid #fff';
    document.body.appendChild(arButton);

    arButton.addEventListener('click', async () => {
        if (navigator.xr) {
            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test', 'local-floor'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.body }
            });
            renderer.xr.setSession(session);
        } else {
            alert('WebXR AR no está disponible en este dispositivo o navegador.');
        }
    });
    scene.background = null;

    // controllers

    controller1 = renderer.xr.getController( 0 );
    controller1.addEventListener( 'selectstart', onSelectStart );
    controller1.addEventListener( 'selectend', onSelectEnd );
    scene.add( controller1 );

    controller2 = renderer.xr.getController( 1 );
    controller2.addEventListener( 'selectstart', onSelectStart );
    controller2.addEventListener( 'selectend', onSelectEnd );
    scene.add( controller2 );

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip( 0 );
    controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
    scene.add( controllerGrip1 );

    controllerGrip2 = renderer.xr.getControllerGrip( 1 );
    controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
    scene.add( controllerGrip2 );

    const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    const line = new THREE.Line( geometry );
    line.computeLineDistances(); // ← esto es obligatorio
    line.name = 'line';
    line.scale.z = 5;

    controller1.add( line.clone() );
    controller2.add( line.clone() );

    raycaster = new THREE.Raycaster();

    window.addEventListener( 'resize', onWindowResize );

    /***********************************************FIN CÓDIGO BASE 2 */

    // Crear geometría del pozo (cilindro hueco)
    //const abyssGeometry = new THREE.CylinderGeometry(1.5, 1.5, 5, 64, 1, true); // radio, altura, segmentos
    //const abyssMaterial = new THREE.MeshStandardMaterial({
    //    color: 0x111111,
    //    roughness: 1,
    //    metalness: 0,
    //    side: THREE.BackSide // ¡esto hace que se vea desde dentro!
    //});
//
    //const abyss = new THREE.Mesh(abyssGeometry, abyssMaterial);
    //abyss.position.set(0, -2.5, 0); // la mitad de la altura negativa
    //group.add(abyss);


    // CODIGO PARA LOS CONTADORES DE PROGRAMA CARLOS
    gameStarted = { "status": false };
    balanced = false;
    balanceTime = { "time": Date.now() };
    tempBalanceTime = { "time": Date.now() };
    crearObjetos(numObjetos, group);
    threshold = 0.10;
    contador = 0;
    FIN = false;

    console.log("numObjetos: ",group.children.length );
    for(let i = 0; i < group.children.length; i++){
        let aMovingObject = group.children[i];
         //falta por rellenar.
        aMovingObject.velocidad = 0.01;
        aMovingObject.direccionVertical = false;
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onSelectStart(event) {
    const controller = event.target;
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {
        const intersection = intersections[0];
        let intersectedObject = intersection.object;

        // Comprueba que la interseccion sea una caja e interactua con ella
        if (intersectedObject.currentIntersected != undefined && intersectedObject.isDraggable) {
            intersectedObject.currentIntersected = true;
            intersectedObject.currentDrag = true;
            //intersectedObject.initialMaterial = intersectedObject.material;
            //intersectedObject.material.emissive.setHex(0x0df909);
            controller.attach(intersectedObject);
            controller.userData.selected = intersectedObject;
        }

        capturarInterseccionParaDibujar(controller,intersection);
        capturarInterseccionIniciarJuego(intersection, group, controller1);
    }
}

function onSelectEnd( event ) {
    const controller = event.target;
    
    // Comprueba que la interseccion sea una caja e interactua con ella
    if ( controller.userData.selected !== undefined ) {
        const object = controller.userData.selected;
        //object.material = object.initialMaterial;
        group.attach( object );
        object.puntoFijo = object.position.x;
        controller.userData.selected = undefined;
    }
    finalizarDibujoLinea(controller);
}

function getIntersections(controller) {
    tempMatrix.identity().extractRotation( controller.matrixWorld );

    raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
    raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

    return raycaster.intersectObjects(group.children, true); // cambiado por nikol a true

}

function intersectObjects( controller ) {

    // Do not highlight when already selected

    if ( controller.userData.selected !== undefined ) return;

    const line = controller.getObjectByName( 'line' );
    const intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

            const intersection = intersections[ 0 ];

            const object = intersection.object;
            //object.material.emissive.r = 1; // Casca, no se por que --Carlos
            intersected.push( object );

            line.scale.z = intersection.distance;

    } else {

            line.scale.z = 5;
    }

}

function cleanIntersected() {
    while ( intersected.length ) {
        const object = intersected.pop();
        //object.material.emissive.r = 0; // Casca, no se por que --Carlos
    }
}

function animate() {
    renderer.setAnimationLoop( render );
}

function render() {

    if (!gameStarted.status) {
        cleanIntersected();

        intersectObjects(controller1);
        intersectObjects(controller2);
    
        pintarLinea();    
    }
    
    animateFlag();

    actualizarPosicion();

    
    // Permite generar arbitrariamente un tiempo para ver que los contadores funcionan ELIMINAR EN EL PROTO FINAL
    if (gameStarted.status) {
        contador = contador + 1;
        // CARLOS anhadir comprobacion para temporizar tiempo de equilibrio -- 14.04
        if (Math.abs(controller1.position.y - controller2.position.y) < threshold) {
            if (!balanced) {
                console.log("ESTOY EN EQUILIBRIO");
                balanceOn();
                balanced = true;
            }
        } else {
            console.log("SALGO DE EQUILIBRIO");
            balanceOff();
            balanced = false;
        }
        if (contador >= 3600) {
            if (!FIN) {
                console.log("FINNNNN");
                terminaContadores(controller1, totalTime);
                FIN = true;
            }
        }
    }
    // FIN CARLOS -- 14.04

    renderer.render( scene, camera );
}


/*****************************************************FUNCIONES ALEX */

function crearObjetoDePrueba(){
    let geo = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
    let material = new THREE.MeshStandardMaterial( {
        color: 0xf2233f,
        roughness: 0.7,
        metalness: 0.0
    } );

    let object = new THREE.Mesh( geo, material );
    object.position.x = 0;
    object.position.y = 1.5;
    object.position.z = 2;

    object.scale.setScalar( Math.random() + 0.5 );

    object.castShadow = true;
    object.receiveShadow = true;
    group.add(object);
}

function capturarInterseccionParaDibujar(controller, intersection) {
    if(intersection.object == floor){
        const point = intersection.point.clone();
        if (controller === controller1) {
            // Mando izquierdo
            isDrawingLeft = true;
            drawingPointsLeft = [point];
            //const geometry = new THREE.BufferGeometry().setFromPoints(drawingPointsLeft);
            //let material = new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 10 }); // Azul

            const dummyPoint = point.clone().add(new THREE.Vector3(0.001, 0, 0));
            const curve = new THREE.CatmullRomCurve3([point, dummyPoint]);
            const geometry = new THREE.TubeGeometry(curve, 100, 0.01, 8, false); // radio = grosor
            const material = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Azul


            //material.resolution.set(window.innerWidth, window.innerHeight);
            currentLineLeft = new THREE.Mesh(geometry, material);
            scene.add(currentLineLeft);
        } else if (controller === controller2) {
            // Mando derecho
            isDrawingRight = true;
            drawingPointsRight = [point];
            //const geometry = new THREE.BufferGeometry().setFromPoints(drawingPointsRight);
            //const material = new THREE.LineBasicMaterial({ color: 0xff0000,linewidth: 10 }); // Rojo

            const dummyPoint = point.clone().add(new THREE.Vector3(0.001, 0, 0));
            const curve = new THREE.CatmullRomCurve3([point, dummyPoint]);
            const geometry = new THREE.TubeGeometry(curve, 100, 0.01, 8, false); // radio = grosor
            const material = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Azul


            currentLineRight = new THREE.Mesh(geometry, material);
            scene.add(currentLineRight);
        }
    }
    
}

function pintarLinea() {
    if (isDrawingLeft) {
        const intersections = getIntersections(controller1);
        if (intersections.length > 0 && intersections[0].object === floor) {
            const point = intersections[0].point.clone();
            const lastPoint = drawingPointsLeft[drawingPointsLeft.length - 1];

            if (!lastPoint || point.distanceTo(lastPoint) > 0.01) {
                drawingPointsLeft.push(point);

                if (drawingPointsLeft.length >= 2) {
                    const curve = new THREE.CatmullRomCurve3(drawingPointsLeft);
                    const geometry = new THREE.TubeGeometry(curve, 64, 0.03, 8, false);
                    const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });

                    if (currentLineLeft) scene.remove(currentLineLeft);
                    currentLineLeft = new THREE.Mesh(geometry, material);
                    scene.add(currentLineLeft);
                }
            }
        }
    }

    if (isDrawingRight) {
        const intersections = getIntersections(controller2);
        if (intersections.length > 0 && intersections[0].object === floor) {
            const point = intersections[0].point.clone();
            const lastPoint = drawingPointsRight[drawingPointsRight.length - 1];

            if (!lastPoint || point.distanceTo(lastPoint) > 0.01) {
                drawingPointsRight.push(point);

                if (drawingPointsRight.length >= 2) {
                    const curve = new THREE.CatmullRomCurve3(drawingPointsRight);
                    const geometry = new THREE.TubeGeometry(curve, 64, 0.03, 8, false);
                    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

                    if (currentLineRight) scene.remove(currentLineRight);
                    currentLineRight = new THREE.Mesh(geometry, material);
                    scene.add(currentLineRight);
                }
            }
        }
    }
}

function finalizarDibujoLinea(controller)
{
    if (controller === controller1) {
        isDrawingLeft = false;
        currentLineLeft = null;
    } else if (controller === controller2) {
        isDrawingRight = false;
        currentLineRight = null;
    }
}

function actualizarPosicion(){
    //console.log("Entra a actualiza posicion");
    let alturaCaja = 0.25;
    let anchuraCaja = 0.25;
    let alturaMovimiento = 1.5;
    let anchuraMovimiento = 1.5;
    //console.log("NumeroObjetos: ", group.children.length);
    for(let i = 0; i < group.children.length; i++){
        let aMovingObject = group.children[i];
        //console.log("Posicion: ", aMovingObject.position.x);
        if(!estaIntersectado(aMovingObject)){
            if (gameStarted.status) {
                //if(aMovingObject.direccionVertical && aMovingObject.name == "cuadradoNormal"){
                //    //console.log("Se mueve en vertical");
                //    aMovingObject.position.y += aMovingObject.velocidad;
                //    if(aMovingObject.position.y + (alturaCaja/2) > alturaMovimiento/2 || aMovingObject.position.y - (alturaCaja/2) < -alturaMovimiento/2){
                //        aMovingObject.velocidad = aMovingObject.velocidad * (-1);
                //    }
                //}
                if (aMovingObject.name == "cuadradoNormal"){
        
                    //console.log("Se mueve en horizontal");
                    aMovingObject.position.x += aMovingObject.velocidad;
                    //console.log("Posición: ", aMovingObject.position.x);
                    if(aMovingObject.position.x >= aMovingObject.puntoFijo + 1.0 || aMovingObject.position.x <= aMovingObject.puntoFijo - 1.0){
                        //console.log("Entra a cambiar de sentido");
                        aMovingObject.velocidad = aMovingObject.velocidad * (-1);
                    }
                }
            }
        }
    }
}

function estaIntersectado(obj1){
    let resultado = false;
    for(let i  = 0; i < intersected.length; i++){
        let obj = intersected[i];
        if(obj === obj1){
            resultado = true;
            break;
        }
    }
    return resultado;
}

/****************************** FUNCIONES CARLOS */