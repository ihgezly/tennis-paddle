"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function GlbViewer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !url) return;
    const container = containerRef.current;
    const width = container.clientWidth, height = container.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f5f5f5");
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5, 3, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(10, 20, 10);
    dir.castShadow = true;
    scene.add(dir);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0xeeeeee }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
    new GLTFLoader().load(url, (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      model.scale.setScalar(maxDim > 0 ? 4 / maxDim : 1);
      model.position.sub(center.multiplyScalar(maxDim > 0 ? 4 / maxDim : 1));
      model.position.y = Math.max(model.position.y, -1);
      model.traverse((child: any) => { if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; } });
      scene.add(model);
      setLoading(false);
    }, undefined, () => { setError("Failed to load 3D model"); setLoading(false); });
    const animate = () => { requestAnimationFrame(animate); controls.update(); renderer.render(scene, camera); };
    animate();
    return () => { controls.dispose(); renderer.dispose(); if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement); };
  }, [url]);

  return <div ref={containerRef} className="h-[500px] w-full">{loading && <div className="p-4">Loading 3D...</div>}{error && <div className="p-4 text-red-500">{error}</div>}</div>;
}