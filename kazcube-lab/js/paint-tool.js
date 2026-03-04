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
 * ペイント専用パネル（C+Centerなどのボタン）を確実に作成・表示する
 */
function ensurePaintPanel(show) {
    let panel = document.getElementById('paint-panel');
    const slider = document.getElementById('move-slider');

    if (!panel && slider) {
        // パネルが存在しない場合は作成してスライダーの下に挿入
        panel = document.createElement('div');
        panel.id = 'paint-panel';
        panel.className = "flex justify-center gap-4 mt-4 mb-4";
        
        // ボタンの生成ロジック
        const buttons = [
            { id: 'orbit-full', text: 'ALL COLOR', type: 'full', color: 'bg-slate-700' },
            { id: 'orbit-gray', text: 'ALL GRAY', type: 'gray', color: 'bg-slate-700' },
            { id: 'orbit-cc', text: 'C+CENTER', type: 'cc', color: 'bg-emerald-600' }
        ];

        buttons.forEach(btnInfo => {
            const btn = document.createElement('button');
            btn.id = btnInfo.id;
            btn.textContent = btnInfo.text;
            btn.className = `${btnInfo.color} px-4 py-2 rounded-md text-[10px] font-bold text-white hover:opacity-80 transition`;
            btn.onclick = () => applyOrbit(btnInfo.type);
            panel.appendChild(btn);
        });

        // スライダーの親要素の末尾、またはスライダーの直後に挿入
        slider.parentNode.insertBefore(panel, slider.nextSibling);
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
        // エッジとセンターを表示
        [1,3,5,7,10,12,14,16,19,21,23,25,28,30,32,34,37,39,41,43,46,48,50,52,4,13,22,31,40,49]
            .forEach(i => Core.updateStickerState(i, 1));
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const moveGrid = document.getElementById('move-grid');
    const tabWrapper = document.querySelector('.flex.gap-1.mb-2');

    // ペイントパネルの強制制御
    ensurePaintPanel(isPaint);

    // 回転UIの表示切り替え
    if (moveGrid) moveGrid.style.display = isPaint ? 'none' : 'grid';
    if (tabWrapper) tabWrapper.style.display = isPaint ? 'none' : 'flex';

    // モードボタンのスタイル更新
    const paintBtn = document.getElementById('mode-paint');
    const rotateBtn = document.getElementById('mode-rotate');
    
    if (paintBtn) paintBtn.className = isPaint 
        ? "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white"
        : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
    
    if (rotateBtn) rotateBtn.className = !isPaint 
        ? "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white"
        : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
    
    applyOrbit(isPaint ? 'gray' : 'full');
}