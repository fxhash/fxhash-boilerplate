// we defined a function here to make it easy for you to undersand the
// rendering logic; you are free to use you own code structure
export default function minting() {
  const cvs = document.createElement("canvas");
  const ctx = cvs.getContext("2d");
  cvs.width = cvs.height = 512;

  document.body.appendChild(cvs);

  ctx.scale(512, 512);

  let mouseActive = false;

  function drawGrid() {
    ctx.lineWidth = 1;
    ctx.fillStyle = "blue";

    for (let x = 1 / 24; x <= 1; x += 1 / 24) {
      ctx.fillRect(x, 0, 1 / 512, 1.0);
    }
    for (let y = 1 / 24; y <= 1; y += 1 / 24) {
      ctx.fillRect(0, y, 1.0, 1 / 512);
    }
  }

  function drawPointer() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc($fx.getParam("x"), $fx.getParam("y"), 0.02, 0, 2 * Math.PI);
    ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, 1, 1);
    drawGrid();
    drawPointer();
  }
  draw();

  cvs.addEventListener("mousedown", (evt) => {
    mouseActive = true;
    const bounds = cvs.getBoundingClientRect();
    const x = clamp01((evt.clientX - bounds.x) / bounds.width);
    const y = clamp01((evt.clientY - bounds.y) / bounds.height);

    $fx.emit("params:update", {
      x: x,
      y: y,
    });
  });

  window.addEventListener("mouseup", () => {
    mouseActive = false;
  });

  window.addEventListener("mouseleave", () => {
    mouseActive = false;
  });

  window.addEventListener("mousemove", (evt) => {
    if (mouseActive) {
      const bounds = cvs.getBoundingClientRect();
      const x = clamp01((evt.clientX - bounds.x) / bounds.width);
      const y = clamp01((evt.clientY - bounds.y) / bounds.height);

      $fx.emit("params:update", {
        x: x,
        y: y,
      });
    }
  });

  $fx.on(
    "params:update",
    (...args) => {
      console.log(args);
    },
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
