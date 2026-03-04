import * as Core from './cube-core.js';

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.addEventListener('pointerdown', (e) => {
        if (!document.getElementById('mode-paint').classList.contains('bg-emerald-500')) return;
        const idx = e.stickerIndex;
        if (idx === undefined) return;

        Core.updateStickerState(idx, Core.stickerStates[idx] ? 0 : 1);
        Core.render();
    });
}

/**
 * ペイント専用ボタンをヘッダーのボタンエリア付近に表示する
 */
function ensurePaintPanel(show) {
    let panel = document.getElementById('paint-panel');
    const paintBtn = document.getElementById('mode-paint');

    if (!panel && paintBtn) {
        // パネルを作成
        panel = document.createElement('div');
        panel.id = 'paint-panel';
        panel.className = "flex gap-2 ml-4 px-3 border-l border-slate-700 items-center";
        
        const buttons = [
            { text: 'FULL', type: 'full', color: 'bg-slate-700' },
            { text: 'GRAY', type: 'gray', color: 'bg-slate-700' },
            { text: 'C+C', type: 'cc', color: 'bg-emerald-600' }
        ];

        buttons.forEach(btnInfo => {
            const btn = document.createElement('button');
            btn.textContent = btnInfo.text;
            btn.className = `${btnInfo.color} px-2 py-1.5 rounded text-[9px] font-black text-white uppercase hover:brightness-125 transition`;
            btn.onclick = (e) => {
                e.stopPropagation();
                applyOrbit(btnInfo.type);
            };
            panel.appendChild(btn);
        });

        // PAINTボタンのすぐ右側に挿入
        paintBtn.parentNode.appendChild(panel);
    }

    if (panel) {
        panel.style.display = show ? 'flex' : 'none';
    }
}

export function applyOrbit(type) {
    if (type === 'full') Core.setAllStickers(1);
    else if (type === 'gray') Core.setAllStickers(0);
    else if (type === 'cc') {
        Core.setAllStickers(0);
        // エッジ(24ステッカー分)とセンターを表示
        const ccIdx = [1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43,46,48,50,52,4,13,22,31,40,49];
        ccIdx.forEach(i => Core.updateStickerState(i, 1));
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const moveGrid = document.getElementById('move-grid');
    const tabArea = document.querySelector('.tab-btn')?.parentNode;

    // ヘッダー付近にボタンを出現させる
    ensurePaintPanel(isPaint);

    if (moveGrid) moveGrid.style.display = isPaint ? 'none' : 'grid';
    if (tabArea) tabArea.style.display = isPaint ? 'none' : 'flex';

    // ボタンのスタイル更新
    const pb = document.getElementById('mode-paint');
    const rb = document.getElementById('mode-rotate');
    
    if (pb) pb.className = isPaint 
        ? "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white"
        : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
    
    if (rb) rb.className = !isPaint 
        ? "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white"
        : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
    
    applyOrbit(isPaint ? 'gray' : 'full');
}