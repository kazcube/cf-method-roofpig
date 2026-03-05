/**
 * KAZCUBE Lab Paint Tool Module
 * v2.0.47: Restored MASK buttons and fixed color swatches interaction.
 */

import * as Core from './cube-core.js?v=2.0.47';

let selectedMode = 1; // 1: Visible, 0: Gray

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    
    player.addEventListener('pointerdown', (e) => {
        const isPaintMode = document.getElementById('mode-paint').classList.contains('bg-emerald-500');
        if (!isPaintMode) return;
        
        const idx = e.stickerIndex;
        if (idx !== undefined) {
            Core.updateStickerState(idx, selectedMode);
            Core.render(true); // Force update to ensure mask applies
        }
    });

    // Orbit Buttons
    document.getElementById('btn-gray').onclick = () => { Core.setAllStickers(0); Core.render(true); };
    document.getElementById('btn-cc').onclick = () => { 
        Core.setAllStickers(0);
        // Centers + Corners
        const ccIdx = [4, 13, 22, 31, 40, 49, 0, 2, 6, 8, 9, 11, 15, 17, 18, 20, 24, 26, 27, 29, 33, 35, 36, 38, 42, 44, 45, 47, 51, 53];
        ccIdx.forEach(i => Core.updateStickerState(i, 1));
        Core.render(true);
    };
    document.getElementById('btn-full').onclick = () => { Core.setAllStickers(1); Core.render(true); };

    renderSwatches();
}

function renderSwatches() {
    const container = document.getElementById('swatch-container');
    if (!container) return;
    container.innerHTML = "";
    
    const options = [
        { id: 1, hex: '#ffffff', label: 'DRAW' },
        { id: 0, hex: '#4b5563', label: 'ERASE' }
    ];

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = `w-6 h-6 rounded-full border border-slate-700 transition-all swatch-item ${opt.id === selectedMode ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900 scale-110' : ''}`;
        btn.style.backgroundColor = opt.hex;
        btn.onclick = (e) => {
            e.stopPropagation();
            selectedMode = opt.id;
            document.querySelectorAll('.swatch-item').forEach(b => b.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2', 'scale-110'));
            btn.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2', 'scale-110');
        };
        container.appendChild(btn);
    });
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const rotateBtn = document.getElementById('mode-rotate');
    const paintBtn = document.getElementById('mode-paint');
    const rotatePanel = document.getElementById('rotate-panel');
    const paintControls = document.getElementById('paint-controls');

    if (isPaint) {
        paintBtn.className = "px-5 py-2.5 bg-emerald-500 font-black text-[10px] rounded-lg text-white shadow-lg shadow-emerald-500/20";
        rotateBtn.className = "px-5 py-2.5 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg hover:text-white";
        rotatePanel.classList.add('hidden');
        paintControls.classList.remove('hidden');
        paintControls.classList.add('flex');
    } else {
        rotateBtn.className = "px-5 py-2.5 bg-emerald-500 font-black text-[10px] rounded-lg text-white shadow-lg shadow-emerald-500/20";
        paintBtn.className = "px-5 py-2.5 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg hover:text-white";
        rotatePanel.classList.remove('hidden');
        paintControls.classList.add('hidden');
        paintControls.classList.remove('flex');
    }
}