import * as Core from './cube-core.js';
import { initPaintTool, setPaintMode } from './paint-tool.js';

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
            btn.className = "bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-bold text-xs transition active:scale-95";
            btn.onclick = () => {
                const player = document.getElementById('main-cube');
                if (player) player.addAlg(move);
                // 手順をactiveMovesに追加
                Core.activeMoves.push(move);
                Core.render();
            };
            grid.appendChild(btn);
        });
    });

    // タブの見た目更新
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const isActive = btn.dataset.tab === tab;
        btn.className = isActive 
            ? "tab-btn px-4 py-2 text-[10px] font-black uppercase text-blue-500 border-b-2 border-blue-500"
            : "tab-btn px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:text-white transition";
    });
}

function init() {
    console.log(`KAZCUBE Lab: Initializing ${Core.JS_VERSION}...`);

    Core.loadFromHash();
    initPaintTool();

    // イベント登録
    const rotateBtn = document.getElementById('mode-rotate');
    const paintBtn = document.getElementById('mode-paint');
    if (rotateBtn) rotateBtn.onclick = () => setPaintMode('rotate');
    if (paintBtn) paintBtn.onclick = () => setPaintMode('paint');

    document.getElementById('scramble-btn').onclick = Core.handleScramble;
    document.getElementById('setup-btn').onclick = Core.applySetup;
    
    // タブ切り替え
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => updateMoveGrid(btn.dataset.tab);
    });

    // スライダー連動
    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.oninput = () => Core.render();
    }

    // COPY LINK
    const copyBtn = document.querySelector('button.bg-indigo-600');
    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(window.location.href);
            const old = copyBtn.textContent;
            copyBtn.textContent = "COPIED!";
            setTimeout(() => copyBtn.textContent = old, 2000);
        };
    }

    // 初期化実行
    updateMoveGrid();
    const hasMask = Core.stickerStates.includes(0);
    setPaintMode(hasMask ? 'paint' : 'rotate');
    Core.render();
}

window.onload = init;