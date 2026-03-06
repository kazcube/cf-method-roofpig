import * as Core from './cube-core.js?v=2.5.1';
import { initPaintTool, setPaintMode } from './paint-tool.js?v=2.5.1';
import { copyLink } from './analyzer.js?v=2.5.1';

export function initApp() {
    console.log("App Initializing...");
    const grid = document.getElementById('move-grid');
    const moves = ["U","D","L","R","F","B","u","d","l","r","f","b","E","M","S","x","y","z"];
    
    if (grid) {
        grid.innerHTML = "";
        moves.forEach(m => {
            const btn = document.createElement('button');
            btn.className = "py-3 bg-slate-800/60 text-slate-100 font-black text-[11px] rounded-xl border border-slate-700/50 hover:bg-slate-700 transition-all active:scale-90 shadow-sm";
            btn.textContent = m;
            btn.addEventListener('click', () => Core.addMove(m));
            grid.appendChild(btn);
        });
    }

    // UI Event Listeners
    document.getElementById('mode-rotate').onclick = () => setPaintMode('rotate');
    document.getElementById('mode-paint').onclick = () => setPaintMode('paint');
    document.getElementById('play-btn').onclick = () => Core.togglePlay();
    document.getElementById('scramble-btn').onclick = () => Core.handleScramble();
    document.getElementById('reset-btn').onclick = () => Core.resetAll();
    document.getElementById('apply-btn').onclick = () => Core.applySetup();
    document.getElementById('btn-copy-link').onclick = () => copyLink();
    
    const slider = document.getElementById('move-slider');
    slider.oninput = () => {
        Core.stopPlay();
        Core.render();
    };

    // Sub Modules
    initPaintTool();
    Core.loadFromHash();
    setTimeout(() => Core.render(true), 200);
}