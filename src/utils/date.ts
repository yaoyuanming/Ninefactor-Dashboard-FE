/**
 * 日期时间格式化工具函数
 */

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss 格式
 * @param dateStr 日期字符串或 Date 对象
 * @returns 格式化后的日期时间字符串，如果输入为空则返回 '-'
 */
export function formatDateTime(
  dateStr: string | Date | null | undefined
): string {
  if (!dateStr) return '-';

  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param dateStr 日期字符串或 Date 对象
 * @returns 格式化后的日期字符串，如果输入为空则返回 '-'
 */
export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '-';

  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
