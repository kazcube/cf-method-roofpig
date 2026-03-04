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
    // ボタン生成
    updateMoveGrid();
    
    // ペイントツールの初期化
    initPaintTool();

    // モード切替ボタンのイベント
    document.getElementById('mode-rotate').onclick = () => setPaintMode('rotate');
    document.getElementById('mode-paint').onclick = () => setPaintMode('paint');

    // タブ切り替えイベント
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            updateMoveGrid();
        };
    });

    // その他ボタン
    document.getElementById('btn-setup').onclick = Core.applySetup;
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    
    // スライダー
    const slider = document.getElementById('move-slider');
    slider.oninput = Core.render;

    Core.render();
}

function updateMoveGrid() {
    const grid = document.getElementById('move-grid');
    const panel = document.querySelector('.tab-content-panel');
    if (!grid || !panel) return;
    
    grid.innerHTML = "";
    
    if (currentTab === 'basic') {
        panel.style.borderRadius = "0 15px 15px 15px";
    } else {
        panel.style.borderRadius = "15px";
    }

    const faces = moveSets[currentTab];
    faces.forEach(f => {
        [f, f + "'", f + "2"].forEach(m => {
            const b = document.createElement('button');
            b.className = "bg-slate-800/50 py-2.5 rounded-lg font-mono text-[11px] font-bold hover:bg-slate-700 transition border border-slate-700/30";
            b.textContent = m;
            b.onclick = () => {
                Core.activeMoves.push(m);
                const slider = document.getElementById('move-slider');
                slider.max = Core.activeMoves.length;
                slider.value = Core.activeMoves.length;
                Core.render();
            };
            grid.appendChild(b);
        });
    });
}

window.onload = init;