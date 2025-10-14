type TargetContext = '_self' | '_parent' | '_blank' | '_top';

export const openWindow = (
  url: string,
  opts?: { target?: TargetContext; [key: string]: any }
) => {
  const { target = '_blank', ...others } = opts || {};
  window.open(
    url,
    target,
    Object.entries(others)
      .reduce((preValue: string[], curValue) => {
        const [key, value] = curValue;
        return [...preValue, `${key}=${value}`];
      }, [])
      .join(',')
  );
};

export const regexUrl = new RegExp(
  '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
  'i'
);

export default function getImgWidthHeight(
  imageDetailList: any,
  basewidth = 300
) {
  const heights: any = [20, 20, 20, 20];
  return imageDetailList.map((image: any, index: number) => {
    // 获取图片的高度
    const sizeRegex = /--aspect [0-9]{1,2}:[0-9]{1,2}/;
    const size = image?.finalPrompt?.match(sizeRegex)?.[0];
    const s1 = size?.split(' ')?.[1]?.split(':')?.[0] || 1;
    const s2 = size?.split(' ')?.[1]?.split(':')?.[1] || 1;
    const textHeight = 20; // 文本高度 竖向间距
    const rowSpace = 20; // 横向间距
    const height =
      (basewidth / parseInt(s1, 10)) * parseInt(s2, 10) + textHeight;
    // 查找高度最低的
    let min: number = heights[0];
    let max: number = heights[0];
    let t = 0;
    heights.forEach((h: number, i: number) => {
      if (h < min) {
        t = i;
        min = h;
      }
      if (h > max) max = h;
    });
    if (max - min >= basewidth) {
      const newImage = {
        ...image,
        width: (basewidth + rowSpace) * t,
        height: heights[t],
        trueHeight: height - textHeight,
      };
      heights[t] += height;
      return newImage;
    }
    const newImage = {
      ...image,
      width: (basewidth + rowSpace) * (index % 4),
      height: heights[index % 4],
      trueHeight: height - textHeight,
    };
    heights[index % 4] += height;
    return newImage;
  });
}

export function getDrawConfigByString(config: string) {
  const configs = config.split('--');
  return {
    model: `--${configs[1]}`.trim(),
    size: `--${configs[2]}`.trim(),
  };
}
