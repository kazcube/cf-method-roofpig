// js/app.js
import * as Core from './cube-core.js';
import * as Paint from './paint-tool.js';

document.addEventListener('DOMContentLoaded', async () => {
    const player = document.getElementById('main-cube');
    document.getElementById('version-display').textContent = "v1.6.3 Stable";

    // ライブラリの準備完了を待つ
    if (player) {
        await customElements.whenDefined('twisty-player');
    }

    // モード切替
    document.getElementById('mode-rotate').onclick = (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        Paint.setPaintMode('rotate');
    };

    document.getElementById('mode-paint').onclick = (e) => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        Paint.setPaintMode('paint');
    };

    // 操作
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    document.getElementById('btn-setup').onclick = Core.applyReverseSetup;
    document.getElementById('btn-reset-alg').onclick = () => {
        location.reload(); // 確実にリセットするためにリロード
    };

    // プリセット
    document.getElementById('preset-cc').onclick = () => Paint.applyPreset('corner-center');
    document.getElementById('preset-co').onclick = () => Paint.applyPreset('corner-only');
    document.getElementById('preset-gray').onclick = () => Paint.applyPreset('gray');

    // 初期化
    Core.renderMoves();
    Core.updateView();
});