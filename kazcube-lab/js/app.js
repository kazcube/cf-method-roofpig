import * as Core from './cube-core.js';
import * as Analyzer from './analyzer.js';
import * as Paint from './paint-tool.js';

const JS_VERSION = "v1.5.8 Final-Build"; 

async function init() {
    const player = document.getElementById('main-cube');
    const versionDisplay = document.getElementById('version-display');
    if (versionDisplay) versionDisplay.textContent = JS_VERSION;

    // --- TwistyPlayerの準備完了を待つ ---
    if (player) {
        try {
            // コンポーネントが定義され、レンダリングが始まるのを待機
            await customElements.whenDefined('twisty-player');
            console.log("[App] TwistyPlayer defined");
        } catch (e) {
            console.error("[App] Failed to initialize cube player", e);
        }
    }

    const slider = document.getElementById('move-slider');

    // --- イベントリスナー設定 ---
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

    // --- 初期状態の描画 ---
    Core.renderMoves('basic');
    Core.updateView();
    
    // 起動時にハッシュがあれば反映、なければクリア
    if (!window.location.search.includes('hash')) {
        document.getElementById('hash-io').value = "";
    }
}

// 実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}