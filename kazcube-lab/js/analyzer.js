/**
 * KAZCUBE Lab Analyzer Module
 * v2.5.1: Handles State Hashing and Sharing Logic
 */

import { activeMoves } from './cube-core.js?v=2.5.1';

/**
 * 現在のキューブの状態（手順やスライダーの位置）をハッシュ化して表示します
 */
export function syncHash() {
    const slider = document.getElementById('move-slider');
    const hashDisplay = document.getElementById('hash-display');
    if (!hashDisplay) return;

    // 手順が無い場合は表示をクリア
    if (activeMoves.length === 0) {
        hashDisplay.value = "---";
        return;
    }

    const state = {
        a: activeMoves, // Active Moves
        v: parseInt(slider.value) || 0 // Current Step View
    };
    
    try {
        // v5形式でBase64エンコード
        const hash = "v5:" + btoa(JSON.stringify(state));
        hashDisplay.value = hash;
        
        // URLのハッシュ部分のみを更新（リロードしても状態を維持しやすくするため）
        window.history.replaceState(null, "", "#" + hash);
    } catch (e) {
        console.error("Hash generation failed", e);
    }
}

/**
 * 現在の状態を含む共有URLをクリップボードにコピーします
 */
export function copyLink() {
    const hashDisplay = document.getElementById('hash-display');
    if (!hashDisplay || hashDisplay.value === "---") return;

    // 現在のドメイン + パス + ハッシュ値でURLを構築
    const url = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
    
    // クリップボードへコピー (iFrame内での制限を考慮した方法)
    const tempInput = document.createElement("input");
    tempInput.value = url;
    document.body.appendChild(tempInput);
    tempInput.select();
    
    try {
        document.execCommand('copy');
        // UI側のフィードバック（もしボタンがあれば）
        const btn = document.getElementById('apply-btn'); // 代替のフィードバック先
        if (btn) {
            const oldText = btn.textContent;
            btn.textContent = "LINK COPIED!";
            setTimeout(() => btn.textContent = oldText, 1500);
        }
    } catch (err) {
        console.error('Unable to copy', err);
    } finally {
        document.body.removeChild(tempInput);
    }
}

/**
 * キューブの解析（将来的な拡張用）
 */
export function analyzeCube(stickerState) {
    console.log("Analyzer: System Ready.");
    syncHash(); // 解析時にハッシュも同期
    return null;
}