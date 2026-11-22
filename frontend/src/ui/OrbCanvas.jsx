import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function OrbCanvas({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
    camera.position.z = 4.4;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

    const geometry = new THREE.IcosahedronGeometry(1.2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2b5484,
      roughness: 0.42,
      metalness: 0.18,
      transparent: true,
      opacity: 0.88,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0xa0bddb, transparent: true, opacity: 0.22 })
    );
    mesh.add(wire);

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.85);
    key.position.set(2.4, 1.6, 3);
    scene.add(key);

    let vx = 0.35;
    let vy = 0.22;
    let last = performance.now();
    let frame;

    const onPointer = (event) => {
      vx += event.movementX * 0.012;
      vy += event.movementY * 0.012;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      mesh.rotation.y += vx * dt;
      mesh.rotation.x += vy * dt;
      vx += (0.28 - vx) * (1 - Math.exp(-dt * 3.4));
      vy += (0.16 - vy) * (1 - Math.exp(-dt * 3.4));
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointer);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden tabIndex={-1} />;
}
