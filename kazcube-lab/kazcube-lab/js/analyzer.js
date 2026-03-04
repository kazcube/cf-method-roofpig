import { setupMoves, activeMoves } from './cube-core.js';

export function syncHash() {
    const slider = document.getElementById('move-slider');
    const hashIo = document.getElementById('hash-io');
    if (!hashIo) return;

    // セットアップもアクティブ手順も無い場合は表示しない
    if (setupMoves.length === 0 && activeMoves.length === 0) {
        hashIo.value = "";
        return;
    }

    const state = {
        s: setupMoves,
        a: activeMoves,
        v: parseInt(slider.value) || 0
    };
    
    try {
        const hash = "v5:" + btoa(JSON.stringify(state));
        hashIo.value = hash;
    } catch (e) {
        console.error("Hash generation failed", e);
    }
}

export function copyLink() {
    const hashIo = document.getElementById('hash-io');
    if (!hashIo || !hashIo.value) return;

    const url = `${window.location.origin}${window.location.pathname}?hash=${encodeURIComponent(hashIo.value)}`;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.getElementById('btn-copy');
        if (btn) {
            const oldText = btn.textContent;
            btn.textContent = "COPIED!";
            setTimeout(() => btn.textContent = oldText, 1500);
        }
    });
}