import { setupMoves, activeMoves } from './cube-core.js';

export function syncHash() {
    const slider = document.getElementById('move-slider');
    const state = {
        s: setupMoves,
        a: activeMoves,
        v: parseInt(slider.value) || 0
    };
    const hash = "v5:" + btoa(JSON.stringify(state));
    document.getElementById('hash-io').value = hash;
}

export function copyLink() {
    const hash = document.getElementById('hash-io').value;
    const url = `${window.location.origin}${window.location.pathname}?hash=${encodeURIComponent(hash)}`;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('btn-copy');
        const oldText = btn.textContent;
        btn.textContent = "COPIED!";
        setTimeout(() => btn.textContent = oldText, 1500);
    });
}