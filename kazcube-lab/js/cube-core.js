// js/cube-core.js
import * as Paint from './paint-tool.js';

export let setupMoves = [];
export let activeMoves = [];

export function setSetupMoves(m) { setupMoves = m; }
export function setActiveMoves(m) { activeMoves = m; }

export function updateView() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    if (!player) {
        console.warn("[DEBUG-Core] updateView: main-cube not found");
        return;
    }

    const step = parseInt(slider.value) || 0;
    const fullAlg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");
    
    console.log(`[DEBUG-Core] Updating alg to: "${fullAlg}" (Step: ${step})`);
    player.alg = fullAlg;
    
    // マスクの上書き防止
    console.log(`[DEBUG-Core] Re-applying mask: ${Paint.currentMask}`);
    player.setAttribute('stickering', Paint.currentMask);
}

export function handleScramble() {
    console.log("[DEBUG-Core] Scramble triggered");
    setSetupMoves([]);
    const faces = ['U','D','L','R','F','B'], mods = ['', "'", '2'];
    const newMoves = Array.from({length:20}, () => faces[Math.floor(Math.random()*6)] + mods[Math.floor(Math.random()*3)]);
    setActiveMoves(newMoves);
    document.getElementById('command-box').value = activeMoves.join(" ");
    document.getElementById('move-slider').value = activeMoves.length;
    updateView();
}

export function applyReverseSetup() {
    console.log("[DEBUG-Core] Set Setup triggered");
    const val = document.getElementById('command-box').value.trim();
    if (!val) return;
    const moves = val.split(/\s+/).filter(m => m.length > 0);
    setSetupMoves([...moves].reverse().map(m => m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0, -1) : m + "'")));
    setActiveMoves(moves);
    updateView();
}

export function renderMoves(type) {
    console.log(`[DEBUG-Core] Rendering move buttons for: ${type}`);
    const grid = document.getElementById('move-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const lib = { 
        basic:['U','D','L','R','F','B'], 
        wide:['u','d','l','r','f','b'], 
        slice:['M','E','S','x','y','z'] 
    };
    lib[type].forEach(f => {
        [f, f+"'", f+"2"].forEach(m => {
            const b = document.createElement('button');
            b.className = "move-btn";
            b.textContent = m;
            b.onclick = () => {
                activeMoves.push(m);
                document.getElementById('move-slider').value = activeMoves.length;
                updateView();
            };
            grid.appendChild(b);
        });
    });
}