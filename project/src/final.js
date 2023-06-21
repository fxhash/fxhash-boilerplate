// we defined a function here to make it easy for you to undersand the

import { drawLines } from "./shared";

// rendering logic; you are free to use you own code structure
export default function final() {
  const cvs = document.getElementById("canvas");
  const ctx = cvs.getContext("2d");
  cvs.width = cvs.height = 512;
  ctx.scale(512, 512);

  const X = $fx.getParam("x");
  const Y = $fx.getParam("y");
  const size = $fx.getParam("size");
  ctx.clearRect(0, 0, 1, 1);

  drawLines(ctx, X, 1 - Y, size);
}
