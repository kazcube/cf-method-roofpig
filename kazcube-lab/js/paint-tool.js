/**
 * KAZCUBE Lab Paint Tool Module
 * v2.0.45: Fixed UI Layout and Button interactions.
 */

import * as Core from './cube-core.js?v=2.0.45';

let selectedColor = 1; // 1: White... 0: Gray (Eraser)

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;
    
    player.addEventListener('pointerdown', (e) => {
        const isPaintMode = document.getElementById('mode-paint')?.classList.contains('bg-emerald-500');
        if (!isPaintMode) return;
        
        const idx = e.stickerIndex;
        if (idx !== undefined) {
            Core.updateStickerColor(idx, selectedColor);
            Core.render();
        }
    });

    // 初期生成
    renderPaintPanel();
}

/**
 * ペイント用コントロール（Orbitボタン & 6色パレット）の描画
 */
function renderPaintPanel() {
    const container = document.getElementById('paint-controls');
    if (!container) return;
    container.innerHTML = "";

    // --- Orbit Buttons (GRAY, C+C, FULL) ---
    const orbitGroup = document.createElement('div');
    orbitGroup.className = "flex gap-1 items-center";
    const orbitOpts = [
        { k: 'gray', t: 'GRAY', color: 'bg-slate-700' },
        { k: 'cc', t: 'C+C', color: 'bg-indigo-700' },
        { k: 'full', t: 'FULL', color: 'bg-emerald-700' }
    ];
    orbitOpts.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt.t;
        btn.className = `px-2 py-1.5 rounded text-[8px] font-black text-white ${opt.color} hover:opacity-80 transition active:scale-95`;
        btn.onclick = (e) => { 
            e.stopPropagation(); 
            applyOrbit(opt.k); 
        };
        orbitGroup.appendChild(btn);
    });
    container.appendChild(orbitGroup);

    // --- Color Swatches ---
    const colorGroup = document.createElement('div');
    colorGroup.className = "flex gap-1.5 items-center ml-2 border-l border-slate-700 pl-3";
    const colors = [
        { id: 1, hex: '#ffffff' }, // White
        { id: 2, hex: '#ffff00' }, // Yellow
        { id: 3, hex: '#00ff00' }, // Green
        { id: 4, hex: '#0000ff' }, // Blue
        { id: 5, hex: '#ff0000' }, // Red
        { id: 6, hex: '#ffa500' }, // Orange
        { id: 0, hex: '#4b5563' }  // Gray (Eraser)
    ];

    colors.forEach(c => {
        const btn = document.createElement('button');
        btn.className = `w-4 h-4 rounded-full border border-slate-900 transition active:scale-90 swatch-item ${c.id === selectedColor ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''}`;
        btn.style.backgroundColor = c.hex;
        btn.onclick = (e) => {
            e.stopPropagation();
            selectedColor = c.id;
            document.querySelectorAll('.swatch-item').forEach(b => b.classList.remove('ring-2', 'ring-white', 'ring-offset-2', 'scale-110'));
            btn.classList.add('ring-2', 'ring-white', 'ring-offset-2', 'scale-110');
        };
        colorGroup.appendChild(btn);
    });
    container.appendChild(colorGroup);
}

function applyOrbit(type) {
    if (type === 'full') {
        Core.setAllStickers(null); // Reset to default
    } else if (type === 'gray') {
        Core.setAllStickers(0); // All gray
    } else if (type === 'cc') {
        Core.setAllStickers(0);
        const ccIdx = [4, 13, 22, 31, 40, 49, 0, 2, 6, 8, 9, 11, 15, 17, 18, 20, 24, 26, 27, 29, 33, 35, 36, 38, 42, 44, 45, 47, 51, 53];
        ccIdx.forEach(i => Core.updateStickerColor(i, 1)); // White for centers/corners
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const rotatePanel = document.getElementById('rotate-panel');
    const paintPanel = document.getElementById('paint-controls');
    const pb = document.getElementById('mode-paint');
    const rb = document.getElementById('mode-rotate');

    if (rotatePanel) rotatePanel.style.display = isPaint ? 'none' : 'block';
    if (paintPanel) paintPanel.style.display = isPaint ? 'flex' : 'none';

    if (pb) pb.className = isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg";
    if (rb) rb.className = !isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg";
    
    Core.render();
}