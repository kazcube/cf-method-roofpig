import * as Core from './cube-core.js';
import { initPaintTool, setPaintMode } from './paint-tool.js';

const moveSets = {
    basic: ['U', 'D', 'L', 'R', 'F', 'B'],
    wide: ['Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw'],
    slice: ['M', 'E', 'S', 'x', 'y', 'z']
};
let currentTab = 'basic';

function init() {
    const versionTag = document.querySelector('header span');
    if (versionTag) versionTag.textContent = Core.JS_VERSION;

    initPaintTool();

    // モード切替
    document.getElementById('mode-rotate').onclick = () => setPaintMode('rotate');
    document.getElementById('mode-paint').onclick = () => setPaintMode('paint');

    // タブ
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            updateMoveGrid();
        };
    });

    document.getElementById('btn-setup').onclick = Core.applySetup;
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    
    const slider = document.getElementById('move-slider');
    if (slider) slider.oninput = Core.render;

    // 初期表示
    updateMoveGrid();
    setPaintMode('rotate'); // 確実に回転モードから開始
    Core.render();
}

function updateMoveGrid() {
    const grid = document.getElementById('move-grid');
    if (!grid) return;
    grid.innerHTML = "";
    moveSets[currentTab].forEach(f => {
        [f, f + "'", f + "2"].forEach(m => {
            const b = document.createElement('button');
            b.className = "bg-slate-800/50 py-2.5 rounded-lg font-mono text-[11px] font-bold hover:bg-slate-700 transition border border-slate-700/30 text-slate-200";
            b.textContent = m;
            b.onclick = () => {
                Core.activeMoves.push(m);
                const slider = document.getElementById('move-slider');
                if (slider) { slider.max = Core.activeMoves.length; slider.value = Core.activeMoves.length; }
                Core.render();
            };
            grid.appendChild(b);
        });
    });
}

window.onload = init;