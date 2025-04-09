import * as THREE from 'three';

import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

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

export function capturarInterseccionIniciarJuego(intersection, group) {
    const objeto = intersection.object;
    const boton = objeto.parent;
  
    if (boton.name === "botonStart") {
      console.log("startGame");
      startGame();
      group.remove(boton);
    }
  }
  
function startGame() {
    console.log("iniciar contador");
}