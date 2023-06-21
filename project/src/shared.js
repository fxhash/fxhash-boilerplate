/**
 * Here goes the code that is shared between the standalone final version &
 * the minting UI;
 * In this case we just want to draw black lines.
 */

export function drawLines(ctx, x, y, size) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = size / 16;
  for (let i = 0; i < 50; i++) {
    const a = (i / 50) * 2 * Math.PI,
      c = Math.cos(a),
      s = Math.sin(a),
      L = 1 + 4 * $fx.rand();
    ctx.beginPath();
    ctx.moveTo(x + c * size, y + s * size);
    ctx.lineTo(x + c * size * L, y + s * size * L);
    ctx.stroke();
  }
}
