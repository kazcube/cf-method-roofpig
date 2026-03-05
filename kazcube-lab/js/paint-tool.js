/**
 * KAZCUBE Lab Paint Tool Module
 * v2.0.46: Logic for Orbit buttons and color swatches using MASK.
 */

import * as Core from './cube-core.js?v=2.0.46';

let selectedMode = 1; // 1 = Visible, 0 = Hidden (Gray)

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;
    
    player.addEventListener('pointerdown', (e) => {
        const isPaint = document.getElementById('mode-paint').classList.contains('bg-emerald-500');
        if (!isPaint) return;
        
        const idx = e.stickerIndex;
        if (idx !== undefined) {
            Core.updateStickerState(idx, selectedMode);
            Core.render();
        }
    });

    // Orbit Buttons
    document.getElementById('btn-gray').onclick = () => { Core.setAllStickers(0); Core.render(); };
    document.getElementById('btn-cc').onclick = () => { 
        Core.setAllStickers(0);
        // centers + corners
        const ccIdx = [4, 13, 22, 31, 40, 49, 0, 2, 6, 8, 9, 11, 15, 17, 18, 20, 24, 26, 27, 29, 33, 35, 36, 38, 42, 44, 45, 47, 51, 53];
        ccIdx.forEach(i => Core.updateStickerState(i, 1));
        Core.render();
    };
    document.getElementById('btn-full').onclick = () => { Core.setAllStickers(1); Core.render(); };

    renderSwatches();
}

function renderSwatches() {
    const container = document.getElementById('swatch-container');
    if (!container) return;
    
    // 現在のMASKベースでは「色そのもの」を変えるのではなく、
    // 「表示するか(1)」「消すか(0)」のみですが、UIとしてパレットを置きます
    const colors = [
        { id: 1, hex: '#10b981', label: 'DRAW' },
        { id: 0, hex: '#4b5563', label: 'ERASE' }
    ];

    colors.forEach(c => {
        const btn = document.createElement('button');
        btn.className = `w-5 h-5 rounded-full border border-slate-700 transition swatch-item ${c.id === selectedMode ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''}`;
        btn.style.backgroundColor = c.hex;
        btn.onclick = (e) => {
            e.stopPropagation();
            selectedMode = c.id;
            document.querySelectorAll('.swatch-item').forEach(b => b.classList.remove('ring-2', 'ring-white', 'ring-offset-2', 'scale-110'));
            btn.classList.add('ring-2', 'ring-white', 'ring-offset-2', 'scale-110');
        };
        container.appendChild(btn);
    });
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    document.getElementById('rotate-panel').style.display = isPaint ? 'none' : 'block';
    document.getElementById('paint-controls').style.display = isPaint ? 'flex' : 'none';

    const pb = document.getElementById('mode-paint');
    const rb = document.getElementById('mode-rotate');
    
    if (isPaint) {
        pb.className = "px-5 py-2.5 bg-emerald-500 font-black text-[10px] rounded-lg text-white shadow-lg shadow-emerald-500/20 transition-all";
        rb.className = "px-5 py-2.5 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg hover:text-white transition-all";
    } else {
        rb.className = "px-5 py-2.5 bg-emerald-500 font-black text-[10px] rounded-lg text-white shadow-lg shadow-emerald-500/20 transition-all";
        pb.className = "px-5 py-2.5 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg hover:text-white transition-all";
    }
}