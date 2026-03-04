import * as Core from './cube-core.js';

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.addEventListener('pointerdown', (e) => {
        const pb = document.getElementById('mode-paint');
        if (!pb || !pb.classList.contains('bg-emerald-500')) return;

        const idx = e.stickerIndex;
        if (idx === undefined) return;

        Core.updateStickerState(idx, Core.stickerStates[idx] ? 0 : 1);
        Core.render();
    });
}

function ensurePaintPanel(show) {
    let panel = document.getElementById('paint-panel');
    const paintBtn = document.getElementById('mode-paint');
    if (!panel && paintBtn) {
        panel = document.createElement('div');
        panel.id = 'paint-panel';
        panel.className = "flex gap-2 ml-4 px-3 border-l border-slate-700 items-center";
        
        const config = [
            { key: 'gray', text: 'GRAY' },
            { key: 'cc', text: 'C+C' },
            { key: 'full', text: 'FULL' }
        ];

        config.forEach(item => {
            const btn = document.createElement('button');
            btn.id = `btn-orbit-${item.key}`;
            btn.textContent = item.text;
            btn.className = "px-2 py-1.5 rounded text-[9px] font-black text-white bg-slate-700 hover:brightness-125 transition";
            btn.onclick = () => applyOrbit(item.key);
            panel.appendChild(btn);
        });
        paintBtn.parentNode.appendChild(panel);
    }
    if (panel) panel.style.display = show ? 'flex' : 'none';
}

export function applyOrbit(type) {
    // ボタンのハイライト更新
    ['gray', 'cc', 'full'].forEach(k => {
        const el = document.getElementById(`btn-orbit-${k}`);
        if (el) el.classList.toggle('bg-emerald-500', k === type);
        if (el) el.classList.toggle('bg-slate-700', k !== type);
    });

    if (type === 'full') {
        Core.setAllStickers(1);
    } else if (type === 'gray') {
        Core.setAllStickers(0);
    } else if (type === 'cc') {
        Core.setAllStickers(0);
        const ccIdx = [0,2,4,6,8, 9,11,13,15,17, 18,20,22,24,26, 27,29,31,33,35, 36,38,40,42,44, 45,47,49,51,53];
        ccIdx.forEach(i => Core.updateStickerState(i, 1));
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    ensurePaintPanel(isPaint);

    const moveGrid = document.getElementById('move-grid');
    const tabArea = document.querySelector('.tab-btn')?.parentNode;
    if (moveGrid) moveGrid.style.display = isPaint ? 'none' : 'grid';
    if (tabArea) tabArea.style.display = isPaint ? 'none' : 'flex';

    const pb = document.getElementById('mode-paint');
    const rb = document.getElementById('mode-rotate');
    if (pb) pb.className = isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg";
    if (rb) rb.className = !isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg";
    
    // 初期状態の制御
    const hasMask = Core.stickerStates.includes(0);
    if (isPaint && !hasMask) {
        applyOrbit('gray');
    } else if (!isPaint && !hasMask) {
        applyOrbit('full');
    }
}