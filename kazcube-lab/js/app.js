import * as Core from './cube-core.js?v=2.0.2';
import { initPaintTool, setPaintMode } from './paint-tool.js?v=2.0.2';

const moveSets = {
    basic: ["U", "D", "L", "R", "F", "B"],
    wide: ["u", "d", "l", "r", "f", "b"],
    slice: ["E", "M", "S", "x", "y", "z"]
};

function updateMoveGrid(tab = "basic") {
    const grid = document.getElementById('move-grid');
    if (!grid) return;
    grid.innerHTML = "";
    
    moveSets[tab].forEach(m => {
        ["", "'", "2"].forEach(mod => {
            const move = m + mod;
            const btn = document.createElement('button');
            btn.textContent = move;
            btn.className = "bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-bold text-xs text-white transition";
            btn.onclick = () => { 
                Core.activeMoves.push(move); 
                const slider = document.getElementById('move-slider');
                if (slider) slider.value = Core.activeMoves.length;
                Core.render(); 
            };
            grid.appendChild(btn);
        });
    });

    // タブの見た目を更新
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        btn.className = isActive 
            ? "tab-btn px-4 py-2 text-[10px] font-black uppercase text-blue-500 border-b-2 border-blue-500"
            : "tab-btn px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition";
    });
}

window.onload = () => {
    console.log(`KAZCUBE Lab: Initializing ${Core.JS_VERSION}...`);
    Core.loadFromHash();
    initPaintTool();

    // モード切り替え
    document.getElementById('mode-rotate').onclick = () => setPaintMode('rotate');
    document.getElementById('mode-paint').onclick = () => setPaintMode('paint');
    
    // タブ切り替えイベントの登録
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => updateMoveGrid(btn.dataset.tab);
    });

    // その他ボタン
    document.getElementById('scramble-btn').onclick = Core.handleScramble;
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm("Reset everything?")) { Core.resetAll(); location.hash=""; location.reload(); }
        };
    }

    // 初期表示の生成
    updateMoveGrid('basic');
    setPaintMode(Core.stickerStates.includes(0) ? 'paint' : 'rotate');
    Core.render();
};