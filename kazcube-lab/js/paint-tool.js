import * as Core from './cube-core.js';

/**
 * ペイントツールの初期化
 * キューブのステッカーをクリックした際の挙動を定義
 */
export function initPaintTool() {
    const player = document.getElementById('main-cube');
    if (!player) return;

    player.addEventListener('pointerdown', (e) => {
        // PAINTモードが有効（ボタンが緑色）な時だけ反応する
        const paintBtn = document.getElementById('mode-paint');
        if (!paintBtn || !paintBtn.classList.contains('bg-emerald-500')) return;

        const idx = e.stickerIndex;
        if (idx === undefined) return;

        // ステッカーの状態を反転 (1:表示 / 0:非表示)
        const currentState = Core.stickerStates[idx];
        Core.updateStickerState(idx, currentState === 1 ? 0 : 1);
        
        // 描画更新（ハッシュ更新も含む）
        Core.render();
    });
}

/**
 * ペイント専用パネル（GRAY / C+C / FULL）を生成・表示制御
 */
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
            btn.className = "px-2 py-1.5 rounded text-[9px] font-black text-white uppercase bg-slate-700 hover:brightness-125 transition";
            btn.onclick = (e) => {
                e.stopPropagation();
                applyOrbit(item.key);
            };
            panel.appendChild(btn);
        });

        paintBtn.parentNode.appendChild(panel);
    }

    if (panel) {
        panel.style.display = show ? 'flex' : 'none';
    }
}

/**
 * プリセットのマスク（塗り絵）を適用
 */
export function applyOrbit(type) {
    // 全ボタンのハイライトをリセット
    ['gray', 'cc', 'full'].forEach(key => {
        const el = document.getElementById(`btn-orbit-${key}`);
        if (el) {
            if (key === type) {
                el.classList.replace('bg-slate-700', 'bg-emerald-500');
            } else {
                el.classList.replace('bg-emerald-500', 'bg-slate-700');
            }
        }
    });

    if (type === 'full') {
        Core.setAllStickers(1);
    } else if (type === 'gray') {
        Core.setAllStickers(0);
    } else if (type === 'cc') {
        Core.setAllStickers(0);
        // Center(真ん中) + Corner(四隅) のインデックス
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

/**
 * ROTATE / PAINT モードの切り替え
 */
export function setPaintMode(mode) {
    const isPaint = (mode === 'paint');
    const moveGrid = document.getElementById('move-grid');
    const tabArea = document.querySelector('.tab-btn')?.parentNode;

    // パネルの表示・非表示
    ensurePaintPanel(isPaint);

    // 回転UIの隠蔽設定
    if (moveGrid) moveGrid.style.display = isPaint ? 'none' : 'grid';
    if (tabArea) tabArea.style.display = isPaint ? 'none' : 'flex';

    // モード切り替えボタンのスタイル
    const pb = document.getElementById('mode-paint');
    const rb = document.getElementById('mode-rotate');
    
    if (pb) {
        pb.className = isPaint 
            ? "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white"
            : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
    }
    if (rb) {
        rb.className = !isPaint 
            ? "px-5 py-2 bg-emerald-500 font-black text-[10px] uppercase rounded-lg text-white"
            : "px-5 py-2 bg-slate-800 text-slate-500 font-black text-[10px] uppercase rounded-lg";
    }

    // すでにURLハッシュから復元されたデータ（非表示ステッカー）があるか確認
    const hasMask = Core.stickerStates.includes(0);

    // 新規でPaintモードにする時、かつ何も塗られていない時だけ初期マスク(GRAY)を適用
    if (isPaint && !hasMask) {
        applyOrbit('gray');
    } else if (!isPaint && !hasMask) {
        // Rotateモードに戻る時は全表示に戻す（お好みで調整）
        applyOrbit('full');
    }

    // 最後に描画を強制更新
    Core.render();
}