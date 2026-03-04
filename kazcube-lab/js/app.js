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
    // 画面のバージョン表記を更新
    const versionTag = document.querySelector('header span');
    if (versionTag) {
        versionTag.textContent = Core.JS_VERSION;
    }

    console.log(`KAZCUBE Lab: Initializing ${Core.JS_VERSION}...`);

    initPaintTool();

    // モード切替
    const btnRotate = document.getElementById('mode-rotate');
    const btnPaint = document.getElementById('mode-paint');

    if (btnRotate) btnRotate.onclick = () => setPaintMode('rotate');
    if (btnPaint) btnPaint.onclick = () => setPaintMode('paint');

    // タブ
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            updateMoveGrid();
        };
    });

    // 各種操作
    if (document.getElementById('btn-setup')) document.getElementById('btn-setup').onclick = Core.applySetup;
    if (document.getElementById('btn-scramble')) document.getElementById('btn-scramble').onclick = Core.handleScramble;
    
    const slider = document.getElementById('move-slider');
    if (slider) slider.oninput = Core.render;

    updateMoveGrid();
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}