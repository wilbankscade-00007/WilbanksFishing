import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

// Global three.js scene rendered fixed behind all content.
// Floating wireframe shapes + a particle field give the whole site depth,
// with subtle mouse-parallax camera drift.
export default function Scene3DBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const isMobile = window.innerWidth < 768;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.06);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 9;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const shapeCount = isMobile ? 7 : 14;
    const geometries = [
      () => new THREE.IcosahedronGeometry(1, 0),
      () => new THREE.OctahedronGeometry(1, 0),
      () => new THREE.TetrahedronGeometry(1, 0),
      () => new THREE.TorusGeometry(0.8, 0.28, 8, 16),
    ];
    const shapes = [];
    for (let i = 0; i < shapeCount; i++) {
      const geo = geometries[i % geometries.length]();
      const mat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xe10000 : 0x4a1414,
        wireframe: true,
        transparent: true,
        opacity: i % 3 === 0 ? 0.45 : 0.22,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 10 - 2
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.scale.setScalar(0.4 + Math.random() * 1.1);
      mesh.userData = {
        rx: (Math.random() - 0.5) * 0.004,
        ry: (Math.random() - 0.5) * 0.004,
        floatSpeed: 0.2 + Math.random() * 0.4,
        floatPhase: Math.random() * Math.PI * 2,
        baseY: mesh.position.y,
      };
      group.add(mesh);
      shapes.push(mesh);
    }

    const particleCount = isMobile ? 180 : 420;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xe10000, size: 0.045, transparent: true, opacity: 0.55 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const mouse = { x: 0, y: 0 };
    const onMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let raf;
    let running = true;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!running || document.hidden) return;
      const t = clock.getElapsedTime();
      shapes.forEach((m) => {
        m.rotation.x += m.userData.rx;
        m.rotation.y += m.userData.ry;
        m.position.y = m.userData.baseY + Math.sin(t * m.userData.floatSpeed + m.userData.floatPhase) * 0.6;
      });
      particles.rotation.y = t * 0.02;
      camera.position.x += (mouse.x * 1.6 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 1.0 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    const onVisibility = () => { running = !document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      pGeo.dispose();
      pMat.dispose();
      shapes.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true" />;
}