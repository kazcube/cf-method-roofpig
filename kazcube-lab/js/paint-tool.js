/**
 * KAZCUBE Lab Paint Tool Module
 * v2.0.43: Linked custom colors to Core's stickerFill logic.
 */

import * as Core from './cube-core.js';

let selectedColor = 1; // 1: White, 2: Yellow, ... 0: Gray

/* [LOCKED: NO-REMOVE] */
export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;
    
    player.addEventListener('pointerdown', (e) => {
        const pb = document.getElementById('mode-paint');
        if (!pb || !pb.classList.contains('bg-emerald-500')) return;
        
        const idx = e.stickerIndex;
        if (idx !== undefined) {
            // Coreの色情報を更新して再描画
            Core.updateStickerColor(idx, selectedColor);
            Core.render();
        }
    });
}

function ensurePaintPanel(show) {
    let panel = document.getElementById('paint-panel');
    const container = document.getElementById('mode-container');
    
    if (!panel && container) {
        panel = document.createElement('div');
        panel.id = 'paint-panel';
        panel.className = "flex flex-col gap-2 ml-4 px-3 border-l border-slate-700 items-start py-1";
        
        const orbitRow = document.createElement('div');
        orbitRow.className = "flex gap-1";
        const orbitOpts = [
            { k: 'gray', t: 'GRAY', color: 'bg-slate-600' },
            { k: 'cc', t: 'C+C', color: 'bg-indigo-600' },
            { k: 'full', t: 'FULL', color: 'bg-emerald-600' }
        ];
        orbitOpts.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt.t;
            btn.className = `px-2 py-1 rounded text-[8px] font-black text-white ${opt.color} hover:opacity-80 transition`;
            btn.onclick = (e) => { e.stopPropagation(); applyOrbit(opt.k); };
            orbitRow.appendChild(btn);
        });
        panel.appendChild(orbitRow);

        const colorRow = document.createElement('div');
        colorRow.className = "flex gap-1.5 mt-1";
        
        const colors = [
            { id: 1, hex: '#ffffff', name: 'white' },
            { id: 2, hex: '#ffff00', name: 'yellow' },
            { id: 3, hex: '#00ff00', name: 'green' },
            { id: 4, hex: '#0000ff', name: 'blue' },
            { id: 5, hex: '#ff0000', name: 'red' },
            { id: 6, hex: '#ffa500', name: 'orange' },
            { id: 0, hex: '#4b5563', name: 'gray' }
        ];

        colors.forEach(c => {
            const cbtn = document.createElement('button');
            cbtn.className = `w-5 h-5 rounded-full border-2 border-slate-900 transition active:scale-90 color-swatch`;
            cbtn.style.backgroundColor = c.hex;
            cbtn.dataset.colorId = c.id;
            
            if (c.id === selectedColor) cbtn.classList.add('border-white', 'scale-110');

            cbtn.onclick = (e) => {
                e.stopPropagation();
                selectedColor = c.id;
                document.querySelectorAll('.color-swatch').forEach(b => {
                    b.classList.remove('border-white', 'scale-110');
                });
                cbtn.classList.add('border-white', 'scale-110');
            };
            colorRow.appendChild(cbtn);
        });
        panel.appendChild(colorRow);
        container.appendChild(panel);
    }
    
    if (panel) panel.style.display = show ? 'flex' : 'none';
}

/* [LOCKED: NO-REMOVE] */
export function applyOrbit(type) {
    if (type === 'full') Core.setAllStickers(null); // 標準色リセット
    else if (type === 'gray') Core.setAllStickers(0); // 全グレー
    else if (type === 'cc') {
        Core.setAllStickers(0);
        // Centers (4,13,22,31,40,49) + Corners
        const ccIndices = [4, 13, 22, 31, 40, 49, 0, 2, 6, 8, 9, 11, 15, 17, 18, 20, 24, 26, 27, 29, 33, 35, 36, 38, 42, 44, 45, 47, 51, 53];
        ccIndices.forEach(i => Core.updateStickerColor(i, 1)); // とりあえず白を表示
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    ensurePaintPanel(isPaint);
    const grid = document.getElementById('move-grid-container');
    if (grid) grid.style.display = isPaint ? 'none' : 'block';
    
    const pb = document.getElementById('mode-paint'), rb = document.getElementById('mode-rotate');
    if (pb) pb.className = isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg";
    if (rb) rb.className = !isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg";
    
    Core.render();
}