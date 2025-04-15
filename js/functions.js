import * as THREE from 'three';
import { tempBalanceTime, balanceTime } from "./main_CARLOS.js";

/**
 * Crea un conjunto de cubos apilados que se pueden agarrar, mover y soltar
 * @param {int} numObjetos: El numero de objetos a crear
 * @param {Object} group: Instancia del grupo de la escena donde se anhadiran los objetos
 */
export function crearObjetos(numObjetos, group) {
  let height = 0.25;
  let boxGeometry = new THREE.BoxGeometry(0.25, height, 0.35);
  let materialRed = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  let materialGreen = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  let materialBlue = new THREE.MeshStandardMaterial({ color: 0x0000ff });
  let materials = [materialRed, materialBlue, materialGreen]

  let accumulator = 0.25;
  for (let i = 0; i < numObjetos; i++) {
    var customObject = new THREE.Mesh(boxGeometry, materials[i % materials.length]);

    // Object properties
    customObject.isDraggable = true;
    customObject.currentDrag = false;
    customObject.currentIntersected = false;

    // Object coordinates
    customObject.position.x = -0.5;
    customObject.position.y = accumulator;
    customObject.position.z = 1;

    // Stack objects vertically
    accumulator += height;

    group.add(customObject);
  }
}

/**
 * Comienza los contadores de programa para el tiempo de ejecucion y el tiempo en equilibrio.
 * @param {Object} controller: instancia del mando que dispara el evento
 * @returns array[2]: tiempo de inicio del programa y contador a 0 del tiempo en equilibrio
 */
export function empiezaContadores(controller) {
    controller.addEventListener("onBalance", balanceOn);
    controller.addEventListener("offBalance", balanceOff);
    setBalanceTime(0.0);
    return [Date.now(), balanceTime.time];
}

/**
 * Termina los contadores de programa para el tiempo de ejecucion y el tiempo en equilibrio.
 * @param {Object} controller: instancia del mando que dispara el evento
 * @param {Date} startExecTime: Tiempo de inicio del programa.
 * @returns array[2]: tiempo total de ejecucion y de equilibrio
 */
export function terminaContadores(controller, startExecTime) {
  let executionTime = (Date.now() - startExecTime) / 1000;
  controller.removeEventListener("onBalance", balanceOn);
  controller.removeEventListener("offBalance", balanceOff);
  let finalBalanceTime = getBalanceTime() / 1000;

  // Genera fichero con tiempos
  const blob = new Blob(["Tiempo total: ", executionTime.toString(), "s\n",
                          "Tiempo de equilibrio: ", finalBalanceTime.toString(), "s\n"],
                        {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "ResultadosPrograma.txt";
  a.click();
  URL.revokeObjectURL(url);

  //return [executionTime, finalBalanceTime];
}

export function balanceOn() {
    tempBalanceTime.time = Date.now();
}

export function balanceOff() {
    let elapsedBalanceTime = Date.now() - tempBalanceTime.time;
    setBalanceTime(getBalanceTime() + elapsedBalanceTime);
}

export function setBalanceTime(time) {
    balanceTime.time = time;
}

export function getBalanceTime() {
    return balanceTime.time;
}
