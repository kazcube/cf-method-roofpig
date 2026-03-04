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
            // rounded-lg をクラスの最初の方に配置し、borderをはっきりさせました
            b.className = "rounded-lg bg-slate-800 py-2.5 font-mono text-[11px] font-bold hover:bg-slate-700 transition active:scale-95 active:bg-indigo-900 border border-slate-700/50";
            b.textContent = m;
            b.onclick = () => {
                Core.activeMoves.push(m);
                const slider = document.getElementById('move-slider');
                if(slider) {
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
    if(btnRotate && btnPaint) {
        btnRotate.onclick = () => {
            btnRotate.classList.add('active-rotate');
            btnRotate.classList.remove('inactive-mode');
            btnPaint.classList.add('inactive-mode');
            btnPaint.classList.remove('active-paint');
            Paint.setPaintMode('rotate');
        };
        btnPaint.onclick = () => {
            btnPaint.classList.add('active-paint');
            btnPaint.classList.remove('inactive-mode');
            btnRotate.classList.add('inactive-mode');
            btnRotate.classList.remove('active-rotate');
            Paint.setPaintMode('paint');
        };
    }

    // 共通イベント
    document.getElementById('btn-copy').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('hash-display').value);
    };
    document.getElementById('btn-import').onclick = async () => {
        const text = await navigator.clipboard.readText();
        document.getElementById('command-box').value = text;
    };
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    document.getElementById('btn-setup').onclick = Core.applySetup;
    document.getElementById('btn-reset').onclick = () => location.reload();
    document.getElementById('move-slider').oninput = Core.render;
});