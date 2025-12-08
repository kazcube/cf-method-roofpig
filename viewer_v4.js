let mode = "immediate";

async function randomScramble() {
  const s = await import("https://cdn.cubing.net/js/cubing/scramble");
  const scr = await s.scramble3x3();
  document.querySelector("#cube3").alg = scr;
  document.querySelector("#cube2").alg = scr;
}

function resetAll() {
  document.querySelector("#cube3").alg = "";
  document.querySelector("#cube2").alg = "";
}

function move(m) {
  const c3 = document.querySelector("#cube3");
  c3.alg = (c3.alg + " " + m).trim();
  const c2 = document.querySelector("#cube2");
  c2.alg = c3.alg;
}
