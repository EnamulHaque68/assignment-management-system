import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  interactive?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ interactive = true }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x1a2035, 2.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x00f0ff, 4, 60);
    cyanLight.position.set(10, 10, 15);
    scene.add(cyanLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 4, 60);
    purpleLight.position.set(-10, -10, 15);
    scene.add(purpleLight);

    const accentLight = new THREE.PointLight(0x3b82f6, 3, 50);
    accentLight.position.set(0, 15, 10);
    scene.add(accentLight);

    // --- Floating 3D Geometric Crystal Meshes ---
    const group = new THREE.Group();
    scene.add(group);

    // Core central crystal (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(4.2, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a2444,
      emissive: 0x0f172a,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(2.5, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // Orbiting Torus Ring
    const torusGeo = new THREE.TorusGeometry(8.5, 0.15, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x4c1d95,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.rotation.x = Math.PI / 3;
    group.add(torusMesh);

    // Orbiting second ring
    const ring2Geo = new THREE.TorusGeometry(10.5, 0.08, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x0e7490,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.y = Math.PI / 4;
    group.add(ring2Mesh);

    // Floating satellite polyhedrons
    const satellites: THREE.Mesh[] = [];
    const geometries = [
      new THREE.OctahedronGeometry(1.4),
      new THREE.TetrahedronGeometry(1.6),
      new THREE.DodecahedronGeometry(1.2),
      new THREE.IcosahedronGeometry(1.3),
      new THREE.OctahedronGeometry(1.5),
    ];

    const satMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.8, roughness: 0.2, wireframe: true }),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.8, roughness: 0.2, wireframe: true }),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8, roughness: 0.2, wireframe: true }),
      new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.8, roughness: 0.2, wireframe: true }),
      new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8, roughness: 0.2, wireframe: true }),
    ];

    for (let i = 0; i < 5; i++) {
      const sat = new THREE.Mesh(geometries[i], satMaterials[i]);
      const angle = (i / 5) * Math.PI * 2;
      const radius = 13 + (i % 2) * 3;
      sat.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * (radius * 0.6),
        (Math.sin(i * 2) - 0.5) * 6
      );
      satellites.push(sat);
      group.add(sat);
    }

    // --- Particle Cosmos (Stars) ---
    const particleCount = 700;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x00f0ff);
    const c2 = new THREE.Color(0xa855f7);
    const c3 = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      const choice = Math.random();
      const col = choice < 0.4 ? c1 : choice < 0.8 ? c2 : c3;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Mouse Parallax Tracker ---
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const updateGroupPosition = () => {
      if (window.innerWidth >= 1024) {
        group.position.x = 4.5;
      } else {
        group.position.x = 0;
      }
    };
    updateGroupPosition();

    // --- Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateGroupPosition();
    };

    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera parallax
      targetX += (mouseX * 3 - targetX) * 0.05;
      targetY += (mouseY * 3 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(scene.position);

      // Rotate central group
      group.rotation.y = elapsed * 0.15;
      group.rotation.x = Math.sin(elapsed * 0.2) * 0.15;

      coreMesh.rotation.y = -elapsed * 0.2;
      coreMesh.rotation.z = elapsed * 0.1;
      innerMesh.rotation.x = elapsed * 0.3;

      torusMesh.rotation.z = elapsed * 0.25;
      ring2Mesh.rotation.x = elapsed * 0.2;

      // Animate satellites
      satellites.forEach((sat, i) => {
        sat.rotation.x += 0.01 * (i + 1);
        sat.rotation.y += 0.015 * (i + 1);
        sat.position.y += Math.sin(elapsed * 1.5 + i) * 0.02;
      });

      // Particle subtle rotation
      particles.rotation.y = elapsed * 0.03;
      particles.rotation.x = elapsed * 0.015;

      // Dynamic light movement
      cyanLight.position.x = Math.cos(elapsed * 0.8) * 12;
      cyanLight.position.y = Math.sin(elapsed * 0.8) * 12;
      purpleLight.position.x = -Math.cos(elapsed * 0.6) * 12;
      purpleLight.position.y = -Math.sin(elapsed * 0.6) * 12;

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, [interactive]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
};
