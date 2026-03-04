import * as Core from './cube-core.js';
import * as Paint from './paint-tool.js';

document.addEventListener('DOMContentLoaded', () => {
    // 回転ボタンの生成（真っ先に実行）
    const grid = document.getElementById('move-grid');
    if (grid) {
        grid.innerHTML = ""; // 初期化
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
    }

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

    // その他ボタンイベント
    document.getElementById('btn-copy').onclick = () => {
        const hash = document.getElementById('hash-display').value;
        navigator.clipboard.writeText(hash);
        alert("Copied!");
    };
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    document.getElementById('btn-setup').onclick = Core.applySetup;
    document.getElementById('btn-reset').onclick = () => {
        if(confirm("Reset all?")) location.reload();
    };
    document.getElementById('move-slider').oninput = Core.render;

    // マスクボタン
    document.getElementById('btn-mask-gray').onclick = () => Paint.applyOrbit('gray');
    document.getElementById('btn-mask-cc').onclick = () => Paint.applyOrbit('cc');
    document.getElementById('btn-mask-full').onclick = () => Paint.applyOrbit('full');
});