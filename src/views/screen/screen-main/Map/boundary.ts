// 绘制函数
export default // 模拟边界绘制函数
function drawBoundaryWithCanvas(canvas, map, AMap, boundaries) {
  if (!boundaries || !boundaries.length) return;

  const ctx = canvas.getContext('2d');
  const size = map.getSize();

  // 确保canvas尺寸与地图一致
  if (canvas.width !== size.width) canvas.width = size.width;
  if (canvas.height !== size.height) canvas.height = size.height;

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 设置绘制样式
  ctx.strokeStyle = '#1796FA';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#1796FA';

  // 绘制每个边界
  boundaries.forEach((boundary) => {
    ctx.beginPath();

    boundary.forEach((lnglat, index) => {
      const pixel = map.lngLatToContainer(lnglat);
      if (index === 0) {
        ctx.moveTo(pixel.x, pixel.y);
      } else {
        ctx.lineTo(pixel.x, pixel.y);
      }
    });

    ctx.closePath();
    ctx.stroke();
  });
}
