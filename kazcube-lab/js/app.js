import * as Core from './cube-core.js';
import { initPaintTool, setPaintMode } from './paint-tool.js';

function init() {
    const versionTag = document.querySelector('header span');
    if (versionTag) versionTag.textContent = Core.JS_VERSION;

    initPaintTool();

    document.getElementById('mode-rotate').onclick = () => setPaintMode('rotate');
    document.getElementById('mode-paint').onclick = () => setPaintMode('paint');
    document.getElementById('btn-setup').onclick = Core.applySetup;
    document.getElementById('btn-scramble').onclick = Core.handleScramble;
    
    const slider = document.getElementById('move-slider');
    if (slider) slider.oninput = Core.render;

    // タブ切り替えなどは以前のコードを維持
    Core.render();
}
window.onload = init;