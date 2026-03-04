// js/cube-core.js
import * as Paint from './paint-tool.js';

export let setupMoves = [];
export let activeMoves = [];

export function updateView() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    if (!player) return;

    const step = parseInt(slider.value) || 0;
    slider.max = activeMoves.length;

    // 手順更新
    player.alg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");
    
    // マスクを維持
    player.setAttribute('stickering', Paint.currentMask);

    document.getElementById('step-counter').textContent = step;
    const lastMove = (step > 0) ? activeMoves[step-1] : "---";
    document.getElementById('move-indicator').textContent = lastMove;
}

export function handleScramble() {
    setupMoves = [];
    const faces = ['U','D','L','R','F','B'], mods = ['', "'", '2'];
    activeMoves = Array.from({length:20}, () => faces[Math.floor(Math.random()*6)] + mods[Math.floor(Math.random()*3)]);
    document.getElementById('command-box').value = activeMoves.join(" ");
    document.getElementById('move-slider').value = activeMoves.length;
    updateView();
}

export function applyReverseSetup() {
    const val = document.getElementById('command-box').value.trim();
    if (!val) return;
    const moves = val.split(/\s+/);
    setupMoves = [...moves].reverse().map(m => m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0, -1) : m + "'"));
    activeMoves = moves;
    updateView();
}

export function renderMoves() {
    const grid = document.getElementById('move-grid');
    if (!grid) return;
    grid.innerHTML = '';
    ['U','D','L','R','F','B'].forEach(f => {
        [f, f+"'", f+"2"].forEach(m => {
            const b = document.createElement('button');
            b.className = "bg-slate-700 py-2 rounded font-mono text-xs hover:bg-slate-600";
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