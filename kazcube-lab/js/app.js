import * as Core from './cube-core.js';
import * as Analyzer from './analyzer.js';
import * as Paint from './paint-tool.js';

// JavaScriptのバージョン管理
const JS_VERSION = "v1.5.2 (JS)"; 

document.addEventListener('DOMContentLoaded', () => {
    // 起動時にバージョンを表示
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

    // --- 回転・セットアップ操作 ---
    document.getElementById('btn-scramble').addEventListener('click', Core.handleScramble);
    document.getElementById('btn-setup').addEventListener('click', Core.applyReverseSetup);

    // --- ナビゲーション ---
    document.getElementById('nav-first').addEventListener('click', () => { slider.value = 0; Core.updateView(); });
    document.getElementById('nav-last').addEventListener('click', () => { slider.value = Core.activeMoves.length; Core.updateView(); });
    document.getElementById('nav-prev').addEventListener('click', () => { if(slider.value > 0) { slider.value--; Core.updateView(); }});
    document.getElementById('nav-next').addEventListener('click', () => { if(parseInt(slider.value) < Core.activeMoves.length) { slider.value++; Core.updateView(); }});
    slider.addEventListener('input', Core.updateView);

    // --- タブ切り替え ---
    document.getElementById('tab-basic').addEventListener('click', () => Core.renderMoves('basic'));
    document.getElementById('tab-wide').addEventListener('click', () => Core.renderMoves('wide'));
    document.getElementById('tab-slice').addEventListener('click', () => Core.renderMoves('slice'));

    // --- プリセットボタン ---
    document.getElementById('preset-cc').addEventListener('click', () => Paint.applyPreset('corner-center'));
    document.getElementById('preset-co').addEventListener('click', () => Paint.applyPreset('corner-only'));
    document.getElementById('preset-gray').addEventListener('click', () => Paint.applyPreset('gray'));

    // --- 共有機能 ---
    document.getElementById('btn-copy').addEventListener('click', Analyzer.copyLink);

    // キューブ更新イベントの購読（ハッシュ同期）
    window.addEventListener('cubeUpdate', () => {
        Analyzer.syncHash();
    });

    // --- 初期ロード ---
    Core.renderMoves('basic');
    Core.updateView();
    // 初期はROTATEパネルを表示
    document.getElementById('rotate-controls').classList.remove('hidden');
});