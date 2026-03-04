import * as Core from './cube-core.js';
import * as Analyzer from './analyzer.js';
import * as Paint from './paint-tool.js';

const JS_VERSION = "v1.5.9 (Paint-Fix)"; 

async function init() {
    const player = document.getElementById('main-cube');
    const versionDisplay = document.getElementById('version-display');
    if (versionDisplay) versionDisplay.textContent = JS_VERSION;

    if (player) {
        // コンポーネントの定義を待つ
        await customElements.whenDefined('twisty-player');
        // 念のため少し待機して内部エンジンの起動を待つ
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const slider = document.getElementById('move-slider');

    // --- モード切替 ---
    document.getElementById('mode-rotate').addEventListener('click', () => {
        document.getElementById('mode-rotate').classList.add('active');
        document.getElementById('mode-paint').classList.remove('active');
        Paint.setPaintMode('rotate');
    });

    document.getElementById('mode-paint').addEventListener('click', () => {
        document.getElementById('mode-paint').classList.add('active');
        document.getElementById('mode-rotate').classList.remove('active');
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

    // ナビゲーション
    document.getElementById('nav-first').addEventListener('click', () => { slider.value = 0; Core.updateView(); });
    document.getElementById('nav-last').addEventListener('click', () => { slider.value = Core.activeMoves.length; Core.updateView(); });
    slider.addEventListener('input', Core.updateView);

    // タブ
    document.getElementById('tab-basic').addEventListener('click', () => Core.renderMoves('basic'));
    document.getElementById('tab-wide').addEventListener('click', () => Core.renderMoves('wide'));
    document.getElementById('tab-slice').addEventListener('click', () => Core.renderMoves('slice'));

    // プリセット
    document.getElementById('preset-cc').addEventListener('click', () => Paint.applyPreset('corner-center'));
    document.getElementById('preset-co').addEventListener('click', () => Paint.applyPreset('corner-only'));
    document.getElementById('preset-gray').addEventListener('click', () => Paint.applyPreset('gray'));

    document.getElementById('btn-copy').addEventListener('click', Analyzer.copyLink);

    window.addEventListener('cubeUpdate', () => {
        Analyzer.syncHash();
    });

    // 初期化
    Core.renderMoves('basic');
    Core.updateView();
    
    if (!window.location.search.includes('hash')) {
        document.getElementById('hash-io').value = "";
    }
}

document.addEventListener('DOMContentLoaded', init);