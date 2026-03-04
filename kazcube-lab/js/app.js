import * as Core from './cube-core.js';
import * as Analyzer from './analyzer.js';
import * as Paint from './paint-tool.js';

const JS_VERSION = "v1.5.6 (Stable)"; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. バージョン表示
    const versionDisplay = document.getElementById('version-display');
    if (versionDisplay) versionDisplay.textContent = JS_VERSION;

    const slider = document.getElementById('move-slider');
    if (!slider) {
        console.error("Critical Error: move-slider not found.");
        return; 
    }

    // 2. モード切替のヘルパー関数
    const setTabActive = (activeBtnId, inactiveBtnId) => {
        const activeBtn = document.getElementById(activeBtnId);
        const inactiveBtn = document.getElementById(inactiveBtnId);
        if (activeBtn) activeBtn.classList.add('active');
        if (inactiveBtn) inactiveBtn.classList.remove('active');
    };

    // 3. イベントリスナー（存在チェック付き）
    const bindClick = (id, fn) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    };

    bindClick('mode-rotate', () => {
        setTabActive('mode-rotate', 'mode-paint');
        Paint.setPaintMode('rotate');
    });

    bindClick('mode-paint', () => {
        setTabActive('mode-paint', 'mode-rotate');
        Paint.setPaintMode('paint');
    });

    bindClick('btn-scramble', Core.handleScramble);
    bindClick('btn-setup', Core.applyReverseSetup);
    
    bindClick('btn-reset-alg', () => {
        const cmdBox = document.getElementById('command-box');
        if (cmdBox) cmdBox.value = "";
        Core.setSetupMoves([]);
        Core.setActiveMoves([]);
        Core.updateView();
    });

    bindClick('nav-first', () => { slider.value = 0; Core.updateView(); });
    bindClick('nav-last', () => { slider.value = Core.activeMoves.length; Core.updateView(); });
    bindClick('nav-prev', () => { if(slider.value > 0) { slider.value--; Core.updateView(); }});
    bindClick('nav-next', () => { if(parseInt(slider.value) < Core.activeMoves.length) { slider.value++; Core.updateView(); }});
    
    slider.addEventListener('input', Core.updateView);

    bindClick('tab-basic', () => Core.renderMoves('basic'));
    bindClick('tab-wide', () => Core.renderMoves('wide'));
    bindClick('tab-slice', () => Core.renderMoves('slice'));

    bindClick('preset-cc', () => Paint.applyPreset('corner-center'));
    bindClick('preset-co', () => Paint.applyPreset('corner-only'));
    bindClick('preset-gray', () => Paint.applyPreset('gray'));

    bindClick('btn-copy', Analyzer.copyLink);

    window.addEventListener('cubeUpdate', () => {
        Analyzer.syncHash();
    });

    // 4. 初期化実行
    try {
        Core.renderMoves('basic');
        Core.updateView();
        const hashIo = document.getElementById('hash-io');
        if (hashIo) hashIo.value = "";
    } catch (e) {
        console.error("Initialization failed:", e);
    }
});