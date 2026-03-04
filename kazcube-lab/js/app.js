import * as Core from './cube-core.js';
import * as Analyzer from './analyzer.js';
import * as Paint from './paint-tool.js';

const JS_VERSION = "v1.5.6 (Mask-Retry)"; 

document.addEventListener('DOMContentLoaded', () => {
    const versionDisplay = document.getElementById('version-display');
    if (versionDisplay) versionDisplay.textContent = JS_VERSION;

    const slider = document.getElementById('move-slider');

    // --- モード切替 ---
    const modeRotateBtn = document.getElementById('mode-rotate');
    const modePaintBtn = document.getElementById('mode-paint');

    modeRotateBtn.addEventListener('click', () => {
        modeRotateBtn.classList.add('active');
        modePaintBtn.classList.remove('active');
        Paint.setPaintMode('rotate');
    });

    modePaintBtn.addEventListener('click', () => {
        modePaintBtn.classList.add('active');
        modeRotateBtn.classList.remove('active');
        Paint.setPaintMode('paint');
    });

    // --- 操作 ---
    document.getElementById('btn-scramble').addEventListener('click', Core.handleScramble);
    document.getElementById('btn-setup').addEventListener('click', Core.applyReverseSetup);
    
    document.getElementById('btn-reset-alg').addEventListener('click', () => {
        document.getElementById('command-box').value = "";
        Core.setSetupMoves([]);
        Core.setActiveMoves([]);
        Core.updateView();
    });

    // --- ナビゲーション ---
    document.getElementById('nav-first').addEventListener('click', () => { slider.value = 0; Core.updateView(); });
    document.getElementById('nav-last').addEventListener('click', () => { slider.value = Core.activeMoves.length; Core.updateView(); });
    document.getElementById('nav-prev').addEventListener('click', () => { if(slider.value > 0) { slider.value--; Core.updateView(); }});
    document.getElementById('nav-next').addEventListener('click', () => { if(parseInt(slider.value) < Core.activeMoves.length) { slider.value++; Core.updateView(); }});
    slider.addEventListener('input', Core.updateView);

    // --- タブ ---
    document.getElementById('tab-basic').addEventListener('click', () => Core.renderMoves('basic'));
    document.getElementById('tab-wide').addEventListener('click', () => Core.renderMoves('wide'));
    document.getElementById('tab-slice').addEventListener('click', () => Core.renderMoves('slice'));

    // --- プリセット ---
    document.getElementById('preset-cc').addEventListener('click', () => Paint.applyPreset('corner-center'));
    document.getElementById('preset-co').addEventListener('click', () => Paint.applyPreset('corner-only'));
    document.getElementById('preset-gray').addEventListener('click', () => Paint.applyPreset('gray'));

    // --- その他 ---
    document.getElementById('btn-copy').addEventListener('click', Analyzer.copyLink);

    window.addEventListener('cubeUpdate', () => {
        Analyzer.syncHash();
    });

    // 初期化
    Core.renderMoves('basic');
    Core.updateView();
    document.getElementById('rotate-controls').classList.remove('hidden');
    document.getElementById('hash-io').value = "";
});