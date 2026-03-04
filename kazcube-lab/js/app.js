// js/app.js
import * as Core from './cube-core.js';
import * as Paint from './paint-tool.js';

const JS_VERSION = "v1.6.5 (Orbit-Logic)";

document.addEventListener('DOMContentLoaded', () => {
    const versionDisplay = document.getElementById('version-display');
    if (versionDisplay) versionDisplay.textContent = JS_VERSION;

    // --- モード切替 ---
    const btnRotate = document.getElementById('mode-rotate');
    const btnPaint = document.getElementById('mode-paint');

    btnRotate.onclick = () => {
        btnRotate.classList.add('bg-emerald-600', 'text-white');
        btnRotate.classList.remove('text-slate-500');
        btnPaint.classList.remove('bg-orange-600', 'text-white');
        btnPaint.classList.add('text-slate-500');
        Paint.setPaintMode('rotate');
    };

    btnPaint.onclick = () => {
        btnPaint.classList.add('bg-orange-600', 'text-white');
        btnPaint.classList.remove('text-slate-500');
        btnRotate.classList.remove('bg-emerald-600', 'text-white');
        btnRotate.classList.add('text-slate-500');
        Paint.setPaintMode('paint');
    };

    // --- ボタン操作 ---
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    document.getElementById('btn-setup').onclick = Core.applyReverseSetup;
    document.getElementById('btn-reset-alg').onclick = () => {
        location.reload(); // 確実に初期化
    };

    // --- スライダー ---
    const slider = document.getElementById('move-slider');
    slider.oninput = Core.updateView;
    document.getElementById('nav-first').onclick = () => { slider.value = 0; Core.updateView(); };
    document.getElementById('nav-last').onclick = () => { slider.value = Core.activeMoves.length; Core.updateView(); };

    // --- プリセット ---
    document.getElementById('preset-gray').onclick = () => Paint.applyPreset('gray');
    document.getElementById('preset-cc').onclick = () => Paint.applyPreset('corner-center');
    document.getElementById('preset-co').onclick = () => Paint.applyPreset('corner-only');

    // 初期化
    Core.renderMoves('basic');
    Core.updateView();
});