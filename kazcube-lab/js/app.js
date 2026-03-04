// js/app.js
import * as Core from './cube-core.js';
import * as Paint from './paint-tool.js';

// 回転ボタンのセット定義
const moveSets = {
    basic: ['U', 'D', 'L', 'R', 'F', 'B'],
    wide: ['u', 'd', 'l', 'r', 'f', 'b'],
    slice: ['M', 'E', 'S', 'x', 'y', 'z']
};

let currentTab = 'basic';

/**
 * 現在のタブに基づいて回転ボタンを動的に生成する
 */
function updateMoveGrid() {
    const grid = document.getElementById('move-grid');
    if (!grid) return;
    
    // グリッドを一旦空にする
    grid.innerHTML = "";
    
    const faces = moveSets[currentTab];
    faces.forEach(f => {
        // 標準、プライム(')、2回転(2)の3種を生成
        [f, f + "'", f + "2"].forEach(m => {
            const b = document.createElement('button');
            // デザイン：角丸(rounded-lg)、フォント、ホバー、アクティブ時
            b.className = "bg-slate-800 py-2.5 rounded-lg font-mono text-[11px] font-bold hover:bg-slate-700 transition active:scale-95 active:bg-indigo-900 border border-slate-700/50";
            b.textContent = m;
            
            b.onclick = () => {
                Core.activeMoves.push(m);
                const slider = document.getElementById('move-slider');
                if (slider) {
                    slider.max = Core.activeMoves.length;
                    slider.value = Core.activeMoves.length;
                }
                Core.render();
            };
            grid.appendChild(b);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. 回転ボタンの初期生成
    updateMoveGrid();

    // 2. タブ切り替えイベント
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            // 全てのタブからactiveを消し、クリックされたものに付与
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // データ属性からタブ名を取得して更新
            currentTab = btn.dataset.tab;
            updateMoveGrid();
        };
    });

    // 3. モード切替（Rotate / Paint）
    const btnRotate = document.getElementById('mode-rotate');
    const btnPaint = document.getElementById('mode-paint');

    if (btnRotate && btnPaint) {
        btnRotate.onclick = () => {
            btnRotate.className = "mode-select-btn active-rotate";
            btnPaint.className = "mode-select-btn inactive-mode";
            Paint.setPaintMode('rotate');
        };
        btnPaint.onclick = () => {
            btnPaint.className = "mode-select-btn active-paint";
            btnRotate.className = "mode-select-btn inactive-mode";
            Paint.setPaintMode('paint');
        };
    }

    // 4. ハッシュ・ユーティリティ系
    const btnCopy = document.getElementById('btn-copy');
    if (btnCopy) {
        btnCopy.onclick = () => {
            const hashVal = document.getElementById('hash-display').value;
            navigator.clipboard.writeText(hashVal);
            // 視覚的なフィードバック
            const originalText = btnCopy.textContent;
            btnCopy.textContent = "DONE!";
            setTimeout(() => { btnCopy.textContent = originalText; }, 1000);
        };
    }

    const btnImport = document.getElementById('btn-import');
    if (btnImport) {
        btnImport.onclick = async () => {
            const text = await navigator.clipboard.readText();
            if (text) {
                document.getElementById('command-box').value = text;
                console.log("Imported from clipboard");
            }
        };
    }

    // 5. 基本操作ボタン
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    document.getElementById('btn-setup').onclick = Core.applySetup;
    document.getElementById('btn-reset').onclick = () => {
        if (confirm("Reset all settings and data?")) {
            location.reload();
        }
    };

    // 6. スライダー操作
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.oninput = Core.render;
    }

    // 7. マスク（Orbit）ボタン
    document.getElementById('btn-mask-gray').onclick = () => Paint.applyOrbit('gray');
    document.getElementById('btn-mask-cc').onclick = () => Paint.applyOrbit('cc');
    document.getElementById('btn-mask-full').onclick = () => Paint.applyOrbit('full');
});