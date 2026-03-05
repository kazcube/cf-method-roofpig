/**
 * KAZCUBE Lab Application Module
 * v2.0.44: Fixed initApp export and ensured safe move filtering.
 */

import * as Core from './cube-core.js?v=2.0.44';
import { initPaintTool, setPaintMode } from './paint-tool.js?v=2.0.44';

const moveSets = {
    basic: ["U", "D", "L", "R", "F", "B"],
    wide: ["u", "d", "l", "r", "f", "b"],
    slice: ["E", "M", "S", "x", "y", "z"]
};

/**
 * [LOCKED: NO-REMOVE]
 * index.htmlから呼び出される初期化関数
 */
export function initApp() {
    console.log("LOG: initApp starting...");
    
    // Coreの初期化
    Core.loadFromHash();
    
    // UIの構築
    updateMoveGrid();
    initEventListeners();
    initPaintTool();

    // 初期状態の描画
    Core.render();
}

function updateMoveGrid() {
    const grid = document.getElementById('move-grid');
    if (!grid) return;
    grid.innerHTML = "";

    const allMoves = [...moveSets.basic, ...moveSets.wide, ...moveSets.slice];
    
    allMoves.forEach(m => {
        const btn = document.createElement('button');
        btn.className = "h-10 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-black hover:bg-slate-700 hover:text-emerald-400 active:scale-90 transition shadow-sm";
        btn.textContent = m;
        btn.onclick = () => Core.addMove(m);
        grid.appendChild(btn);
    });
}

function initEventListeners() {
    // Play/Pause
    const playBtn = document.getElementById('play-btn');
    if (playBtn) playBtn.onclick = Core.togglePlay;

    // Apply
    const applyBtn = document.getElementById('apply-btn');
    if (applyBtn) applyBtn.onclick = Core.applySetup;

    // Scramble
    const scrambleBtn = document.getElementById('scramble-btn');
    if (scrambleBtn) scrambleBtn.onclick = Core.handleScramble;

    // Reset
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.onclick = Core.resetAll;

    // Slider
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.oninput = () => {
            if (Core.isPlaying) Core.stopPlay();
            Core.render();
        };
    }

    // Mode Switching
    const btnRotate = document.getElementById('mode-rotate');
    const btnPaint = document.getElementById('mode-paint');

    if (btnRotate) btnRotate.onclick = () => setPaintMode('rotate');
    if (btnPaint) btnPaint.onclick = () => setPaintMode('paint');

    // Command Box Enter Key
    const cb = document.getElementById('command-box');
    if (cb) {
        cb.onkeydown = (e) => {
            if (e.key === 'Enter') Core.applySetup();
        };
    }
}