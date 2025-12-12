
// CSS 3D Rubik's Cube viewer (v1.1.0N)
// Drag to rotate view (applies to both main and corner cubes)

(function () {
  const cubeMain = document.getElementById("cube-main");
  const cubeCorner = document.getElementById("cube-corner");
  const sceneMain = document.getElementById("scene-main");
  const sceneCorner = document.getElementById("scene-corner");

  let rotX = -30;
  let rotY = 35;

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  function applyTransform() {
    const transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    cubeMain.style.transform = transform;
    cubeCorner.style.transform = transform;
  }

  function onDown(e) {
    dragging = true;
    sceneMain.classList.add("dragging");
    sceneCorner.classList.add("dragging");

    if (e.touches && e.touches.length > 0) {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    } else {
      lastX = e.clientX;
      lastY = e.clientY;
    }

    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;

    let x, y;
    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }

    const dx = x - lastX;
    const dy = y - lastY;

    rotY += dx * 0.4;
    rotX -= dy * 0.4;

    if (rotX > 85) rotX = 85;
    if (rotX < -85) rotX = -85;

    lastX = x;
    lastY = y;

    applyTransform();
    e.preventDefault();
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    sceneMain.classList.remove("dragging");
    sceneCorner.classList.remove("dragging");
  }

  function initDrag(scene) {
    scene.addEventListener("mousedown", onDown);
    scene.addEventListener("touchstart", onDown, { passive: false });
  }

  function init() {
    applyTransform();

    initDrag(sceneMain);
    initDrag(sceneCorner);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchcancel", onUp);
  }

  window.addEventListener("DOMContentLoaded", init);
})();
