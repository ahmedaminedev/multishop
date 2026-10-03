import React, { useState, useRef, useEffect } from 'react';
import { 
    Maximize2, RotateCcw, Layers, Box, Sparkles, Check, 
    ShoppingCart, Eye, Compass, Info, ArrowRight, ShieldCheck, Flame
} from 'lucide-react';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

export interface Fitness3DStudioProps {
    initialMode?: 'barbell' | 'rack' | 'gym';
    onClose?: () => void;
    isModal?: boolean;
}

interface PlateConfig {
    weight: number;
    color: string;
    label: string;
    width: number;
    radius: number;
}

const OLYMPIC_PLATES: Record<number, PlateConfig> = {
    10: { weight: 10, color: '#16a34a', label: '10 KG', width: 22, radius: 55 },
    15: { weight: 15, color: '#eab308', label: '15 KG', width: 28, radius: 68 },
    20: { weight: 20, color: '#2563eb', label: '20 KG', width: 34, radius: 82 },
    25: { weight: 25, color: '#dc2626', label: '25 KG', width: 40, radius: 95 },
};

export const Fitness3DStudio: React.FC<Fitness3DStudioProps> = ({ 
    initialMode = 'gym', 
    onClose,
    isModal = false 
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [viewMode, setViewMode] = useState<'gym' | 'barbell' | 'exploded'>(
        initialMode === 'barbell' ? 'barbell' : 'gym'
    );

    // Interactive 3D Orbit & Rotation angles
    const [rotX, setRotX] = useState(-0.35);
    const [rotY, setRotY] = useState(0.55);
    const [zoom, setZoom] = useState(1.0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, rotX: -0.35, rotY: 0.55 });

    // Interactive Barbell setup: loaded plates per side
    const [platesCount, setPlatesCount] = useState<Record<number, number>>({
        25: 1,
        20: 1,
        15: 0,
        10: 1
    });

    // Home Gym components included
    const [includeRack, setIncludeRack] = useState(true);
    const [includeBench, setIncludeBench] = useState(true);
    const [includeBarbell, setIncludeBarbell] = useState(true);
    const [includeMats, setIncludeMats] = useState(true);
    const [benchAngle, setBenchAngle] = useState(30); // degrees incline

    const [isExploded, setIsExploded] = useState(false);
    const [explodeProgress, setExplodeProgress] = useState(0);

    const { addToCart, openCart } = useCart();
    const { addToast } = useToast();

    // Total Barbell Weight (Bar is 20kg + 2 * plates)
    const barWeight = 20;
    const platesWeightPerSide = Object.entries(platesCount).reduce(
        (sum, [wt, count]) => sum + Number(wt) * count, 0
    );
    const totalBarbellWeight = barWeight + (platesWeightPerSide * 2);

    // Total Home Gym Metrics
    const setupMetrics = {
        totalPrice: (includeRack ? 1249 : 0) + (includeBench ? 349 : 0) + (includeBarbell ? 489 : 0) + (includeMats ? 120 : 0),
        totalWeightKg: (includeRack ? 95 : 0) + (includeBench ? 28 : 0) + (includeBarbell ? totalBarbellWeight : 0) + (includeMats ? 16 : 0),
        floorSpaceM2: (includeRack ? 3.2 : 0) + (includeBench ? 1.5 : 0) + 1.2,
        capacityKg: 600
    };

    // Smooth Exploded view animation loop
    useEffect(() => {
        let animId: number;
        const target = isExploded ? 1 : 0;
        const animate = () => {
            setExplodeProgress(prev => {
                const diff = target - prev;
                if (Math.abs(diff) < 0.01) return target;
                return prev + diff * 0.12;
            });
            if (Math.abs(target - explodeProgress) >= 0.01) {
                animId = requestAnimationFrame(animate);
            }
        };
        animId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animId);
    }, [isExploded]);

    // Handle Mouse & Touch Dragging for 3D Orbit
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, rotX, rotY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = (e.clientX - dragStart.current.x) * 0.008;
        const dy = (e.clientY - dragStart.current.y) * 0.008;
        setRotY(dragStart.current.rotY + dx);
        setRotX(Math.max(-1.1, Math.min(0.2, dragStart.current.rotX + dy)));
    };

    const handleMouseUp = () => setIsDragging(false);

    // Main 3D Rendering Engine (Canvas 3D Projection with depth sorting & lighting)
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.parentElement?.clientWidth || 800;
        let height = canvas.parentElement?.clientHeight || 480;
        if (height < 380) height = 440;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        const cx = width / 2;
        const cy = height / 2 + 30;

        // 3D Matrix / Projection Math
        const project = (x: number, y: number, z: number) => {
            // Rotate around Y
            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);
            const x1 = x * cosY - z * sinY;
            const z1 = z * cosY + x * sinY;

            // Rotate around X
            const cosX = Math.cos(rotX);
            const sinX = Math.sin(rotX);
            const y2 = y * cosX - z1 * sinX;
            const z2 = z1 * cosX + y * sinX;

            // Perspective
            const dist = 650;
            const scale = (dist / (dist + z2)) * zoom;
            return {
                x: cx + x1 * scale,
                y: cy + y2 * scale,
                z: z2,
                scale
            };
        };

        // Draw Loop
        ctx.clearRect(0, 0, width, height);

        // 1. Perspective Floor Grid (Athletic Gym Tiles)
        ctx.save();
        ctx.lineWidth = 1;
        const gridSize = 400;
        const gridStep = 50;

        for (let i = -gridSize; i <= gridSize; i += gridStep) {
            const p1 = project(i, 110, -gridSize);
            const p2 = project(i, 110, gridSize);
            const alpha = Math.max(0.04, 0.18 - Math.abs(i) / (gridSize * 3));
            ctx.strokeStyle = `rgba(132, 204, 22, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            const p3 = project(-gridSize, 110, i);
            const p4 = project(gridSize, 110, i);
            ctx.beginPath();
            ctx.moveTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.stroke();
        }
        ctx.restore();

        // 2. Render 3D Objects based on viewMode
        if (viewMode === 'gym') {
            // Render Home Gym: Rubber Floor Mats + Power Rack + Bench + Barbell
            
            // Heavy Duty Rubber Mats Base
            if (includeMats) {
                const matW = 280;
                const matD = 220;
                const corners = [
                    project(-matW, 108, -matD),
                    project(matW, 108, -matD),
                    project(matW, 108, matD),
                    project(-matW, 108, matD)
                ];
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.beginPath();
                ctx.moveTo(corners[0].x, corners[0].y);
                corners.forEach(c => ctx.lineTo(c.x, c.y));
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#84cc16';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Power Rack 3D (Carbon Steel 75x75mm Structure)
            if (includeRack) {
                const rw = 140;
                const rd = 120;
                const rh = 210;
                const baseY = 105;
                const topY = baseY - rh;

                const posts = [
                    { x: -rw, z: -rd },
                    { x: rw, z: -rd },
                    { x: rw, z: rd },
                    { x: -rw, z: rd }
                ];

                // 4 Vertical Steel Columns
                posts.forEach((p) => {
                    const b = project(p.x, baseY, p.z);
                    const t = project(p.x, topY, p.z);
                    ctx.strokeStyle = '#1e293b';
                    ctx.lineWidth = 9 * b.scale;
                    ctx.beginPath();
                    ctx.moveTo(b.x, b.y);
                    ctx.lineTo(t.x, t.y);
                    ctx.stroke();

                    // Laser-cut holes detail
                    ctx.strokeStyle = '#84cc16';
                    ctx.lineWidth = 2 * b.scale;
                    for (let h = 0; h < 6; h++) {
                        const holeY = baseY - 35 * (h + 1);
                        const hp = project(p.x, holeY, p.z);
                        ctx.beginPath();
                        ctx.arc(hp.x, hp.y, 2 * hp.scale, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                });

                // Top Crossbars & Multi-grip Pull-up Bar
                const t0 = project(posts[0].x, topY, posts[0].z);
                const t1 = project(posts[1].x, topY, posts[1].z);
                const t2 = project(posts[2].x, topY, posts[2].z);
                const t3 = project(posts[3].x, topY, posts[3].z);

                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 7 * t0.scale;
                ctx.beginPath();
                ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y);
                ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t0.x, t0.y);
                ctx.stroke();

                // Neon Green J-Cups / Safety Catches
                const j1 = project(posts[0].x, baseY - 90, posts[0].z + 10);
                const j2 = project(posts[1].x, baseY - 90, posts[1].z + 10);
                ctx.fillStyle = '#84cc16';
                [j1, j2].forEach(j => {
                    ctx.fillRect(j.x - 4, j.y - 4, 8, 10);
                });
            }

            // Adjustable Bench 3D
            if (includeBench) {
                const benchY = 85;
                const pBack = project(0, benchY - 45 * Math.sin(benchAngle * Math.PI / 180), -40);
                const pSeat = project(0, benchY, 15);
                const pFoot = project(0, 105, 45);

                // Bench Frame (Black Iron)
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 12 * pSeat.scale;
                ctx.beginPath();
                ctx.moveTo(pBack.x, pBack.y);
                ctx.lineTo(pSeat.x, pSeat.y);
                ctx.lineTo(pFoot.x, pFoot.y);
                ctx.stroke();

                // High-density padded cushion
                ctx.strokeStyle = '#dc2626'; // High-end red stitching
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            // Olympic Barbell placed on the rack
            if (includeBarbell) {
                const barY = includeRack ? 15 : 60;
                const pLeft = project(-180, barY, 0);
                const pRight = project(180, barY, 0);

                // Chrome Shaft
                ctx.strokeStyle = '#e2e8f0';
                ctx.lineWidth = 6 * pLeft.scale;
                ctx.beginPath();
                ctx.moveTo(pLeft.x, pLeft.y);
                ctx.lineTo(pRight.x, pRight.y);
                ctx.stroke();

                // Center Knurling
                const knurlLeft = project(-40, barY, 0);
                const knurlRight = project(40, barY, 0);
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 7 * knurlLeft.scale;
                ctx.beginPath();
                ctx.moveTo(knurlLeft.x, knurlLeft.y);
                ctx.lineTo(knurlRight.x, knurlRight.y);
                ctx.stroke();

                // Bumper Plates on ends
                [-140, 140].forEach((posX) => {
                    const p = project(posX, barY, 0);
                    ctx.fillStyle = '#dc2626'; // 25kg red
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 22 * p.scale, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#84cc16';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                });
            }
        } else {
            // VIEWMODE: BARBELL OR EXPLODED VIEW
            const barY = 20;
            const separation = isExploded ? explodeProgress * 95 : 0;

            // Barbell Shaft
            const leftEnd = project(-220 - separation * 0.3, barY, 0);
            const rightEnd = project(220 + separation * 0.3, barY, 0);

            // Knurled Steel Bar
            ctx.save();
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 10 * leftEnd.scale;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(leftEnd.x, leftEnd.y);
            ctx.lineTo(rightEnd.x, rightEnd.y);
            ctx.stroke();

            // Diamond knurling textures
            [-80, 0, 80].forEach(kX => {
                const k1 = project(kX - 35, barY, 0);
                const k2 = project(kX + 35, barY, 0);
                ctx.strokeStyle = '#94a3b8';
                ctx.lineWidth = 11 * k1.scale;
                ctx.beginPath();
                ctx.moveTo(k1.x, k1.y);
                ctx.lineTo(k2.x, k2.y);
                ctx.stroke();
            });
            ctx.restore();

            // Draw Loaded Olympic Plates on Both Sleeves
            const activePlates: PlateConfig[] = [];
            Object.entries(platesCount).forEach(([wt, count]) => {
                for (let c = 0; c < count; c++) {
                    activePlates.push(OLYMPIC_PLATES[Number(wt)]);
                }
            });

            // Draw plates along sleeve
            [-1, 1].forEach(side => {
                let currentOffset = 135;
                activePlates.forEach((plate, idx) => {
                    const plateX = side * (currentOffset + idx * (plate.width + 6) + separation * (idx + 1) * 0.8);
                    const p = project(plateX, barY, 0);

                    // Plate 3D Cylinder / Disc
                    ctx.save();
                    ctx.fillStyle = plate.color;
                    ctx.beginPath();
                    ctx.ellipse(p.x, p.y, (plate.width / 2) * p.scale, plate.radius * p.scale, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = '#0f172a';
                    ctx.lineWidth = 2 * p.scale;
                    ctx.stroke();

                    // Inner Steel Hub
                    ctx.fillStyle = '#cbd5e1';
                    ctx.beginPath();
                    ctx.ellipse(p.x, p.y, (plate.width / 4) * p.scale, 18 * p.scale, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // Label Weight in Exploded View
                    if (isExploded && side === 1) {
                        ctx.fillStyle = '#ffffff';
                        ctx.font = `bold ${Math.round(11 * p.scale)}px monospace`;
                        ctx.textAlign = 'center';
                        ctx.fillText(plate.label, p.x, p.y - plate.radius * p.scale - 12);
                    }
                    ctx.restore();

                    currentOffset += plate.width;
                });

                // Safety Collar (Lock-Jaw Collar)
                const collarX = side * (currentOffset + 12 + separation * (activePlates.length + 1));
                const pCollar = project(collarX, barY, 0);
                ctx.fillStyle = '#84cc16';
                ctx.beginPath();
                ctx.arc(pCollar.x, pCollar.y, 22 * pCollar.scale, 0, Math.PI * 2);
                ctx.fill();
            });

            // Technical Exploded Callout Indicators
            if (isExploded && explodeProgress > 0.6) {
                const callouts = [
                    { title: "Acier 216 000 PSI", desc: "Élasticité & Fouet Pro", x: 0, y: barY - 70 },
                    { title: "Roulements à Aiguilles", desc: "Rotation ultra-fluide", x: 120, y: barY - 110 },
                    { title: "Bumper Plate Caoutchouc", desc: "Absorption phonique IWF", x: 260, y: barY - 120 },
                ];

                callouts.forEach(c => {
                    const p = project(c.x, c.y, 0);
                    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
                    ctx.strokeStyle = '#84cc16';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.roundRect(p.x - 70, p.y - 25, 140, 48, 8);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = '#84cc16';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(c.title, p.x, p.y - 7);

                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '9px monospace';
                    ctx.fillText(c.desc, p.x, p.y + 10);
                });
            }
        }

    }, [rotX, rotY, zoom, viewMode, platesCount, includeRack, includeBench, includeBarbell, includeMats, benchAngle, isExploded, explodeProgress]);

    // Handle adding configured setup to Cart
    const handleAddSetupToCart = () => {
        const configuredItem = {
            id: 9991,
            name: `Setup Home Gym Pro 3D (${setupMetrics.floorSpaceM2} m² - ${setupMetrics.totalWeightKg} kg)`,
            price: setupMetrics.totalPrice,
            brand: 'FitnessShop',
            category: 'Racks & Stations',
            imageUrl: '/src/assets/images/category_rack_station_1790951619589.jpg',
            quantity: 10,
            description: `Pack complet assemblé en 3D : ${includeRack ? 'Rack Acier 75x75mm + ' : ''}${includeBench ? 'Banc Pro Réglable + ' : ''}${includeBarbell ? `Barre Olympique + ${totalBarbellWeight}kg de fonte + ` : ''}Dalles de protection.`,
            specifications: [
                { name: 'Surface au sol', value: `${setupMetrics.floorSpaceM2} m²` },
                { name: 'Poids total', value: `${setupMetrics.totalWeightKg} kg` },
                { name: 'Charge max', value: `${setupMetrics.capacityKg} kg` }
            ]
        };
        addToCart(configuredItem as any, 1, 'Setup Personnalisé 3D');
        openCart();
        addToast("Setup Home Gym 3D ajouté avec succès à votre panier !", "success");
    };

    return (
        <div className={`relative w-full ${isModal ? 'fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4' : 'rounded-3xl bg-[#090d16] text-white overflow-hidden border border-slate-800 shadow-2xl my-10'}`}>
            
            <div className={`w-full ${isModal ? 'max-w-6xl max-h-[92vh] bg-[#090d16] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl' : 'flex flex-col'}`}>
                
                {/* 1. Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-800 bg-[#0d1424]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#84cc16] text-black flex items-center justify-center font-black">
                            <Box className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#84cc16]">
                                    Studio 3D Temps Réel
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#84cc16] animate-ping"></span>
                            </div>
                            <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight leading-none">
                                {viewMode === 'gym' ? "Configurateur Home Gym 3D" : "Vue 360° & Éclaté Technique"}
                            </h3>
                        </div>
                    </div>

                    {/* Mode Switcher Tabs */}
                    <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                        <button
                            type="button"
                            onClick={() => { setViewMode('gym'); setIsExploded(false); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                viewMode === 'gym' ? 'bg-[#84cc16] text-black shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Box className="w-3.5 h-3.5" />
                            <span>Home Gym 3D</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setViewMode('barbell'); setIsExploded(false); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                viewMode === 'barbell' && !isExploded ? 'bg-[#84cc16] text-black shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Compass className="w-3.5 h-3.5" />
                            <span>Barre 360°</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setViewMode('barbell'); setIsExploded(true); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isExploded ? 'bg-[#84cc16] text-black shadow-md' : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Vue Éclatée</span>
                        </button>
                    </div>

                    {/* Close modal if active */}
                    {isModal && onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* 2. Interactive 3D Canvas Area */}
                <div className="relative w-full h-[400px] sm:h-[460px] bg-gradient-to-b from-[#090d16] via-[#0d1527] to-[#060911] select-none cursor-grab active:cursor-grabbing overflow-hidden">
                    <canvas 
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        className="w-full h-full block"
                    />

                    {/* Floating 3D Navigation Overlay Hints */}
                    <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2 pointer-events-none">
                        <Compass className="w-3.5 h-3.5 text-[#84cc16] animate-spin" />
                        <span>Faire pivoter : Glisser la souris ou le doigt (360°)</span>
                    </div>

                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={() => { setRotX(-0.35); setRotY(0.55); setZoom(1.0); }}
                            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700/80 text-xs transition-colors flex items-center gap-1"
                            title="Réinitialiser l'angle de vue"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-[#84cc16]" />
                            <span className="text-[10px] font-mono">Reset</span>
                        </button>

                        <button 
                            type="button"
                            onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
                            className="w-7 h-7 bg-slate-900/80 hover:bg-slate-800 text-white rounded-lg border border-slate-700/80 text-xs font-bold"
                        >
                            +
                        </button>
                        <button 
                            type="button"
                            onClick={() => setZoom(z => Math.max(0.7, z - 0.1))}
                            className="w-7 h-7 bg-slate-900/80 hover:bg-slate-800 text-white rounded-lg border border-slate-700/80 text-xs font-bold"
                        >
                            -
                        </button>
                    </div>

                    {/* Live Metric Badges */}
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                        <div className="bg-black/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Poids Configuré</span>
                            <span className="text-sm font-mono font-black text-[#84cc16]">
                                {viewMode === 'gym' ? `${setupMetrics.totalWeightKg} KG` : `${totalBarbellWeight} KG`}
                            </span>
                        </div>

                        {viewMode === 'gym' && (
                            <>
                                <div className="bg-black/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Empreinte au Sol</span>
                                    <span className="text-sm font-mono font-black text-white">{setupMetrics.floorSpaceM2} m²</span>
                                </div>
                                <div className="bg-black/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Résistance Max</span>
                                    <span className="text-sm font-mono font-black text-white">{setupMetrics.capacityKg} KG</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* 3. Bottom Control Console */}
                <div className="p-6 bg-[#0c1322] border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    {/* Controls per mode */}
                    {viewMode === 'gym' ? (
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                            <button
                                type="button"
                                onClick={() => setIncludeRack(!includeRack)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                    includeRack ? 'bg-[#84cc16]/10 border-[#84cc16] text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                                }`}
                            >
                                <span className="text-[10px] font-black uppercase block text-[#84cc16]">Équipement 1</span>
                                <span className="text-xs font-bold block">Power Rack 75x75</span>
                                <span className="text-[10px] font-mono text-slate-400">+1 249 DT</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIncludeBench(!includeBench)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                    includeBench ? 'bg-[#84cc16]/10 border-[#84cc16] text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                                }`}
                            >
                                <span className="text-[10px] font-black uppercase block text-[#84cc16]">Équipement 2</span>
                                <span className="text-xs font-bold block">Banc Réglable Pro</span>
                                <span className="text-[10px] font-mono text-slate-400">+349 DT</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIncludeBarbell(!includeBarbell)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                    includeBarbell ? 'bg-[#84cc16]/10 border-[#84cc16] text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                                }`}
                            >
                                <span className="text-[10px] font-black uppercase block text-[#84cc16]">Équipement 3</span>
                                <span className="text-xs font-bold block">Barre & Disques</span>
                                <span className="text-[10px] font-mono text-slate-400">+489 DT</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setIncludeMats(!includeMats)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                    includeMats ? 'bg-[#84cc16]/10 border-[#84cc16] text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                                }`}
                            >
                                <span className="text-[10px] font-black uppercase block text-[#84cc16]">Sol & Sécurité</span>
                                <span className="text-xs font-bold block">Dalles Caoutchouc</span>
                                <span className="text-[10px] font-mono text-slate-400">+120 DT</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-wrap items-center gap-3 w-full">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                                Disques Olympiques (Par côté) :
                            </span>
                            {([25, 20, 15, 10] as const).map((wt) => (
                                <div key={wt} className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                                    <span 
                                        className="w-3.5 h-3.5 rounded-full inline-block"
                                        style={{ backgroundColor: OLYMPIC_PLATES[wt].color }}
                                    ></span>
                                    <span className="text-xs font-mono font-bold">{wt} KG</span>
                                    <div className="flex items-center ml-2 gap-1">
                                        <button 
                                            type="button"
                                            onClick={() => setPlatesCount(p => ({ ...p, [wt]: Math.max(0, p[wt] - 1) }))}
                                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
                                        >
                                            -
                                        </button>
                                        <span className="w-4 text-center font-mono font-bold text-xs">{platesCount[wt]}</span>
                                        <button 
                                            type="button"
                                            onClick={() => setPlatesCount(p => ({ ...p, [wt]: Math.min(3, p[wt] + 1) }))}
                                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center text-xs"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Price & Checkout CTA */}
                    <div className="flex items-center gap-5 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Total Pack Configuré
                            </span>
                            <span className="text-2xl font-black text-white font-mono">
                                {setupMetrics.totalPrice.toFixed(3)} <span className="text-xs text-[#84cc16]">TND</span>
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleAddSetupToCart}
                            className="px-6 py-3.5 bg-[#84cc16] hover:bg-[#72b012] text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                        >
                            <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
                            <span>Ajouter ce Setup 3D au Panier</span>
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
};
