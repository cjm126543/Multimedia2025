/**
 * Crea un conjunto de cubos apilados que se pueden agarrar, mover y soltar
 * @param {int} numObjetos: El numero de objetos a crear 
 * @param {Object} scene: Instancia de la escena donde se anhadiran los objetos 
 */
export function crearObjetos(numObjetos, scene) {
    let boxGeometry = new THREE.BoxGeometry( 10, 5, 5 );
    let material = new THREE.MeshStandardMaterial( { color: 0xff0000 } );

    let accumulator = 0;
    for (let i = 0; i < numObjetos; i++) {
        var customObject = new THREE.Mesh( boxGeometry, material );

        // Object properties
        customObject.isDraggable = true;
        customObject.currentDrag = false;
        customObject.currentIntersected = false;

        // Object coordinates
        customObject.position.x = -50;
        customObject.position.y += accumulator;
        customObject.position.z = -50;

        // Stack objects vertically
        accumulator += 5;
        
        scene.add(customObject);
    }
}

/**
 * Comienza los contadores de programa para el tiempo de ejecucion y el tiempo en equilibrio.
 * @param {Object} window: Ventana del navegador ¿este o el controlador debe hacer de evento? 
 * @returns array[2]: tiempo de inicio del programa y contador a 0 del tiempo en equilibrio 
 */
export function empiezaContadores(window) {
    window.addEventListener("onBalance", balanceOn);
    window.addEventListener("offBalance", balanceOff);
    setBalanceTime(0.0);
    return [Date.now(), balanceTime];
}

/**
 * Termina los contadores de programa para el tiempo de ejecucion y el tiempo en equilibrio.
 * @param {Object} window: Ventana del navegador ¿este o el controlador debe hacer de evento? 
 * @param {Date} startExecTime: Tiempo de inicio del programa.
 * @returns array[2]: tiempo total de ejecucion y de equilibrio
 */
export function terminaContadores(window, startExecTime) {
    let executionTime = (Date.now() - startExecTime) / 1000;
    window.removeEventListener("onBalance", balanceOn);
    window.removeEventListener("offBalance", balanceOff);
    let balanceTime = getBalanceTime() / 1000;
    return [executionTime, balanceTime];
}

function checkBalance(eventL, eventR) {
    // Se puede hacer esto???
    let leftController = eventL.target;
    let rightController = eventR.target;

    let yMargin = 5; // En cm o relativo a ventana??

    let leftY = leftController.position.y;
    let rightY = rightController.position.y;

}

function balanceOn() {
    tempBalanceTime = Date.now();
}

function balanceOff() {
    let elapsedBalanceTime = Date.now() - tempBalanceTime;
    setBalanceTime(getBalanceTime() + elapsedBalanceTime);
}