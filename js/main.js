import * as THREE from 'three';

import { VRButton } from 'three/addons/webxr/VRButton.js';

import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

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

//VARIABLES TAREA ALEX
let unicoObjetoAInterseccionar = null;
let isDrawingLeft = false;
let isDrawingRight = false;
let currentLineLeft = null;
let currentLineRight = null;
let drawingPointsLeft = [];
let drawingPointsRight = [];


init();
animate();

function init() {

    /***********************************************CÓDIGO BASE 1 */

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x808080 );

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 10 );
    camera.position.set( 0, 1.6, 3 );

    const floorGeometry = new THREE.PlaneGeometry( 4, 4 );
    const floorMaterial = new THREE.MeshStandardMaterial( {
            color: 0xeeeeee,
            roughness: 1.0,
            metalness: 0.0
    } );
    floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.rotation.x = - Math.PI / 2;
    floor.receiveShadow = true;
    scene.add( floor );

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
    /***********************************************FIN CÓDIGO BASE 1 */

    
    //AQUI SE CREABAN LOS OBJETOS. MEJOR CREAR FUNCIONES DONDE CREAR LOS QUE NOS INTERESEN
    crearObjetoDePrueba();


    
    /***********************************************CÓDIGO BASE 2 */
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    container.appendChild( renderer.domElement );

    document.body.appendChild( VRButton.createButton( renderer ) );

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
    line.name = 'line';
    line.scale.z = 5;

    controller1.add( line.clone() );
    controller2.add( line.clone() );

    raycaster = new THREE.Raycaster();

    window.addEventListener( 'resize', onWindowResize );

    /***********************************************FIN CÓDIGO BASE 2 */

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onSelectStart( event ) {



    const controller = event.target;

    const intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

            const intersection = intersections[ 0 ];

            /**CODIGO QUE HABIA ANTES */

            /*const object = intersection.object;
            object.material.emissive.b = 1;
            controller.attach( object );

            controller.userData.selected = object;*/

            /**FUNCIONES ALEX */
            capturarInterseccionParaDibujar(controller,intersection);

            

    }

}

function onSelectEnd( event ) {

    const controller = event.target;

    /**CODIGO QUE HABIA ANTES */

    /*if ( controller.userData.selected !== undefined ) {

            const object = controller.userData.selected;
            object.material.emissive.b = 0;
            group.attach( object );

            controller.userData.selected = undefined;

    }*/

    /**FUNCIONES ALEX */
    finalizarDibujoLinea(controller);
    


}

function getIntersections( controller ) {

    tempMatrix.identity().extractRotation( controller.matrixWorld );

    raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
    raycaster.ray.direction.set( 0, 0, - 1 ).applyMatrix4( tempMatrix );

    return raycaster.intersectObjects( group.children, false );

}

function intersectObjects( controller ) {

    // Do not highlight when already selected

    if ( controller.userData.selected !== undefined ) return;

    const line = controller.getObjectByName( 'line' );
    const intersections = getIntersections( controller );

    if ( intersections.length > 0 ) {

            const intersection = intersections[ 0 ];

            const object = intersection.object;
            object.material.emissive.r = 1;
            intersected.push( object );

            line.scale.z = intersection.distance;

    } else {

            line.scale.z = 5;
    }

}

function cleanIntersected() {

    while ( intersected.length ) {

            const object = intersected.pop();
            object.material.emissive.r = 0;

    }

}

function animate() {

    renderer.setAnimationLoop( render );

}

function render() {

    cleanIntersected();

    intersectObjects( controller1 );
    intersectObjects( controller2 );

    /*******FUNCIONES ALEX */
    pintarLinea();

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
    if(intersection == floor){
        const point = intersection.point.clone();
        if (controller === controller1) {
            // Mando izquierdo
            isDrawingLeft = true;
            drawingPointsLeft = [point];
            const geometry = new THREE.BufferGeometry().setFromPoints(drawingPointsLeft);
            const material = new THREE.LineBasicMaterial({ color: 0x0000ff }); // Azul
            currentLineLeft = new THREE.Line(geometry, material);
            scene.add(currentLineLeft);
        } else if (controller === controller2) {
            // Mando derecho
            isDrawingRight = true;
            drawingPointsRight = [point];
            const geometry = new THREE.BufferGeometry().setFromPoints(drawingPointsRight);
            const material = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Rojo
            currentLineRight = new THREE.Line(geometry, material);
            scene.add(currentLineRight);
        }
    }
    
}

function pintarLinea(){

    if (isDrawingLeft) {
        const intersections = getIntersections(controller1);
        if (intersections.length > 0) {
            const point = intersections[0].point.clone();
    
            // Verificar distancia mínima
            const lastPoint = drawingPointsLeft[drawingPointsLeft.length - 1];
            if (!lastPoint || point.distanceTo(lastPoint) > 0.02) { // ← mínimo 2 cm
                drawingPointsLeft.push(point);
    
                const curve = new THREE.CatmullRomCurve3(drawingPointsLeft);
                const smoothPoints = curve.getPoints(100); // 100 puntos suaves
    
                currentLineLeft.geometry.setFromPoints(smoothPoints);
            }
        }
    }

    if (isDrawingRight) {
        const intersections = getIntersections(controller2);
        if (intersections.length > 0) {
            const point = intersections[0].point.clone();
    
            // Verificar distancia mínima
            const lastPoint = drawingPointsRight[drawingPointsRight.length - 1];
            if (!lastPoint || point.distanceTo(lastPoint) > 0.02) { // ← mínimo 2 cm
                drawingPointsRight.push(point);
    
                const curve = new THREE.CatmullRomCurve3(drawingPointsRight);
                const smoothPoints = curve.getPoints(100); // 100 puntos suaves
    
                currentLineRight.geometry.setFromPoints(smoothPoints);
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



/**********************************ELIMINAR SI NADIE LO UTILIZA */


    /*const geometries = [
            new THREE.BoxGeometry( 0.2, 0.2, 0.2 ),
            new THREE.ConeGeometry( 0.2, 0.2, 64 ),
            new THREE.CylinderGeometry( 0.2, 0.2, 0.2, 64 ),
            new THREE.IcosahedronGeometry( 0.2, 8 ),
            new THREE.TorusGeometry( 0.2, 0.04, 64, 32 )
    ];

    for ( let i = 0; i < 50; i ++ ) {

            const geometry = geometries[ Math.floor( Math.random() * geometries.length ) ];
            const material = new THREE.MeshStandardMaterial( {
                    color: Math.random() * 0xffffff,
                    roughness: 0.7,
                    metalness: 0.0
            } );

            const object = new THREE.Mesh( geometry, material );

            object.position.x = Math.random() * 4 - 2;
            object.position.y = Math.random() * 2;
            object.position.z = Math.random() * 4 - 2;

            object.rotation.x = Math.random() * 2 * Math.PI;
            object.rotation.y = Math.random() * 2 * Math.PI;
            object.rotation.z = Math.random() * 2 * Math.PI;

            object.scale.setScalar( Math.random() + 0.5 );

            object.castShadow = true;
            object.receiveShadow = true;

            group.add( object );

    }*/