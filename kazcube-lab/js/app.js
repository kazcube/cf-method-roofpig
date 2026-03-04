import * as Core from './cube-core.js';
import * as Analyzer from './analyzer.js';
import * as Paint from './paint-tool.js';

document.addEventListener('DOMContentLoaded', () => {
    // モード切替
    document.getElementById('mode-rotate').addEventListener('click', () => Paint.setPaintMode('rotate'));
    document.getElementById('mode-paint').addEventListener('click', () => Paint.setPaintMode('paint'));

    // 回転ボタン類
    document.getElementById('btn-scramble').addEventListener('click', Core.handleScramble);
    document.getElementById('btn-setup').addEventListener('click', Core.applyReverseSetup); // coreに後で実装

    // プリセットボタン
    document.getElementById('preset-cc').addEventListener('click', () => Paint.applyPreset('corner-center'));
    document.getElementById('preset-co').addEventListener('click', () => Paint.applyPreset('corner-only'));
    document.getElementById('preset-gray').addEventListener('click', () => Paint.applyPreset('gray'));

    // 共有ボタン
    document.getElementById('btn-copy').addEventListener('click', Analyzer.copyLink);

    // キューブ更新イベントの購読
    window.addEventListener('cubeUpdate', () => {
        Analyzer.syncHash();
    });

    // 初期化
    Core.updateView();
});