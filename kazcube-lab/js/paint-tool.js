import * as Core from './cube-core.js?v=1.9.7';

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
        
        const config = [{k:'gray',t:'GRAY'}, {k:'cc',t:'C+C'}, {k:'full',t:'FULL'}];
        config.forEach(item => {
            const btn = document.createElement('button');
            btn.id = `btn-orbit-${item.k}`;
            btn.textContent = item.t;
            btn.className = "px-2 py-1.5 rounded text-[9px] font-black text-white bg-slate-700 hover:brightness-125 transition";
            btn.onclick = (e) => { e.stopPropagation(); applyOrbit(item.k); };
            panel.appendChild(btn);
        });
        paintBtn.parentNode.appendChild(panel);
    }
    if (panel) panel.style.display = show ? 'flex' : 'none';
}

export function applyOrbit(type) {
    ['gray', 'cc', 'full'].forEach(k => {
        const el = document.getElementById(`btn-orbit-${k}`);
        if (el) {
            el.classList.toggle('bg-emerald-500', k === type);
            el.classList.toggle('bg-slate-700', k !== type);
        }
    });

    if (type === 'full') Core.setAllStickers(1);
    else if (type === 'gray') Core.setAllStickers(0);
    else if (type === 'cc') {
        Core.setAllStickers(0);
        [0,2,4,6,8, 9,11,13,15,17, 18,20,22,24,26, 27,29,31,33,35, 36,38,40,42,44, 45,47,49,51,53]
        .forEach(i => Core.updateStickerState(i, 1));
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    ensurePaintPanel(isPaint);

    const moveGridWrap = document.getElementById('move-grid-container');
    if (moveGridWrap) moveGridWrap.style.display = isPaint ? 'none' : 'block';

    const pb = document.getElementById('mode-paint');
    const rb = document.getElementById('mode-rotate');
    if (pb) pb.className = isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg";
    if (rb) rb.className = !isPaint ? "px-5 py-2 bg-emerald-500 font-black text-[10px] rounded-lg text-white" : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] rounded-lg";
    
    // 現在の状態を尊重
    if (isPaint && !Core.stickerStates.includes(0)) applyOrbit('gray');
    else if (!isPaint && !Core.stickerStates.includes(0)) applyOrbit('full');
    
    Core.render();
}