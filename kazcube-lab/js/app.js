// js/app.js
import * as Core from './cube-core.js';
import * as Analyzer from './analyzer.js';
import * as Paint from './paint-tool.js';

const JS_VERSION = "v1.6.2 (Strong-Dim)"; 

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('version-display').textContent = JS_VERSION;

    const slider = document.getElementById('move-slider');

    // --- モード切替 ---
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

    // --- 操作 ---
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    document.getElementById('btn-setup').onclick = Core.applyReverseSetup;
    document.getElementById('btn-reset-alg').onclick = () => {
        document.getElementById('command-box').value = "";
        Core.setSetupMoves([]);
        Core.setActiveMoves([]);
        Core.updateView();
    };

    // ナビゲーション
    document.getElementById('nav-first').onclick = () => { slider.value = 0; Core.updateView(); };
    document.getElementById('nav-last').onclick = () => { slider.value = Core.activeMoves.length; Core.updateView(); };
    slider.oninput = Core.updateView;

    // タブ
    document.getElementById('tab-basic').onclick = () => Core.renderMoves('basic');
    document.getElementById('tab-wide').onclick = () => Core.renderMoves('wide');
    document.getElementById('tab-slice').onclick = () => Core.renderMoves('slice');

    // マスクプリセット
    document.getElementById('preset-cc').onclick = () => Paint.applyPreset('corner-center');
    document.getElementById('preset-co').onclick = () => Paint.applyPreset('corner-only');
    document.getElementById('preset-gray').onclick = () => Paint.applyPreset('gray');

    document.getElementById('btn-copy').onclick = Analyzer.copyLink;

    window.addEventListener('cubeUpdate', Analyzer.syncHash);

    // 初期化
    Core.renderMoves('basic');
    Core.updateView();
    document.getElementById('hash-io').value = "";
});