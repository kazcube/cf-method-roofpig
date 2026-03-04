// js/app.js
import * as Core from './cube-core.js';
import * as Analyzer from './analyzer.js';
import * as Paint from './paint-tool.js';

const JS_VERSION = "v1.6.1-Debug"; 

document.addEventListener('DOMContentLoaded', () => {
    console.log(`[DEBUG-App] Starting v${JS_VERSION}`);
    document.getElementById('version-display').textContent = JS_VERSION;

    const btnPaint = document.getElementById('mode-paint');
    if (btnPaint) {
        btnPaint.onclick = () => {
            console.log("[DEBUG-App] PAINT mode button clicked");
            Paint.setPaintMode('paint');
        };
    } else {
        console.error("[DEBUG-App] mode-paint button NOT found");
    }

    const btnRotate = document.getElementById('mode-rotate');
    if (btnRotate) {
        btnRotate.onclick = () => {
            console.log("[DEBUG-App] ROTATE mode button clicked");
            Paint.setPaintMode('rotate');
        };
    }

    // 初期化実行
    console.log("[DEBUG-App] Running initial updateView");
    Core.renderMoves('basic');
    Core.updateView();
});