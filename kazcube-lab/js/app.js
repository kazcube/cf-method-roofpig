// js/app.js
import * as Core from './cube-core.js';
import * as Paint from './paint-tool.js';

const moveSets = {
    basic: ['U','D','L','R','F','B'],
    wide: ['u','d','l','r','f','b'],
    slice: ['M','E','S','x','y','z']
};

let currentTab = 'basic';

function updateMoveGrid() {
    const grid = document.getElementById('move-grid');
    if (!grid) return;
    grid.innerHTML = "";
    
    moveSets[currentTab].forEach(f => {
        [f, f+"'", f+"2"].forEach(m => {
            const b = document.createElement('button');
            // ここで角丸(rounded-md)を適用
            b.className = "bg-slate-800 py-2.5 rounded-md font-mono text-[11px] font-bold hover:bg-slate-700 transition active:scale-95 active:bg-indigo-900 border border-slate-700/50";
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

document.addEventListener('DOMContentLoaded', () => {
    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            updateMoveGrid();
        };
    });

    updateMoveGrid();

    // モード切替
    const btnRotate = document.getElementById('mode-rotate');
    const btnPaint = document.getElementById('mode-paint');
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

    // 共通イベント
    document.getElementById('btn-copy').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('hash-display').value);
        alert("Copied!");
    };
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    document.getElementById('btn-setup').onclick = Core.applySetup;
    document.getElementById('btn-reset').onclick = () => location.reload();
    document.getElementById('move-slider').oninput = Core.render;

    // マスク
    document.getElementById('btn-mask-gray').onclick = () => Paint.applyOrbit('gray');
    document.getElementById('btn-mask-cc').onclick = () => Paint.applyOrbit('cc');
    document.getElementById('btn-mask-full').onclick = () => Paint.applyOrbit('full');
});