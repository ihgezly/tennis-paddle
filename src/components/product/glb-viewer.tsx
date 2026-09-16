"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function GlbViewer({
  url,
  accentHex = "#d7b56d",
}: {
  url: string;
  accentHex?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !url) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a0d12");

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5, 3, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(10, 20, 10);
    key.castShadow = true;
    scene.add(key);

    // إضاءة بلون القسم
    const accentLight = new THREE.PointLight(
      new THREE.Color(accentHex),
      2.2,
      15,
    );
    accentLight.position.set(-4, 2, -4);
    scene.add(accentLight);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(6, 64),
      new THREE.MeshStandardMaterial({
        color: 0x14141c,
        metalness: 0.3,
        roughness: 0.6,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);

    // حلقة توهج تحت المنتج
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 1.75, 64),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accentHex),
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.98;
    scene.add(ring);

    let isMounted = true;

    new GLTFLoader().load(
      url,
      (gltf) => {
        if (!isMounted) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 4 / maxDim : 1;
        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y = Math.max(model.position.y, -1);
        model.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        scene.add(model);
        setLoading(false);
      },
      undefined,
      () => {
        if (!isMounted) return;
        setError("تعذّر تحميل النموذج ثلاثي الأبعاد");
        setLoading(false);
      },
    );

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isMounted = false;
      cancelAnimationFrame(frameId);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [url, accentHex]);

  return (
    <div
      ref={containerRef}
      className="relative h-[500px] w-full"
      style={{ backgroundColor: "#0a0d12" }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
            style={{
              borderColor: `${accentHex}55`,
              borderTopColor: "transparent",
            }}
          />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}