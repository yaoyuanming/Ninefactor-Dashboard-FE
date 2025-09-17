function lngLatToPixel(map: any, AMap: any, lnglat: [number, number]) {
  const pixel = map.lngLatToContainer(new AMap.LngLat(lnglat[0], lnglat[1]));
  return { x: pixel.getX(), y: pixel.getY() };
}

export default function drawBoundaryWithCanvas(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  map: any,
  AMap: any,
  boundaries: [number, number][] | null,
  CanvasLayer: any
) {
  if (!boundaries || boundaries.length === 0) return;

  // 动态更新canvas尺寸
  const container = map.getContainer();
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 官方文档确认：boundaries 是 [[lng, lat], [lng, lat], ...] 二维数组
  ctx.beginPath();

  // 移动到第一个点
  const [lng0, lat0] = boundaries[0];
  const firstPixel = lngLatToPixel(map, AMap, [lng0, lat0]);
  ctx.moveTo(firstPixel.x, firstPixel.y);

  // 连接后续点
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < boundaries.length; i++) {
    const [lng, lat] = boundaries[i];
    const pixel = lngLatToPixel(map, AMap, [lng, lat]);
    ctx.lineTo(pixel.x, pixel.y);
  }

  // 闭合路径
  ctx.closePath();

  // 发光效果设置
  ctx.shadowBlur = 25;
  ctx.shadowColor = '#1D64CA';

  // 先绘制发光层
  ctx.lineWidth = 800000;
  ctx.strokeStyle = '#1D64CA';
  ctx.stroke();

  // 再绘制实线层
  ctx.lineWidth = 3;
  ctx.shadowBlur = 0;
  ctx.stroke();

  // 正确刷新
  CanvasLayer.reFresh();
}
