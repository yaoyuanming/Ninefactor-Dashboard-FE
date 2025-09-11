/**
 * 通用防抖函数
 * @param fn 需要防抖的函数
 * @param delay 延迟时间（毫秒），默认500ms
 * @returns 防抖后的新函数
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay = 500): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
} 