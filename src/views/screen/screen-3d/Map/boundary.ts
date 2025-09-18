// 绘制函数
export default function drawBoundaryWithCanvas(canvas, map, AMap, boundaries) {
  if (!boundaries || !boundaries.length) return;

  const ctx = canvas.getContext('2d');
  const size = map.getSize();

  // 确保canvas尺寸与地图一致
  if (canvas.width !== size.width) canvas.width = size.width;
  if (canvas.height !== size.height) canvas.height = size.height;

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ====== 专业级发光效果优化 ======
  boundaries.forEach((boundary) => {
    // 第1层：强发光基础（关键！）
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

    // 优化1：适当降低blur值（255太大，反而变淡）
    ctx.shadowBlur = 35; // 理想范围：25-45

    // 优化2：提高颜色透明度（让发光更集中强烈）
    ctx.shadowColor = 'rgba(0, 166, 255, 1)'; // alpha值提高到0.85

    // 优化3：使用透明线条，只显示阴影
    ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 第2层：核心边界线
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

    // 优化4：关闭边界线的阴影，避免重叠
    // ctx.shadowBlur = 0;
    ctx.strokeStyle = '#1796FA';
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}
