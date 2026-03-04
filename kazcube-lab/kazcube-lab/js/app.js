import * as Core from './cube-core.js';
import * as Analyzer from './analyzer.js';
import * as Paint from './paint-tool.js';

const JS_VERSION = "v1.5.8 (Final)"; 

document.addEventListener('DOMContentLoaded', () => {
    const versionDisplay = document.getElementById('version-display');
    if (versionDisplay) versionDisplay.textContent = JS_VERSION;

    const slider = document.getElementById('move-slider');
    if (!slider) return;

    // モード切替
    document.getElementById('mode-rotate')?.addEventListener('click', (e) => {
        document.getElementById('mode-rotate').classList.add('active');
        document.getElementById('mode-paint').classList.remove('active');
        Paint.setPaintMode('rotate');
    });

    document.getElementById('mode-paint')?.addEventListener('click', (e) => {
        document.getElementById('mode-paint').classList.add('active');
        document.getElementById('mode-rotate').classList.remove('active');
        Paint.setPaintMode('paint');
    });

    // 各種ボタン
    document.getElementById('btn-scramble')?.addEventListener('click', Core.handleScramble);
    document.getElementById('btn-setup')?.addEventListener('click', Core.applyReverseSetup);
    document.getElementById('btn-reset-alg')?.addEventListener('click', () => {
        const cmdBox = document.getElementById('command-box');
        if (cmdBox) cmdBox.value = "";
        Core.setSetupMoves([]);
        Core.setActiveMoves([]);
        Core.updateView();
    });

    // ナビゲーション
    document.getElementById('nav-first')?.addEventListener('click', () => { slider.value = 0; Core.updateView(); });
    document.getElementById('nav-last')?.addEventListener('click', () => { slider.value = Core.activeMoves.length; Core.updateView(); });
    document.getElementById('nav-prev')?.addEventListener('click', () => { if(slider.value > 0) { slider.value--; Core.updateView(); }});
    document.getElementById('nav-next')?.addEventListener('click', () => { if(parseInt(slider.value) < Core.activeMoves.length) { slider.value++; Core.updateView(); }});
    slider.addEventListener('input', Core.updateView);

    // タブ
    document.getElementById('tab-basic')?.addEventListener('click', () => Core.renderMoves('basic'));
    document.getElementById('tab-wide')?.addEventListener('click', () => Core.renderMoves('wide'));
    document.getElementById('tab-slice')?.addEventListener('click', () => Core.renderMoves('slice'));

    // プリセット
    document.getElementById('preset-cc')?.addEventListener('click', () => Paint.applyPreset('corner-center'));
    document.getElementById('preset-co')?.addEventListener('click', () => Paint.applyPreset('corner-only'));
    document.getElementById('preset-gray')?.addEventListener('click', () => Paint.applyPreset('gray'));

    document.getElementById('btn-copy')?.addEventListener('click', Analyzer.copyLink);

    window.addEventListener('cubeUpdate', () => {
        Analyzer.syncHash();
    });

    // 初期起動処理
    Core.renderMoves('basic');
    Core.updateView();
    const hashIo = document.getElementById('hash-io');
    if (hashIo) hashIo.value = "";
});