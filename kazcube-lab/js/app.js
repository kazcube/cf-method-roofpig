/**
 * KAZCUBE Lab Application Module
 * v2.0.49: Restored 3-row grid layout and move definitions.
 */

import * as Core from './cube-core.js?v=2.0.49';
import { initPaintTool, setPaintMode } from './paint-tool.js?v=2.0.49';

const moveSets = {
    basic: ["U", "D", "L", "R", "F", "B"],
    wide: ["u", "d", "l", "r", "f", "b"],
    slice: ["E", "M", "S", "x", "y", "z"]
};

export function initApp() {
    console.log("LOG: initApp starting... v2.0.49");
    
    // 回転ボタンの生成 (6x3のグリッド)
    const grid = document.getElementById('move-grid');
    if (grid) {
        grid.innerHTML = "";
        const allMoves = [...moveSets.basic, ...moveSets.wide, ...moveSets.slice];
        allMoves.forEach(move => {
            const btn = document.createElement('button');
            btn.className = "py-3 bg-slate-800/60 text-slate-100 font-black text-[11px] rounded-xl border border-slate-700/50 hover:bg-slate-700 hover:border-emerald-500/50 transition-all active:scale-90 shadow-sm";
            btn.textContent = move;
            btn.onclick = () => Core.addMove(move);
            grid.appendChild(btn);
        });
    }

    // UI イベントリスナー
    document.getElementById('mode-rotate').onclick = () => setPaintMode('rotate');
    document.getElementById('mode-paint').onclick = () => setPaintMode('paint');
    document.getElementById('play-btn').onclick = () => Core.togglePlay();
    document.getElementById('scramble-btn').onclick = () => Core.handleScramble();
    document.getElementById('reset-btn').onclick = () => Core.resetAll();
    document.getElementById('apply-btn').onclick = () => Core.applySetup();
    
    const slider = document.getElementById('move-slider');
    slider.oninput = () => {
        Core.stopPlay();
        Core.render();
    };

    // 初期化実行
    initPaintTool();
    Core.loadFromHash();
    
    // 初期描画の遅延実行（TwistyPlayerのロード待ち）
    setTimeout(() => Core.render(true), 200);
}