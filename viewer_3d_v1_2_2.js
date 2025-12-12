
// v1.2.2N - face remap demo

const REMAP = {
  R: "F",
  F: "L",
  L: "B",
  B: "R",
  U: "U",
  D: "D"
};

function execMove(m){
  console.log("Execute:", m, "=> actual face:", REMAP[m[0]]);
}

document.querySelectorAll("button").forEach(b=>{
  b.onclick=()=>execMove(b.dataset.m);
});
