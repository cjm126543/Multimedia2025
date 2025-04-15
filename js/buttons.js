import * as THREE from 'three';

import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { empiezaContadores } from "./functions.js";
import { gameStarted } from "./main_CARLOS.js";

export function getStartButton() {
    const botonGroup = new THREE.Group();
    botonGroup.name = "botonStart";
  
    const geometry = new THREE.BoxGeometry(0.4, 0.2, 0.1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const botonMesh = new THREE.Mesh(geometry, material);
    botonGroup.add(botonMesh);
  
    const loader = new FontLoader();
    loader.load("fonts/helvetiker_regular.typeface.json", function (font) {
      const textGeometry = new TextGeometry("START", {
        font: font,
        size: 0.06,
        height: 0.005,
      });

      textGeometry.computeBoundingBox();
      const bbox = textGeometry.boundingBox;
      const textWidth = bbox.max.x - bbox.min.x;
      const textHeight = bbox.max.y - bbox.min.y;
  
      const textMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  
      textMesh.position.set(-textWidth / 2, -textHeight / 2, 0.051);
      botonGroup.add(textMesh);
    });
  
    botonGroup.position.set(0, 1.5, -1);
    return botonGroup
}

export function capturarInterseccionIniciarJuego(intersection, group, controller) {
    const objeto = intersection.object;
    const boton = objeto.parent;
  
    if (boton.name === "botonStart") {
      console.log("startGame");
      startGame(controller);
      group.remove(boton);
    }
  }

// MODIFICACIONES CARLOS
export var totalTime;
function startGame(controller) {
  console.log("iniciar contador");
  let arr = empiezaContadores(controller);
  totalTime = arr[0];
  gameStarted.status = true;
}
// FIN CARLOS

let flagMesh, poleMesh, shaderMaterial;

export function generateFlag(group) {
  const poleHeight = 1.5;

  // Palo (pole)
  const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, poleHeight, 16);
  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  poleMesh = new THREE.Mesh(poleGeometry, poleMaterial);
  poleMesh.position.set(-1, poleHeight / 2, -1); // bien centrado
  group.add(poleMesh);

  // Bandera (flag)
  const flagWidth = 0.6;
  const flagHeight = 0.4;

  const flagGeometry = new THREE.PlaneGeometry(flagWidth, flagHeight, 20, 10);

  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 }
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      void main() {
          vUv = uv;
          vec3 pos = position;
  
          // Movimiento progresivo desde el borde izquierdo (quieto) al derecho (flameo)
          float wave = sin(pos.y * 10.0 + time * 4.0) * 0.05 * (1.0 - uv.x);
  
          pos.x += wave;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // rojo sólido
      }
    `,
    side: THREE.DoubleSide
  });

  flagMesh = new THREE.Mesh(flagGeometry, shaderMaterial);

  flagMesh.position.set(
      poleMesh.position.x + 0.3,
      poleMesh.position.y + flagHeight + 0.15,
      poleMesh.position.z
  );

  flagMesh.rotation.y = Math.PI;
  group.add(flagMesh);
}

export function animateFlag() {
    if (shaderMaterial) {
      shaderMaterial.uniforms.time.value += 0.02;
  }
}