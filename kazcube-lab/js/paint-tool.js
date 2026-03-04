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

function ensurePaintPanel(show) {
    let panel = document.getElementById('paint-panel');
    const paintBtn = document.getElementById('mode-paint');

    if (!panel && paintBtn) {
        panel = document.createElement('div');
        panel.id = 'paint-panel';
        panel.className = "flex gap-2 ml-4 px-3 border-l border-slate-700 items-center";
        
        const buttons = [
            { text: 'GRAY', type: 'gray', color: 'bg-slate-700' },
            { text: 'C+C', type: 'cc', color: 'bg-emerald-600' },
            { text: 'FULL', type: 'full', color: 'bg-slate-700' }
        ];

        buttons.forEach(btnInfo => {
            const btn = document.createElement('button');
            btn.textContent = btnInfo.text;
            btn.className = `${btnInfo.color} px-2 py-1.5 rounded text-[9px] font-black text-white uppercase hover:brightness-125 transition`;
            // Coreを通さず、このファイル内のapplyOrbitを確実に呼ぶ
            btn.onclick = () => applyOrbit(btnInfo.type);
            panel.appendChild(btn);
        });

        paintBtn.parentNode.appendChild(panel);
    }

    if (panel) {
        panel.style.display = show ? 'flex' : 'none';
    }
}

export function applyOrbit(type) {
    // Core の関数が確実に存在するかチェックしながら実行
    if (type === 'full') {
        Core.setAllStickers(1);
    } else if (type === 'gray') {
        Core.setAllStickers(0);
    } else if (type === 'cc') {
        Core.setAllStickers(0);
        // Center(4,13,22,31,40,49) + Corner(各面0,2,6,8...)
        const centersAndCorners = [
            0, 2, 4, 6, 8,      // U
            9, 11, 13, 15, 17,  // R
            18, 20, 22, 24, 26, // F
            27, 29, 31, 33, 35, // D
            36, 38, 40, 42, 44, // L
            45, 47, 49, 51, 53  // B
        ];
        centersAndCorners.forEach(i => Core.updateStickerState(i, 1));
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const moveGrid = document.getElementById('move-grid');
    const tabArea = document.querySelector('.tab-btn')?.parentNode;

    ensurePaintPanel(isPaint);

    if (moveGrid) moveGrid.style.display = isPaint ? 'none' : 'grid';
    if (tabArea) tabArea.style.display = isPaint ? 'none' : 'flex';

    // ボタン色制御
    const pb = document.getElementById('mode-paint');
    const rb = document.getElementById('mode-rotate');
    if (pb) pb.classList.toggle('bg-emerald-500', isPaint);
    if (rb) rb.classList.toggle('bg-emerald-500', !isPaint);
    
    // モード切替時の初期化: PaintならGRAY、RotateならFULL
    applyOrbit(isPaint ? 'gray' : 'full');
}