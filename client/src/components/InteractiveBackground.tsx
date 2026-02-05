"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createNoise4D } from 'simplex-noise';
import { useTheme } from 'next-themes';

const InteractiveBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        // Configuration
        const conf = {
            fov: 75,
            cameraZ: 75,
            xyCoef: 50,
            zCoef: 10,
            lightIntensity: 0.9,
            ambientColor: 0x000000,
            light1Color: 0xf59e0b, // Amber
            light2Color: 0x7c3aed, // Purple
            light3Color: 0xd97706, // Deep Orange
            light4Color: 0xc026d3  // Fuchsia
        };

        let renderer: THREE.WebGLRenderer;
        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let width: number;
        let height: number;
        let wWidth: number;
        let wHeight: number;

        let plane: THREE.Mesh;
        const noise4D = createNoise4D();

        const mouse = new THREE.Vector2();
        const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const mousePosition = new THREE.Vector3();
        const raycaster = new THREE.Raycaster();

        let light1: THREE.PointLight;
        let light2: THREE.PointLight;
        let light3: THREE.PointLight;
        let light4: THREE.PointLight;

        let animationId: number;

        const init = () => {
            renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
            camera = new THREE.PerspectiveCamera(conf.fov);
            camera.position.z = conf.cameraZ;

            updateSize();
            window.addEventListener('resize', updateSize, false);

            document.addEventListener('mousemove', handleMouseMove);

            initScene();
            animate();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const v = new THREE.Vector3();
            camera.getWorldDirection(v);
            v.normalize();
            mousePlane.normal = v;
            mouse.x = (e.clientX / width) * 2 - 1;
            mouse.y = - (e.clientY / height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(mousePlane, mousePosition);
        };

        const initScene = () => {
            scene = new THREE.Scene();
            initLights();

            const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
            const geo = new THREE.PlaneGeometry(wWidth, wHeight, wWidth / 2, wHeight / 2);
            plane = new THREE.Mesh(geo, mat);
            scene.add(plane);

            plane.rotation.x = -Math.PI / 2 - 0.2;
            plane.position.y = -25;
            camera.position.z = 60;
        };

        const initLights = () => {
            const r = 30;
            const y = 10;
            const lightDistance = 500;

            light1 = new THREE.PointLight(conf.light1Color, conf.lightIntensity, lightDistance);
            light1.position.set(0, y, r);
            scene.add(light1);

            light2 = new THREE.PointLight(conf.light2Color, conf.lightIntensity, lightDistance);
            light2.position.set(0, -y, -r);
            scene.add(light2);

            light3 = new THREE.PointLight(conf.light3Color, conf.lightIntensity, lightDistance);
            light3.position.set(r, y, 0);
            scene.add(light3);

            light4 = new THREE.PointLight(conf.light4Color, conf.lightIntensity, lightDistance);
            light4.position.set(-r, y, 0);
            scene.add(light4);
        };

        const animate = () => {
            animationId = requestAnimationFrame(animate);

            animatePlane();
            animateLights();

            renderer.render(scene, camera);
        };

        const animatePlane = () => {
            const positionAttribute = plane.geometry.attributes.position;
            const gArray = positionAttribute.array as Float32Array;
            const time = Date.now() * 0.0002;
            for (let i = 0; i < gArray.length; i += 3) {
                gArray[i + 2] = noise4D(gArray[i] / conf.xyCoef, gArray[i + 1] / conf.xyCoef, time, mouse.x + mouse.y) * conf.zCoef;
            }
            positionAttribute.needsUpdate = true;
        };

        const animateLights = () => {
            const time = Date.now() * 0.001;
            const d = 50;
            light1.position.x = Math.sin(time * 0.1) * d;
            light1.position.z = Math.cos(time * 0.2) * d;
            light2.position.x = Math.cos(time * 0.3) * d;
            light2.position.z = Math.sin(time * 0.4) * d;
            light3.position.x = Math.sin(time * 0.5) * d;
            light3.position.z = Math.sin(time * 0.6) * d;
            light4.position.x = Math.sin(time * 0.7) * d;
            light4.position.z = Math.cos(time * 0.8) * d;
        };

        const updateSize = () => {
            if (!container) return;
            width = container.clientWidth;
            height = container.clientHeight;
            if (renderer && camera) {
                renderer.setSize(width, height);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                const wsize = getRendererSize();
                wWidth = wsize[0];
                wHeight = wsize[1];
            }
        };

        const getRendererSize = () => {
            const cam = new THREE.PerspectiveCamera(camera.fov, camera.aspect);
            const vFOV = cam.fov * Math.PI / 180;
            const height = 2 * Math.tan(vFOV / 2) * Math.abs(conf.cameraZ);
            const width = height * cam.aspect;
            return [width, height];
        };

        init();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', updateSize);
            document.removeEventListener('mousemove', handleMouseMove);
            if (renderer) renderer.dispose();
            if (plane) {
                plane.geometry.dispose();
                (plane.material as THREE.Material).dispose();
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-amber-50/50 via-purple-100/30 to-orange-50/50 dark:from-zinc-900 dark:via-purple-900/10 dark:to-zinc-900 z-0">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full outline-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent dark:from-black/40 pointer-events-none" />
        </div>
    );
};

export default InteractiveBackground;
