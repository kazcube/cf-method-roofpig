/**
 * KAZCUBE Lab Paint Tool Module
 * * [History]
 * v2.0.2: Initial paint logic.
 * v2.0.5: Added GRAY/FULL/CC presets.
 * v2.0.6: Fixed insertion point for Paint Panel to ensure visibility.
 */

import * as Core from './cube-core.js?v=2.0.6';

/* [LOCKED: NO-REMOVE] */
export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;
    player.addEventListener('pointerdown', (e) => {
        const pb = document.getElementById('mode-paint');
        if (!pb || !pb.classList.contains('bg-emerald-500')) return;
        const idx = e.stickerIndex;
        if (idx !== undefined) {
            Core.updateStickerState(idx, Core.stickerStates[idx] ? 0 : 1);
            Core.render();
        }
    });
}

/* [LOCKED: NO-REMOVE] */
function ensurePaintPanel(show) {
    let panel = document.getElementById('paint-panel');
    const container = document.getElementById('mode-container');
    
    if (!panel && container) {
        panel = document.createElement('div');
        panel.id = 'paint-panel';
        panel.className = "flex gap-2 ml-4 px-3 border-l border-slate-700 items-center";
        
        const opts = [{k:'gray',t:'GRAY'}, {k:'cc',t:'C+C'}, {k:'full',t:'FULL'}];
        opts.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt.t;
            btn.className = "px-2 py-1.5 rounded text-[9px] font-black text-white bg-slate-700 hover:bg-slate-600";
            btn.onclick = (e) => { e.stopPropagation(); applyOrbit(opt.k); };
            panel.appendChild(btn);
        });
        container.appendChild(panel);
    }
    if (panel) panel.style.display = show ? 'flex' : 'none';
}

/* [LOCKED: NO-REMOVE] */
export function applyOrbit(type) {
    if (type === 'full') Core.setAllStickers(1);
    else if (type === 'gray') Core.setAllStickers(0);
    else if (type === 'cc') {
        Core.setAllStickers(0);
        [0,2,4,6,8, 9,11,13,15,17, 18,20,22,24,26, 27,29,31,33,35, 36,38,40,42,44, 45,47,49,51,53].forEach(i => Core.updateStickerState(i, 1));
    }
    Core.render();
}

/* [LOCKED: NO-REMOVE] */
export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    ensurePaintPanel(isPaint);

    const grid = document.getElementById('move-grid-container');
    if (grid) grid.style.display = isPaint ? 'none' : 'block';

    const pb = document.getElementById('mode-paint');
    const rb = document.getElementById('mode-rotate');
    if (pb) pb.className = isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg transition";
    if (rb) rb.className = !isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg transition";
    
    Core.render();
}