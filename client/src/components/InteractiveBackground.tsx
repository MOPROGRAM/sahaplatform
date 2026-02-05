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
            lightIntensity: 3.0, // Increased intensity for more vibrancy
            ambientColor: 0x444444, // Brighter ambient light to avoid black areas
            light1Color: 0x1E90FF, // Dodger Blue
            light2Color: 0x9370DB, // Medium Purple
            light3Color: 0x00CED1, // Dark Turquoise
            light4Color: 0x48D1CC  // Medium Turquoise
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
            renderer = new THREE.WebGLRenderer({ 
                canvas: canvas, 
                antialias: true, 
                alpha: true,
                powerPreference: "high-performance"
            });
            renderer.setClearColor(0x000000, 0); // Set clear color to transparent
            renderer.setPixelRatio(window.devicePixelRatio);
            camera = new THREE.PerspectiveCamera(conf.fov);
            camera.position.z = conf.cameraZ;

            updateSize();
            window.addEventListener('resize', updateSize, false);

            document.addEventListener('mousemove', handleMouseMove);
            
            initScene();
            animate();
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!container) return;
            const rect = container.getBoundingClientRect();
            
            // Check if mouse is within the container bounds
            const isInside = (
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            );

            if (!isInside) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const v = new THREE.Vector3();
            camera.getWorldDirection(v);
            v.normalize();
            mousePlane.normal = v;
            
            mouse.x = (x / width) * 2 - 1;
            mouse.y = - (y / height) * 2 + 1;
            
            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(mousePlane, mousePosition);
        };

        const handleMouseLeave = () => {
             // Optional: Reset mouse interaction or stop movement when leaving
        };

        const initScene = () => {
            scene = new THREE.Scene();
            scene.background = null;
            initLights();

            const mat = new THREE.MeshPhongMaterial({ 
                color: 0xffffff, 
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8,
                shininess: 100
            });
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
            plane.geometry.computeVertexNormals();
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
        <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-br from-blue-100/20 via-purple-100/20 to-turquoise-100/20 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-zinc-900/20 z-0">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full outline-none" />
        </div>
    );
};

export default InteractiveBackground;
