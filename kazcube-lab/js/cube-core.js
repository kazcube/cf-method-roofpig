// js/cube-core.js
import * as Paint from './paint-tool.js';

export let setupMoves = [];
export let activeMoves = [];

export function setSetupMoves(m) { setupMoves = m; }
export function setActiveMoves(m) { activeMoves = m; }

export function updateView() {
    const player = document.getElementById('main-cube');
    const slider = document.getElementById('move-slider');
    if (!player || !slider) return;

    const step = parseInt(slider.value) || 0;
    slider.max = activeMoves.length;

    // 1. 手順を更新（ここでマスクがリセットされる場合がある）
    const fullAlg = [...setupMoves, ...activeMoves.slice(0, step)].join(" ");
    player.alg = fullAlg;
    
    // 2. マスクを再適用（Paintツールの現在の状態を強制反映）
    player.setAttribute('stickering', Paint.currentMask);

    const stepCounter = document.getElementById('step-counter');
    if (stepCounter) stepCounter.textContent = step;

    const indicator = document.getElementById('move-indicator');
    if (indicator) indicator.textContent = (step > 0 && activeMoves[step-1]) ? activeMoves[step-1] : "---";
    
    window.dispatchEvent(new CustomEvent('cubeUpdate', { detail: { step } }));
}

// ...以下、applyReverseSetup, handleScramble, renderMoves は前回と同じ...
export function applyReverseSetup() {
    const val = document.getElementById('command-box').value.trim();
    if (!val) return;
    const moves = val.split(/\s+/).filter(m => m.length > 0);
    setSetupMoves([...moves].reverse().map(m => m.endsWith("2") ? m : (m.endsWith("'") ? m.slice(0, -1) : m + "'")));
    setActiveMoves(moves);
    updateView();
}

export function handleScramble() {
    setSetupMoves([]);
    const faces = ['U','D','L','R','F','B'], mods = ['', "'", '2'];
    const newMoves = Array.from({length:20}, () => faces[Math.floor(Math.random()*6)] + mods[Math.floor(Math.random()*3)]);
    setActiveMoves(newMoves);
    document.getElementById('command-box').value = activeMoves.join(" ");
    document.getElementById('move-slider').value = activeMoves.length;
    updateView();
}

export function renderMoves(type) {
    const grid = document.getElementById('move-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const lib = { 
        basic:['U','D','L','R','F','B'], 
        wide:['u','d','l','r','f','b'], 
        slice:['M','E','S','x','y','z'] 
    };
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.id === `tab-${type}`));
    lib[type].forEach(f => {
        [f, f+"'", f+"2"].forEach(m => {
            const b = document.createElement('button');
            b.className = "move-btn";
            b.textContent = m;
            b.onclick = () => {
                const slider = document.getElementById('move-slider');
                activeMoves = activeMoves.slice(0, parseInt(slider.value));
                activeMoves.push(m);
                slider.value = activeMoves.length;
                document.getElementById('command-box').value = activeMoves.join(" ");
                updateView();
            };
            grid.appendChild(b);
        });
    });
}