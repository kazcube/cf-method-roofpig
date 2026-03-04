// js/app.js
import * as Core from './cube-core.js';
import * as Paint from './paint-tool.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. モードボタン
    document.getElementById('mode-rotate').onclick = () => {
        document.getElementById('mode-rotate').classList.add('active');
        document.getElementById('mode-paint').classList.remove('active');
        Paint.setPaintMode('rotate');
    };
    document.getElementById('mode-paint').onclick = () => {
        document.getElementById('mode-paint').classList.add('active');
        document.getElementById('mode-rotate').classList.remove('active');
        Paint.setPaintMode('paint');
    };

    // 2. コア機能
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    document.getElementById('btn-setup').onclick = Core.applyReverseSetup;
    document.getElementById('btn-reset-alg').onclick = () => { location.reload(); };

    // 3. スライダー
    document.getElementById('move-slider').oninput = Core.updateView;

    // 4. プリセット
    document.getElementById('preset-gray').onclick = () => Paint.applyPreset('gray');
    document.getElementById('preset-cc').onclick = () => Paint.applyPreset('corner-center');
    document.getElementById('preset-co').onclick = () => Paint.applyPreset('corner-only');

    // 初期化
    Core.renderMoves();
    Core.updateView();
});