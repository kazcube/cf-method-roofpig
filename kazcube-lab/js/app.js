import * as Core from './cube-core.js';
import * as Paint from './paint-tool.js';

document.addEventListener('DOMContentLoaded', () => {
    // モード切替
    const btnRotate = document.getElementById('mode-rotate');
    const btnPaint = document.getElementById('mode-paint');
    if (btnRotate && btnPaint) {
        btnRotate.onclick = () => {
            btnRotate.className = "mode-btn active-rotate";
            btnPaint.className = "mode-btn inactive";
            Paint.setPaintMode('rotate');
        };
        btnPaint.onclick = () => {
            btnPaint.className = "mode-btn active-paint";
            btnRotate.className = "mode-btn inactive";
            Paint.setPaintMode('paint');
        };
    }

    // 各ボタンのイベント
    document.getElementById('btn-copy').onclick = () => {
        navigator.clipboard.writeText(document.getElementById('hash-display').value);
    };
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    document.getElementById('btn-setup').onclick = Core.applySetup;
    document.getElementById('btn-reset').onclick = () => location.reload();
    document.getElementById('move-slider').oninput = Core.render;

    // 回転ボタン生成
    const grid = document.getElementById('move-grid');
    ['U','D','L','R','F','B'].forEach(f => {
        [f, f+"'", f+"2"].forEach(m => {
            const b = document.createElement('button');
            b.className = "bg-slate-800 py-2 rounded font-mono text-[11px] font-bold hover:bg-slate-700 transition active:bg-indigo-900";
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
});