// we defined a function here to make it easy for you to undersand the

import { drawLines } from "./shared";

// rendering logic; you are free to use you own code structure
export default function minting() {
  const cvs = document.getElementById("canvas");
  const ctx = cvs.getContext("2d");
  cvs.width = cvs.height = 512;
  ctx.scale(512, 512);

  const details = document.getElementById("details");

  let mouseActive = false;

  // draw grid for style
  function drawGrid() {
    ctx.lineWidth = 1;
    ctx.fillStyle = "blue";
    for (let x = 1 / 24; x <= 1; x += 1 / 24) {
      ctx.fillRect(x, 0, 1 / 1024, 1.0);
    }
    for (let y = 1 / 24; y <= 1; y += 1 / 24) {
      ctx.fillRect(0, y, 1.0, 1 / 1024);
    }
  }

  // draw the coordinates indicator, ie "pointer"
  function drawPointer(x, y, size) {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, 1.0 - y, size, 0, 2 * Math.PI);
    ctx.fill();
  }

  // re-draws everything
  function draw() {
    // ! important !!!!!
    // we reset fxrand because otherwise we would get the next values in the
    // line, while we always want the first values
    $fx.rand.reset();

    // [X, Y, size] will have the up-to-date param values
    const X = $fx.getParam("x");
    const Y = $fx.getParam("y");
    const size = $fx.getParam("size");

    // draw everything
    ctx.clearRect(0, 0, 1, 1);
    drawGrid();
    drawPointer(X, Y, size);
    drawLines(ctx, X, 1 - Y, size);

    // ui feedback
    details.innerHTML = `
      <strong>coordinates:</strong> <span>[${X.toFixed(3)}; ${Y.toFixed(
      3
    )}]</span>
      <strong>size:</strong> <span>${size.toFixed(3)}</span>
    `;
  }
  draw();

  // this function takes mouse position as an input, and pushes normalized
  // coordinates in the canvas space as parameters
  function refreshPosition(mouseX, mouseY) {
    const bounds = cvs.getBoundingClientRect();
    const x = clamp01((mouseX - bounds.x) / bounds.width);
    const y = 1.0 - clamp01((mouseY - bounds.y) / bounds.height);

    $fx.emit("params:update", {
      x: x,
      y: y,
    });
  }

  // handle coordinates moudulation with mouse drag
  cvs.addEventListener("mousedown", (evt) => {
    mouseActive = true;
    refreshPosition(evt.clientX, evt.clientY);
  });
  window.addEventListener("mouseup", () => {
    mouseActive = false;
  });
  window.addEventListener("mouseleave", () => {
    mouseActive = false;
  });
  window.addEventListener("mousemove", (evt) => {
    if (mouseActive) {
      refreshPosition(evt.clientX, evt.clientY);
    }
  });

  // handle size modulation with mouse wheel
  cvs.addEventListener("wheel", (evt) => {
    $fx.emit("params:update", {
      size: $fx.getParam("size") - evt.deltaY * 0.0005,
    });
  });

  // when the params are updated, then re-draw
  $fx.on(
    "params:update",
    // we do nothing when the event is received
    () => {},
    // once the params are updated and available, we trigger a draw
    () => {
      draw();
    }
  );
}

// utilities
function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}
function clamp01(x) {
  return clamp(x, 0, 1);
}
