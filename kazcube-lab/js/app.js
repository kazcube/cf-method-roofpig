import * as Core from './cube-core.js';
import { initPaintTool, setPaintMode } from './paint-tool.js';

// タブ設定
const moveSets = {
    basic: ['U', 'D', 'L', 'R', 'F', 'B'],
    wide: ['Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw'],
    slice: ['M', 'E', 'S', 'x', 'y', 'z']
};
let currentTab = 'basic';

function init() {
    console.log("KAZCUBE Lab: Initializing...");

    // 1. ペイントツールの初期化（イベントリスナーの登録）
    initPaintTool();

    // 2. モード切替ボタンのイベント接続
    const btnRotate = document.getElementById('mode-rotate');
    const btnPaint = document.getElementById('mode-paint');

    if (btnRotate) {
        btnRotate.onclick = () => {
            console.log("Mode: Rotate");
            setPaintMode('rotate');
        };
    }
    if (btnPaint) {
        btnPaint.onclick = () => {
            console.log("Mode: Paint");
            setPaintMode('paint');
        };
    }

    // 3. タブ切り替えイベントの接続
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            updateMoveGrid();
        };
    });

    // 4. その他コントロールボタン
    const btnSetup = document.getElementById('btn-setup');
    const btnScramble = document.getElementById('btn-scramble');
    const btnReset = document.getElementById('btn-reset');

    if (btnSetup) btnSetup.onclick = Core.applySetup;
    if (btnScramble) btnScramble.onclick = Core.handleScramble;
    if (btnReset) {
        btnReset.onclick = () => {
            if(confirm("すべてのデータをリセットしますか？")) {
                location.reload();
            }
        };
    }
    
    // 5. スライダー
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.oninput = Core.render;
    }

    // 6. 初回レンダリング & ボタン生成
    updateMoveGrid();
    Core.render();
}

function updateMoveGrid() {
    const grid = document.getElementById('move-grid');
    const panel = document.querySelector('.tab-content-panel');
    if (!grid || !panel) return;
    
    grid.innerHTML = "";
    
    // タブのデザイン調整
    if (currentTab === 'basic') {
        panel.style.borderRadius = "0 15px 15px 15px";
    } else {
        panel.style.borderRadius = "15px";
    }

    const faces = moveSets[currentTab];
    faces.forEach(f => {
        [f, f + "'", f + "2"].forEach(m => {
            const b = document.createElement('button');
            // Tailwindのクラスを確実に適用
            b.className = "bg-slate-800/50 py-2.5 rounded-lg font-mono text-[11px] font-bold hover:bg-slate-700 transition border border-slate-700/30 text-slate-200";
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

// DOMの読み込み完了を待って実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}