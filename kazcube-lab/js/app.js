import * as Core from './cube-core.js?v=1.9.8';
import { initPaintTool, setPaintMode } from './paint-tool.js?v=1.9.8';

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
            btn.className = "bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-bold text-xs text-white transition active:scale-95";
            btn.onclick = () => {
                const player = document.getElementById('main-cube');
                if (player) {
                    player.addAlg(move); // twisty-playerへの直接反映
                    Core.activeMoves.push(move); // Core側の配列を更新
                    Core.render(); // UIとURLハッシュを同期
                }
            };
            grid.appendChild(btn);
        });
    });

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

    // 各ボタンの紐付け
    const rotateBtn = document.getElementById('mode-rotate');
    const paintBtn = document.getElementById('mode-paint');
    const scrambleBtn = document.getElementById('scramble-btn');
    const setupBtn = document.getElementById('setup-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (rotateBtn) rotateBtn.onclick = () => setPaintMode('rotate');
    if (paintBtn) paintBtn.onclick = () => setPaintMode('paint');
    if (scrambleBtn) scrambleBtn.onclick = Core.handleScramble;
    if (setupBtn) setupBtn.onclick = Core.applySetup;

    // --- RESET BUTTON ロジック ---
    if (resetBtn) {
        resetBtn.onclick = () => {
            if (confirm("すべてのデータ（手順・塗り絵）をリセットしますか？")) {
                Core.resetAll();
                location.hash = ""; // URLハッシュを消去
                location.reload(); // ページをリロードして初期状態へ
            }
        };
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => updateMoveGrid(btn.dataset.tab);
    });

    const slider = document.getElementById('move-slider');
    if (slider) {
        slider.oninput = () => Core.render();
    }

    const copyBtn = document.querySelector('button.bg-indigo-600');
    if (copyBtn) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(window.location.href);
            const old = copyBtn.textContent;
            copyBtn.textContent = "COPIED!";
            setTimeout(() => copyBtn.textContent = old, 2000);
        };
    }

    updateMoveGrid();
    setPaintMode(Core.stickerStates.includes(0) ? 'paint' : 'rotate');
    Core.render();
}

window.onload = init;