import * as Core from './cube-core.js';

// 3x3x3の各パーツに属するステッカーインデックスの定義
const ORBIT_INDICES = {
    CENTERS: [4, 13, 22, 31, 40, 49],
    CORNERS: [0, 2, 6, 8, 9, 11, 15, 17, 18, 20, 24, 26, 27, 29, 33, 35, 36, 38, 42, 44, 45, 47, 51, 53],
    EDGES: [1, 3, 5, 7, 10, 12, 14, 16, 19, 21, 23, 25, 28, 30, 32, 34, 37, 39, 41, 43, 46, 48, 50, 52]
};

export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    // 特定のパーツ（ステッカー）をクリックした時の挙動
    player.addEventListener('pointerdown', (e) => {
        const isPaintMode = document.getElementById('mode-paint').classList.contains('bg-emerald-500');
        if (!isPaintMode) return;

        const idx = e.stickerIndex;
        if (idx === undefined) return;

        // トグル切り替え: 表示されていれば消す（グレー）、消えていれば出す
        if (Core.visibleStickers.has(idx)) {
            Core.visibleStickers.delete(idx);
        } else {
            Core.visibleStickers.add(idx);
        }
        Core.render();
    });
}

export function applyOrbit(type) {
    // 既存のOrbit文字列指定を、Core.visibleStickersの操作に置き換え
    if (type === 'full') {
        Core.visibleStickers = new Set(Array.from({length: 54}, (_, i) => i));
    } else if (type === 'gray') {
        Core.visibleStickers.clear();
    } else if (type === 'cc') {
        // Cross + Centers (エッジは表示、コーナーは非表示)
        Core.visibleStickers.clear();
        [...ORBIT_INDICES.EDGES, ...ORBIT_INDICES.CENTERS].forEach(i => Core.visibleStickers.add(i));
    }
    Core.render();
}

export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const paintBtn = document.getElementById('mode-paint');
    const rotateBtn = document.getElementById('mode-rotate');

    // UIのボタンスタイル切り替え
    if (isPaint) {
        paintBtn.className = "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white";
        rotateBtn.className = "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
        applyOrbit('gray'); // ペイント開始時はグレーから
    } else {
        rotateBtn.className = "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white";
        paintBtn.className = "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
        applyOrbit('full'); // 通常モードは全表示
    }
}